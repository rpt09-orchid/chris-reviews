const path = require('path');
require('dotenv').config({path: path.resolve(__dirname + '/../.env')});
const db = require('../db/psql.js');
const reviews = require('./index');
const fs = require('fs');
const Promise = require('bluebird');


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
    const sqlString = data.toString();
    return db.queryDB(sqlString);
  });
}

const insertAll = (reviews) => {
  return new Promise((resolve, reject) => {
    reviews.forEach(async (review, index) => {


      const prop_id = review.property_id;
      const {user_id, date} = review;
      debugger;
      const {review_text, reply_text, reply_date} = review;
      
      const queryReview = {
        name: 'insertReview',
        text: 'insert into reviews(property_id, user_id, date, review, reply, reply_date) values ($1, $2, $3, $4, $5, $6)',
        values: [prop_id, user_id, date, review_text, reply_text, reply_date]
      };
  
      const review_id = review.review_id;
      const { accuracy_rating, communication_rating, cleanliness_rating, location_rating, checkin_rating, value_rating} = review.ratings;
      const average_rating = ((accuracy_rating + communication_rating + cleanliness_rating + location_rating + checkin_rating + value_rating) / 6).toFixed(2);
      const queryRatings = {
        name: 'insertRatings',
        text: 'insert into ratings(review_id, average, accuracy, communication, cleanliness, location, \
          checkin, value) values ($1, $2, $3, $4, $5, $6, $7, $8)',
        values: [review_id, average_rating, accuracy_rating, communication_rating, cleanliness_rating,
          location_rating, checkin_rating, value_rating]
      };
  
      try {
        const insertReview = await db.queryDB(queryReview);
        const insertRating = await db.queryDB(queryRatings);
        if (index === reviews.length - 1) {
          resolve();
        }
      } catch(err) {
        reject(err);
      }
    });
  })
}


const main = (async () => {
  try {
    try {
      console.log('Initializing...');
      console.log('creating tables...');
      await createTables();
      console.log('saving to db...');
      await insertAll(reviews);
      console.log('data saved to db');
    } catch (err) {
      console.log('error occured in seeding: ', err);
    } finally {
      console.log('seeding complete');
      process.exit();
    }
  } catch(err) {
    console.log('error occured in connecting: ', err);
  }
})();
