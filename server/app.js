const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('../db');
const path = require('path');
const utils = require('../utilities/utils');
const pool = require('../startup/database');
const cors = require('cors');


//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '/../client/dist'), {
  maxAge: '1y'
}));


const client = pool.connect(() => {
  console.log('connected to db!');
});

app.get('/reviews/:id(\\d+$)', async (req, res) => {
  const id = JSON.parse(req.params.id) || 1;
  console.log('query: ', req.query);
  let search, keyWords;
  if (req.query.search) {
    search = JSON.parse(req.query.search);

    if (req.query.keyWords) {
      keyWords = req.query.keyWords.split(',');
    }

    try {
      let reviews;
      if (search) {
        //Returns reviews only with keyWords 
        reviews = await db.SearchReviewsByWords(keyWords, id);
      } else {
        //Returns all reviews
        reviews = await db.getReviewsById(id);
      }
      res.json({reviews});
    } catch(err) {
      console.log('err: ', err);
      res.status(404).json({error: `search ${search} does not exist`});
    }
  } else {
    // Original get request.  Gets all data
    try {
      const reviews = await db.getReviewsById(id);
      const avgRating = await db.getAverageRatings(id);
      if (!reviews.length) {
        res.status(404).json({error: `ID ${id} does not exist`});
      } else {
        res.json({
          ratings: avgRating[0].a,
          reviews: reviews
        });
      }
    } catch(err) {
      res.status(404).json({error: `ID ${id} does not exist`});
      console.log('err in process: ', err);
    } 
  }
});

app.get('/ratings/:id', async (req, res) => {
  const id = JSON.parse(req.params.id);

  try {
    const avgRating = await db.getAverageRatings(id);
    const numReviews = await db.getNumberReviewsById(id);
    res.json({
      avgRating: avgRating[0].a.avg,
      numReviews: JSON.parse(numReviews[0].count)
    });
  } catch(err) {
    res.status(404).json({error: `ID ${id} does not exist`});
  }
});

app.get('*', (req, res) => {
  res.status(404).json({error: `${req.url} Not found`});
});


module.exports = app;