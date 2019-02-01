const pg = require('pg');
const { Pool } = require('pg');
require('dotenv').config();
  
const connection = {
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
};
  
// Connecting DB
const client = new Pool(connection);
  
// Converting numeric str type to number in postGres
const PG_DECIMAL_OID = 1700;
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat);
  
// DB functions
module.exports = {
  queryDB: function(query) {
    return new Promise((resolve, reject) => {
      client.query(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.rows);
        }
      });
    });
  },
  getReviewsById: function(id) {
  
    // const queryStr = `SELECT * from reviews WHERE id=1`;
    const queryStr = `
    SELECT
        json_build_object(
          'property_id', property_id,
          'id', id,
          'user_id', user_id,
          'review', review,
          'date', date,
          'reply', reply,
          'reply_date', reply_date
        ) r FROM reviews
      WHERE property_id = ${id};`;
  
    return this.queryDB(queryStr).then((rows) => {
      return rows.map((item) => {return item.r; });
    }).then((data) => {
      return data.map((item) => {
        // create user
        item.user = {
          'id': item.review.user_id,
          'name': null,
          'avatarUrl': 'https://s3-us-west-2.amazonaws.com/chris-firebnb/defaults/default.png'
        };
        return item;
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
      Object.keys(rows[0]).filter((key) => {
        return (['review_id','id'].indexOf(key) === -1)
      }).forEach(rowKey => {
        averages[remap[rowKey]] = (rows.map((row) => {
          return row[rowKey];
        }).reduce((acc, item) => {
          return acc + item;
        }) / rows.length).toPrecision(2);
      });
      
      return averages;
    });
  },
  getNumberReviewsById: function(id) {
    const queryStr = `select count(*) from reviews where property_id = ${id}`;
    return this.queryDB(queryStr);
  },
  SearchReviewsByWords: function(words, id) {

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
  
    return this.queryDB(queryStr);
  }
};