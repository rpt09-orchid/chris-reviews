// db type
const DB_TYPE = (process.argv[2] === '--db=cassandra') ? 'cassandra' : 'psql';
const faker = require('faker');
const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv').parse;
const Promise = require('bluebird');
const exec = Promise.promisify(require('child_process').exec);
const _ = require('lodash');
require('dotenv').config({path: path.resolve(__dirname + '/../.env')});
 
let client;
 
if (DB_TYPE === 'psql') {
 
  const { Client } = require('pg');
  const connection = {
    user: process.env.DB_USER,
    host: process.env.HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
  };
 
  client = new Client(connection);
  client.connect();
 
} else if (DB_TYPE === 'cassandra') {
 
  cassandra = require('cassandra-driver');
  client = new cassandra.Client({
    contactPoints: ['127.0.0.1'], 
    keyspace: process.env.CASSANDRA_DB_NAME,
    localDataCenter: 'datacenter1'
  });
 
}
 
// amount of unique records to generate
const UNIQUE_RECORDS = 15000;
// total amount of records to add to databse
const TOTAL_RECORDS = 10000000;
// for cassandra, for speed we do multiple csvs at a time
const CASS_CSV_BATCH_SIZE = 100;
 
// ids for other services are random up to N
const MAX_USER_ID = 1000000;
const MIN_REVIEWS_AMOUNT = 1;
const MAX_REVIEWS_AMOUNT = 5;
 
const getAbsPath = (name) => {
  return __dirname + '/' + name;
}
 
const writeFile = async (name, contents) => {
  if (name.indexOf('/') !== -1) {
    const dir = __dirname + '/' + name.split('/').slice(0, -1).join('/');
    await Promise.promisify(fs.stat)(dir).catch(async (err) => {
      if (err) {
        console.log('making folder..' + dir);
        await Promise.promisify(fs.mkdir)(dir, { recursive: true }).catch((err) => {
        console.log('error occurred making directory.', err);
        });
      }
    });
 
  }
 
  await Promise.promisify(fs.writeFile)(__dirname + '/' + name, contents, 'utf8');
}
 
const dbQuery = (cmd, args) => {
  if (DB_TYPE === 'cassandra') {
    return client.execute(cmd, args,  { prepare: true });
  } else if (DB_TYPE === 'psql') {
    return client.query(cmd, args);
  }
}
 
const outputProgress = ({tableName, startTime, startIndex, recordAdjustment=0, endIndex,numericalInfo, maxOutAt=100, iterations, text=''}) => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  const BAR_SIZE = 20;
  const progBar = [...Array(BAR_SIZE).keys()].map((bar) => {
      return (bar < (Math.floor(startIndex / (iterations - 1) * BAR_SIZE))) ? '\x1b[46m ' : '\x1b[47m '
  }).join('') + '\x1b[0m';
  const timeElapsed =  `\x1b[32m${(Date.now() - startTime) / 1000}s\x1b[0m`;
  process.stdout.write(`Generating '${tableName}' ${numericalInfo} Records: ${(startIndex + recordAdjustment) * UNIQUE_RECORDS + 1 } - ` +
  `${((endIndex + recordAdjustment) * UNIQUE_RECORDS)} ${text} ${progBar} ${timeElapsed} (${Math.min(maxOutAt, Math.floor(startIndex / (iterations - 1) * 100))}%)..` + 
  `${(Math.floor(startIndex / (iterations - 1) * 100 === 100)) ? '👌   ' : ''}`);
}

const createIndexes = async (tableName) => {
  if (tableName === 'reviews') {
    const indexStartTime = Date.now();
    console.log('\ncreating index on property id..');
    try {
      tableName = (DB_TYPE === 'cassandra') ? `${process.env.CASSANDRA_DB_NAME}.${tableName}` : tableName;
      await dbQuery(`CREATE INDEX property_idx ON ${tableName} (property_id)`);
      console.log(`Index Created! \x1b[32m${(Date.now() - indexStartTime) / 1000}s\x1b[0m`);
      return true;
    } catch (e) {
      console.error('ERR: Index creation failed.');
      return false;
    }
  }
}
 
const doIterations = async (csv, iterations, tableName, records, numericalInfo) => {
  let cassCsvStack = [];
  let cassCurrentErrorTry = 0;
  let cassMaxTries = 5;
  let cassCsvBatchCount = 1;
  const cassTotalCsvBatches = Math.ceil((TOTAL_RECORDS / UNIQUE_RECORDS / CASS_CSV_BATCH_SIZE));
  let cassCsvBatchInfo;
  const startTime = Date.now();
  const lastIteration = iterations - 1;
  let origCsv = csv;
  let timer;
  for (let j of [...Array(iterations).keys()]) {
    csv = origCsv.replace(/\{\d+\}/g, (val) => {
      return Number(val.replace(/\{|\}/g, '')) + (j * UNIQUE_RECORDS);
    });
    cassCsvBatchInfo = `(csv batch #${cassCsvBatchCount}/${cassTotalCsvBatches})`;
 
    if (DB_TYPE === 'cassandra') {
      /**
       * CASSANDRA:  write to multiple (n) csvs and run COPY for those after (n) batches
       */
 
      //  write csvs
      cassCsvStack.unshift(`csvs/${tableName}-${j}.csv`);
      await writeFile(cassCsvStack[0], csv);
 
 
      outputProgress({
        text:`Creating '${cassCsvStack[0]}' (${cassCsvStack.length}/${CASS_CSV_BATCH_SIZE}) ${cassCsvBatchInfo}`, 
        tableName, 
        startTime, 
        startIndex: j, 
        endIndex: j + 1,
        numericalInfo, 
        iterations
      });  
 
      if (cassCsvStack.length >= CASS_CSV_BATCH_SIZE || j === lastIteration) {
 
        // write query to disk
        const query = `COPY 
        ${`${process.env.CASSANDRA_DB_NAME}.${tableName}`}(${Object.keys(records[0]).join(',')})
        FROM '${cassCsvStack.map(csvFileName => {return getAbsPath(csvFileName)}).join(',')}' WITH HEADER=TRUE;`;
        await writeFile(`${tableName}.cql`, query);
 
        // do this because it takes a while...
        timer = setInterval(() => {
          outputProgress({
            text:`COPY routine to cassandra ${cassCsvBatchInfo}`, 
            tableName, 
            startTime, 
            startIndex: Math.floor((cassCsvBatchCount)  * (iterations / cassTotalCsvBatches)), 
            endIndex: Math.floor((cassCsvBatchCount + 1)  * (iterations / cassTotalCsvBatches)),
            recordAdjustment: -1,
            maxOutAt: 99,
            numericalInfo, 
            iterations
          });  
        }, 1000);
 
        const doCOPY = async (precommands='') => {
          // execute
          const originalCommand = `${precommands} cqlsh -f '${__dirname + '/' + tableName}.cql'`;
          // const newCommand = `cassandra-loader -f '${__dirname}/csvs' -host localhost -skipRows 1 -schema "${ process.env.CASSANDRA_DB_NAME}.${tableName}(${Object.keys(records[0]).join(',')})";`;
          await exec(originalCommand).catch(async (error) => {
            if (cassCurrentErrorTry < cassMaxTries) {
 
              cassCurrentErrorTry++;
              console.log('');
              console.log(error);
              console.error(`Uh oh an error occurred...will try again in 10 seconds (${cassCurrentErrorTry}/${cassMaxTries} tries)...`)
              await new Promise(resolve => setTimeout(resolve, 10000));
              await doCOPY('');
              return;
 
            } else {
 
              clearInterval(timer);
              for (let csvFileName of cassCsvStack) {
                await Promise.promisify(fs.unlink)(getAbsPath(csvFileName));
              }
              console.log('');
              console.error(`Uh oh an error occurred...max tries exceeded..aborting! `)
              console.error(error);
              process.exit();
 
            }
 
            console.log('');
          });
        }
        await doCOPY();
 
 
        clearInterval(timer);
       
        if (j === lastIteration) {
          outputProgress({
            text:`Finished! ${cassCsvBatchInfo})`, 
            tableName, 
            startTime, 
            startIndex: j, 
            endIndex: j + 1,
            numericalInfo, 
            iterations
          });  
          await Promise.promisify(fs.unlink)(getAbsPath(`${tableName}.cql`));
          await createIndexes(tableName);
          if (tableName === 'reviews') {
            console.log(`setting counter table to ${TOTAL_RECORDS + 1}...`);
            await dbQuery(`UPDATE counts set count=count+${TOTAL_RECORDS + 1} where table_name='reviews'`);
            console.log(`done!`);
          }
        }
        // cleanup
        for (let csvFileName of cassCsvStack) {
          await Promise.promisify(fs.unlink)(getAbsPath(csvFileName));
        }
        cassCsvStack = [];
        cassCsvBatchCount++;
      }
 
 
 
    } else if (DB_TYPE === 'psql') {
      /**
       * POSTGRES: write to single csv and run COPY in batches
       */
      await writeFile(`${tableName}.csv`, csv);
 
      outputProgress({
        tableName, 
        startTime, 
        startIndex: j, 
        endIndex: j + 1,
        numericalInfo, 
        iterations
      });
      const query = `COPY ${tableName}(${Object.keys(records[0]).join(',')})
      FROM '${getAbsPath(`${tableName}.csv`)}'  DELIMITER ',' CSV HEADER;`;
      await dbQuery(query);
 
      if (j === lastIteration) {
        await createIndexes(tableName);
        console.log(`cleanup..removing '${tableName}.csv'...`);
        await Promise.promisify(fs.unlink)(getAbsPath(`${tableName}.csv`));
        // client.end();
      }
 
    }
  }
};
 
const createTables = () => {
  const filePath = (DB_TYPE === 'cassandra') ? '/../db/cassandra.cql' : '/../db/postgres.sql';
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname + filePath), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).then((data) => {
    const sqlString = data.toString();
    let qs;
    if (DB_TYPE === 'cassandra') {
      // we have to do individual requests gahhh..
      const batchQueries = sqlString.split(';').slice(0, -1).map((query) => {
        return query;
      });
      (async () => {
        for (query of batchQueries) {
          await dbQuery(query);
        }
      })();
    } else if (DB_TYPE === 'psql'){
      qs = dbQuery(sqlString);
    }
    return qs;
  });
}
 
const getAverage = (ratings) => {
  return ((
    ratings.accuracy + 
    ratings.communication + 
    ratings.cleanliness + 
    ratings.location + 
    ratings.checkin + 
    ratings.value) / 6).toFixed(2);
}
 
const generateRecords = () => {
  const tables = {
    reviews: [],
    ratings: []
  };
 
  for (let i = 1; i < UNIQUE_RECORDS + 1; i++) {
    // let replied = Math.round(Math.random());
    let replied = _.random();
    let reviewsAmount =  _.random(MIN_REVIEWS_AMOUNT, MAX_REVIEWS_AMOUNT);
    let userId = _.random(1, MAX_USER_ID - 1);

    for (let j = 1; j < reviewsAmount + 1; j++) {
      tables.reviews.push({
        id:  `{${i + j - 1}}`,
        property_id: `{${i}}`,
        user_id: userId,
        date: faker.date.past(3),
        review: faker.lorem.paragraph(),
        reply: replied ? faker.lorem.paragraph() : '',
        reply_date: faker.date.past(3),
      });

      tables.ratings.push({
          id: `{${i + j - 1}}`,
          review_id: `{${i + j - 1 }}`,
          average: 0,
          accuracy: faker.random.number({min: 1, max: 5}),
          communication: faker.random.number({min: 1, max: 5}),
          cleanliness: faker.random.number({min: 1, max: 5}),
          location: faker.random.number({min: 1, max: 5}),
          checkin: faker.random.number({min: 1, max: 5}),
          value: faker.random.number({min: 1, max: 5})
      });
      
    }
    const lastIndex = tables.ratings.length - 1;
    tables.ratings[lastIndex].average = getAverage(tables.ratings[lastIndex]);
    i += reviewsAmount - 1;
  }
  return tables;
}
 
try {
    console.log('connected to db!');
    console.log('Starting seed..');
    const startTime = Date.now();
    console.log(`Generating ${UNIQUE_RECORDS} unique records each for reviews and ratings ..`);
    const tables = generateRecords();
    console.log(`Creating tables..`);
    let csvTime = null;
    try {
   
      createTables().then(async (value) => {
        console.log('Created tables!');
        for (let tableName of Object.keys(tables)) {
          const csvStartTime = Date.now();
          const records = tables[tableName];
          const numericalInfo = `(${Object.keys(tables).indexOf(tableName) + 1}/${Object.keys(tables).length})`;
          console.log('');
          console.log(`Generating csv data for table '${tableName}'${numericalInfo}..`);
          const csv = json2csv(records);
          csvTime = Date.now();
          const csvTimeElapsed =  `\x1b[32m${(Date.now() - csvStartTime) / 1000}s\x1b[0m`;
          console.log(`'${tableName}' data created! ${csvTimeElapsed}`);
          const iterations = Math.ceil(TOTAL_RECORDS / UNIQUE_RECORDS);
          await doIterations(csv, iterations, tableName, records, numericalInfo);
          console.log('');
 
        }
        const timeElapsed =  `\x1b[32m${(Date.now() - startTime) / 1000}s\x1b[0m`;
        console.log('\n');
        console.log(`done!`);
        console.log(`--------------`);
        console.log(`Records: ${TOTAL_RECORDS}`);
        console.log(`Unique Records: ${UNIQUE_RECORDS}`);
        console.log(`Total time: ${timeElapsed}`);
        process.exit();
      }).catch((error) => {
        throw error;
      })
    } catch (e) {
      throw e;
    }
} catch (e) {
  console.log('error: ',e);
}