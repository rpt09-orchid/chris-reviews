import React, { Component } from 'react';
import Rating from './Rating.jsx';
import Stars from './Stars.jsx';
import styles from '../styles/AddReview.styles.css';

const calcAverage = (userRatings) => {
  const ratingKeys = Object.keys(userRatings);
  const retVal = !ratingKeys.length ? 0 : ratingKeys.reduce((acc, key) => {
    acc += Number(userRatings[key]);
    return acc;
  }, 0) / 6;
  return retVal;
}

export default (props) => (
  <div className={styles.inputWrapper}>
    <div className={`${styles.controls} ${(props.addReviewVisible ? styles.active : '')}`}> 
      <div className={styles.left}>
        {!props.addReviewVisible ? '' : (
          <button onClick={props.onSubmission}>Submit</button>
        )}
        <button className={props.addReviewVisible ? styles.secondary : ''} onClick={props.onAddReviewbuttonClick}>{!props.addReviewVisible ? '+ Add A Review' : '× Cancel'}</button>
      </div>
      {!props.addReviewVisible ? '' : (
        <div className={styles.right}>
          <span className={styles.name}>{props.activeUser.name}</span> <img className={styles.avatar} src={props.activeUser.avatarUrl}/>
        </div>
      )}
      </div>
      {props.success ? (
        <div className={styles.successBox}> 
          {props.success}
        </div>
      ) :''
      }
      {!props.addReviewVisible || !props.activeUser ? '' : (
        <div className={styles.mainInput}>
          {props.error ? (
            <div class={styles.errorBox}>
              {props.error}
            </div>
          ) : ''}
          <div className={styles.reviewsSelection}>
            <div className={styles.left}>
              <Rating name="Accuracy" avg={props.userRatings.acc} interactive={true} onChangeStar={(val) => {props.onChangeRating('acc', val)}} />
              <Rating name="Communication" avg={props.userRatings.com} interactive onChangeStar={(val) => {props.onChangeRating('com', val)}}   />
              <Rating name="Cleanliness" avg={props.userRatings.cle} interactive onChangeStar={(val) => {props.onChangeRating('cle', val)}} />
            </div>
            <div className={styles.right}>
              <Rating name="Location" avg={props.userRatings.loc} interactive onChangeStar={(val) => {props.onChangeRating('loc', val)}} />
              <Rating name="Check-in" avg={props.userRatings.chk} interactive onChangeStar={(val) => {props.onChangeRating('chk', val)}} />
              <Rating name="Value" avg={props.userRatings.val} interactive onChangeStar={(val) => {props.onChangeRating('val', val)}} />
            </div>
          </div>
        </div>
      )}

    {!props.addReviewVisible ? '' : (
      <div className={styles.textAreaWpr}>
        <textarea className={styles.textarea} placeholder='Type your awesome review here!' onChange={props.onReviewBodyChange}>
        </textarea>
          <Stars name="Average" wprClass="greyMode" average={calcAverage(props.userRatings)} />
      </div>
    )}
  </div>
);