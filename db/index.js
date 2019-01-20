const pg = require('pg');
const client = require('../startup/database');

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
  clearRecords: function(tableNames) {
    return new Promise((resolve) => {
      tableNames.forEach((table, index) => {
        let queryStr = `DELETE FROM ${table} RETURNING *`;
        this.queryDB(queryStr);
        if (index === tableNames.length - 1) {
          resolve();
        }
      });

    });
  },
  getReviewsById: function(id) {
    // const queryStr = `select users.first as first, users.avatar as avatar, \
    // reviews.date as date, reviews.review as review, reviews.reply as reply, \
    // ratings.average as avgRate, ratings.accuracy as accRate, ratings.communication as commRate, \
    // ratings.cleanliness as cleanRate, ratings.location as locRate, ratings.checkin as checkinRate, \
    // ratings.value as valueRate from users \
    // join reviews \
    // on users.id = reviews.user_id \
    // join ratings \
    // on ratings.review_id = reviews.id \
    // where reviews.property_id = ${id}`;

    const queryStr = `
    select
        json_build_object(
          'propertyId', re.property_id,
          'user', json_build_object(
            'id', u.id,
            'name', u.first,
            'avatarUrl', u.avatar
          ),
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
      from public.users u
      join public.reviews re on u.id = re.user_id
      join public.ratings ra on re.id = ra.review_id
      where re.property_id = ${id};`;

    const query = {
      name: 'getReviewsById',
      text: queryStr
    };
    return this.queryDB(query);
  },
  getAverageRatings: function(id) {
    const queryStr = `select 
      json_build_object(
        'avg', round(avg (average) * 2, 0) / 2,
        'acc', round(avg (accuracy) * 2, 0) / 2,
        'com', round(avg (communication) * 2, 0) / 2,
        'cle', round(avg (cleanliness) * 2, 0) / 2,
        'loc', round(avg (location) * 2, 0) / 2,
        'che', round(avg (checkin) * 2, 0) / 2,
        'val', round(avg (value) * 2, 0) / 2
      ) a
      from ratings
      inner join reviews 
      on ratings.review_id = reviews.id
      where reviews.property_id = ${id}`;

    const query = {
      name: 'getAvgs',
      text: queryStr
    };
    return this.queryDB(query);
  },
  getNumberReviewsById: function(id) {
    const queryStr = `select count(*) from reviews where property_id = ${id}`;
    const query = {
      name: 'getnumReviews',
      text: queryStr
    };
    return this.queryDB(query);
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
          'user', json_build_object(
            'id', u.id,
            'name', u.first,
            'avatarUrl', u.avatar
          ),
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
      from public.users u
      join public.reviews re on u.id = re.user_id
      join public.ratings ra on re.id = ra.review_id
      where re.property_id = ${id}
      and (${likeText});`;

    console.log('queryStr: ', queryStr);
    const query = {
      name: 'searchReviewsByWords',
      text: queryStr
    };
    return this.queryDB(query);
  }
};