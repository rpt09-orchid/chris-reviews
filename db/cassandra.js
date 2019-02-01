require('dotenv').config();
const cassandra = require('cassandra-driver');


// Connecting DB
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'], 
  keyspace: process.env.CASSANDRA_DB_NAME,
  localDataCenter: 'datacenter1'
});

// DB functions
module.exports = {
  queryDB: function(query) {
    return new Promise((resolve, reject) => {
      client.execute(query, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.rows);
        }
      });
    });
  },
  getReviewsById: function(id) {
    const queryStr = `SELECT * FROM reviews WHERE property_id=${id}`;
    return this.queryDB(queryStr).then((data) => {
      
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