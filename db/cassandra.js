require('dotenv').config();
const cassandra = require('cassandra-driver');
const axios = require('axios');

let DB_HOST;

if (process.env.NODE_ENV === 'production' && process.env.NETWORK_MODE !== 'host') {
  DB_HOST = 'cassandra';
} else {
  DB_HOST = '127.0.0.1';
}

// Connecting DB
const client = new cassandra.Client({
  contactPoints: [DB_HOST], 
  keyspace: process.env.CASSANDRA_DB_NAME,
  localDataCenter: process.env.DATACENTER,
  loadBalancing: new cassandra.policies.loadBalancing.DCAwareRoundRobinPolicy( process.env.DATACENTER)
});

// DB functions
module.exports = {
  queryDB: function(query,  params=null) {
    return new Promise((resolve, reject) => {
      client.execute(query, params, { prepare : false }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.rows);
        }
      });
    });
  },
  createReview: async function(data) {
    const reviewCount = await this.queryDB(`SELECT count FROM counts WHERE table_name='reviews'`);
    data.id = reviewCount[0].count.low;
    await this.queryDB(`UPDATE counts SET count=count+1 WHERE table_name='reviews'`);
    const queryStr = `INSERT INTO reviews (id, property_id, user_id, date, review) VALUES (?, ?, ?, ?, ?)`;
    await this.queryDB(queryStr, [data.id, data.property_id, data.user_id, new Date().toJSON(), data.review_body]);
    const queryStr2 = `INSERT INTO ratings (id, review_id, average, accuracy, communication, cleanliness, location, checkin, value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const avg = this.calcAverage(data.user_ratings);

    await this.queryDB(queryStr2, [
      data.id, 
      data.id, 
      avg, 
      data.user_ratings.acc, 
      data.user_ratings.com, 
      data.user_ratings.cle,
      data.user_ratings.loc, 
      data.user_ratings.chk, 
      data.user_ratings.val
    ]);
  },
   calcAverage: function(userRatings) {
    const ratingKeys = Object.keys(userRatings);
    const retVal = !ratingKeys.length ? 0 : ratingKeys.reduce((acc, key) => {
      acc += Number(userRatings[key]);
      return acc;
    }, 0) / 6;
    return retVal;
  },
  getHosts: function() {
    let HOSTS = {};
    if (process.env.NODE_ENV === 'production') {
      HOSTS = {
        reviews: 'http://firebnb-reviews.8di9c2yryn.us-east-1.elasticbeanstalk.com',
        rooms: 'i dont know yet'
      }
    } else {
      HOSTS = {
        reviews: 'http://localhost:3003',
        rooms: 'http://localhost:3001'
      }
    }
    return HOSTS;
  },
   getUserData: function(id) {
    // return axios.get(`${this.getHosts().rooms}/users/${id}`)
    //   .then(res => res.data.data)
    //   .then(res => {
    //       return { 
    //         id: this.id,
    //         name: res.user,
    //         avatarUrl: res.avatar
    //       };
    //   });
      return { 
        id: this.id,
        name: null,
        avatarUrl: null
      };
  },
  
  getReviewsById: async function(id) {
    const queryStr = `SELECT * FROM reviews WHERE property_id=${id}`;
    return this.queryDB(queryStr).then(async (data) => {
      for (item of data) {
          // create user
          try {
            item.user = await this.getUserData(item.user_id);
          } catch (e) {
            item.user = {
              'id': item.user_id,
              'name': null,
              'avatarUrl': 'https://s3-us-west-2.amazonaws.com/chris-firebnb/defaults/default.png'
            };
          }
      }
      return data.sort((a, b) => {
        return b.id - a.id
      });
    });
  },
  getAverageRatings: function(ids) {
    const queryStr = `SELECT * FROM ratings where id IN (${ids.join(',')});`;
    const remap = {
      average: 'avg',
      accuracy: 'acc',
      communication: 'com',
      cleanliness: 'cle',
      location: 'loc',
      checkin: 'che',
      value: 'val'
    };
    
    return this.queryDB(queryStr).then((rows) => {
      const averages = {};
      if(rows[0]) {
        Object.keys(rows[0]).filter((key) => {
          return (['review_id','id'].indexOf(key) === -1)
        }).forEach(rowKey => {
          averages[remap[rowKey]] = (rows.map((row) => {
            return row[rowKey];
          }).reduce((acc, item) => {
            return acc + item;
          }) / rows.length).toPrecision(2);
        });
      }
      return averages;
    });
  },
  getNumberReviewsById: function(id) {
    const queryStr = `select count(*) from reviews where property_id = ${id}`;
    return this.queryDB(queryStr);
  },
  SearchReviewsByWords: function(words, id) {
    console.log('searching words');
    let likeText = '';
    if (!words.length) {
      likeText += " ' '";
    } else {
      words.forEach((word, index) => {
        if (!index) {
          likeText += ` re.review ilike '%${word}%' or re.reply ilike '%${word}%'`;
        } else {
          likeText += ` or re.review ilike '%${word}%' or re.reply ilike '%${word}%'`;
        }
      })
    }
 
    const queryStr = `
    select
        json_build_object(
          'propertyId', re.property_id,
          'review', json_build_object(
            'id', re.id,
            'review', re.review,
            'date', re.date,
            'reply', re.reply,
            'replyDate', re.reply_date,
            'rating', json_build_object(
              'avg', round(ra.average * 2, 0) / 2,
              'acc', ra.accuracy,
              'com', ra.communication,
              'cle', ra.cleanliness,
              'loc', ra.location,
              'che', ra.checkin,
              'val', ra.value
            )
          )
        ) r
        FROM public.reviews re INNER JOIN public.ratings ra ON ra.review_id = re.id
        WHERE re.property_id = ${id} and (${likeText});`;
 
    console.log('queryStr: ', queryStr);
    const query = {
      name: 'searchReviewsByWords',
      text: queryStr
    };
    return this.queryDB(query);
  }
};