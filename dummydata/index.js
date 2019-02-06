const faker = require('faker');
const _ = require('lodash');

const reviews = [];

for (let i = 1; i < 1001; i++) {
  // let replied = Math.round(Math.random());
  let replied = _.random();
  let propId = _.random(1, 101);
  reviews.push({
      property_id: propId,
      date: faker.date.past(),
      user_id: _.random(1, 101),
      review_id: i,
      review_text: faker.lorem.paragraph(),
      reply_text: replied ? faker.lorem.paragraph() : '',
      reply_date: faker.date.past(),
      ratings: {
        accuracy_rating: faker.random.number({min: 1, max: 5}),
        communication_rating: faker.random.number({min: 1, max: 5}),
        cleanliness_rating: faker.random.number({min: 1, max: 5}),
        location_rating: faker.random.number({min: 1, max: 5}),
        checkin_rating: faker.random.number({min: 1, max: 5}),
        value_rating: faker.random.number({min: 1, max: 5})
      }
    }
  );
}

module.exports = reviews;


