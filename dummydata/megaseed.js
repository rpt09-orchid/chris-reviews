// const db = require('../db');
const faker = require('faker');
const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv').parse;
const Promise = require('bluebird');
const _ = require('lodash');
require('dotenv').config({path: path.resolve(__dirname + '/../.env')});


const connection = {
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
};

const { Client } = require('pg')

const client = new Client(connection);
client.connect();

const UNIQUE_RECORDS = 1000;
const TOTAL_RECORDS = 10000000;
const MAX_USER_ID = 1000000;
const MAX_PROPERTY_ID = 1000000;

const getAbsPath = (name) => {
  return __dirname + '/' + name;
}

const writeCSV = async (name, contents) => {
  await Promise.promisify(fs.writeFile)(__dirname + '/' + name, contents, 'utf8');
}

const doIterations = async (iterations, tableName, records, numericalInfo) => {
  const startTime = Date.now();
  for (let j of [...Array(iterations).keys()]) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    const BAR_SIZE = 20;
    const progBar = [...Array(BAR_SIZE).keys()].map((bar) => {
        return (bar < (Math.floor(j/(iterations - 1) * BAR_SIZE))) ? '\x1b[46m ' : '\x1b[47m '
    }).join('') + '\x1b[0m';
    const timeElapsed =  `\x1b[32m${(Date.now() - startTime) / 1000}s\x1b[0m`;
    process.stdout.write(`Generating '${tableName}' ${numericalInfo} Records: ${j * UNIQUE_RECORDS + 1} - ${((j + 1) * UNIQUE_RECORDS)} ${progBar} ${timeElapsed} (${Math.floor(j/(iterations - 1) * 100)}%)..${(Math.floor(j/(iterations - 1) * 100 === 100)) ? '👌   ' : ''}`);
    await client.query(`COPY 
      ${tableName}(${Object.keys(records[0]).join(',')})
      FROM '${getAbsPath(`${tableName}.csv`)}' DELIMITER ',' CSV HEADER;`
    );
  }
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname + '/../db/postgres.sql'), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).then((data) => {
    debugger;
    const sqlString = data.toString();
    const qs = client.query(sqlString);
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
    let propertyId = _.random(1, MAX_PROPERTY_ID - 1)
    let userId = _.random(1, MAX_USER_ID - 1);
  
    tables.reviews.push({
      // id: i,
      property_id: propertyId,
      user_id: userId,
      date: faker.date.past(3),
      review: faker.lorem.paragraph(),
      reply: replied ? faker.lorem.paragraph() : '',
      reply_date: faker.date.past(3),
    });
    tables.ratings.push({
        // review_id: i,
        average: 0,
        accuracy: faker.random.number({min: 1, max: 5}),
        communication: faker.random.number({min: 1, max: 5}),
        cleanliness: faker.random.number({min: 1, max: 5}),
        location: faker.random.number({min: 1, max: 5}),
        checkin: faker.random.number({min: 1, max: 5}),
        value: faker.random.number({min: 1, max: 5})
    });
    const lastIndex = tables.ratings.length - 1;
    tables.ratings[lastIndex].average = getAverage(tables.ratings[lastIndex]);
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
        console.log('Ceated tables!');
        for (let tableName of Object.keys(tables)) {
          const records = tables[tableName];
          const numericalInfo = `(${Object.keys(tables).indexOf(tableName) + 1}/${Object.keys(tables).length})`;
          console.log('');
          console.log(`Generating csv for table '${tableName}'${numericalInfo}..`);
          const csv = json2csv(records);
          csvTime = Date.now();
          await writeCSV(`${tableName}.csv`, csv);
          const csvTimeElapsed =  `\x1b[32m${(Date.now() - startTime) / 1000}s\x1b[0m`;
          console.log(`'${tableName}.csv' Created! ${csvTimeElapsed}`);
          console.log('Init COPY command..');
          const iterations = Math.ceil(TOTAL_RECORDS / UNIQUE_RECORDS);
          await doIterations(iterations, tableName, records, numericalInfo);
          console.log('');
          console.log(`cleanup..removing '${tableName}.csv'...`);
          await Promise.promisify(fs.unlink)(getAbsPath(`${tableName}.csv`));
        }
        const timeElapsed =  `\x1b[32m${(Date.now() - startTime) / 1000}s\x1b[0m`;
        console.log('\n');
        console.log(`done!`);
        console.log(`--------------`);
        console.log(`Records: ${TOTAL_RECORDS}`);
        console.log(`Unique Records: ${UNIQUE_RECORDS}`);
        console.log(`Total time: ${timeElapsed}`);
        client.end();
      }).catch((error) => {
        throw error;
      })
    } catch (e) {
      throw e;
    }
} catch (e) {
  console.log('error: ',e);
}