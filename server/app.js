const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const db =  (process.argv[2] === '--db=cassandra') ? require('../db/cassandra.js') :  require('../db/psql.js') ;
const path = require('path');
const cors = require('cors');
//setup env variavles
require('dotenv').config();
 
//Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use('/', express.static(path.join(__dirname, '/../client/dist')));
app.use((req, res, next) => {
  res.sendSuccessJSON = (data) => {
    res.status(200).send(JSON.stringify({status: 'success', data: data}));
  };
  res.sendErrorJSON = (error) => {
    res.status(200).send(JSON.stringify({status: 'error', error: error}));
  };
  next();
})
 
 
app.get('/:id(\\d+$)*?', (req, res) => {
  
  res.status(200).sendFile(path.join(__dirname, '/../client/dist/index.html'));
});
 
app.get('/reviews/:id(\\d+$)', async (req, res) => {
  const id = JSON.parse(req.params.id) || 1;
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
      const avgRating = await db.getAverageRatings(reviews.map((review) => {
        return review.id;
      }));
      if (!reviews.length) {
        res.status(404).json({error: `ID ${id} does not exist`});
        return;
      } else {
        res.json({
          ratings: avgRating,
          reviews: reviews
        });
      }
    } catch(err) {
      res.status(404).json({error: `ID ${id} does not exist: ${err}`});
      console.log('err in process: ', err);
    } 
  }
});

app.post('/reviews/:id', async (req, res) => {
  const requiredAttributes = ['review_body', 'user_ratings', 'property_id', 'user_id'];
  const requiredRatings = {
    'acc': 'Accuracy',
    'com': 'Communication',
    'cle': 'Cleanliness',
    'loc': 'Location',
    'chk': 'Check-In',
    'val': 'Value'};
  const missingFields = requiredAttributes.filter((key) => {
    return (req.body[key] === undefined || !req.body[key])
  });
  if (missingFields.length) {
    res.sendErrorJSON('Missing required fields: ' + missingFields.map((key) => {
      return key.replace(/_\w/g, (val) => 
        {
          return ' ' + val.slice(1).toUpperCase();
      }).replace(/^\w/, (val) => {
        return val.toUpperCase();
      })}).join(', '));
  } else {
    const missingRatings = Object.keys(requiredRatings).filter((key) => {
      return req.body.user_ratings[key] === undefined;
    });
    if (missingRatings.length) {
      res.sendErrorJSON('Missing required rating fields: ' + 
      missingRatings.map((key) => {
        return requiredRatings[key];
      }).join(', '));
      return;
    }
    try {
      await db.createReview(req.body);
      res.sendSuccessJSON(req.body);
    } catch (e) {
      res.sendErrorJSON(e.toString());
    }
  
  }
});
 
app.get('/ratings/:id', async (req, res) => {
  const id = JSON.parse(req.params.id);
 
  try {
    const reviews = await db.getReviewsById(id);
    let avgRating, numReviews;
    if (reviews.length) {
      avgRating = await db.getAverageRatings(reviews.map((review) => {
        return review.id;
      }));
      numReviews = await db.getNumberReviewsById(id);
    } else {
      res.status(404).json({error: `ID ${id} does not exist`});
      return;
    }

    res.json({
      avgRating: Number(avgRating.avg),
      numReviews:  JSON.parse(numReviews[0].count)
    });
  } catch(err) {
    res.status(404).json({error: `ID ${id} does not exist: ${err}`});
  }
});
 
app.get('*', (req, res) => {
  
  res.status(404).json({error: `${req.url} Not found`});
});

 
module.exports = app;