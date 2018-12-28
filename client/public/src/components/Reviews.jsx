import React from 'react';
import Review from './Review.jsx';

const Reviews = (props) => {
  console.log('reviews: ', props.reviews);
  return (
    <div className="reviewsContainer">
      {
        props.reviews.map((review, index) => {
          return <Review key={index} review={review} />
        })
      }
    </div>
  )
};

export default Reviews;