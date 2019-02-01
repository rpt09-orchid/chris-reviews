import React, { Component } from 'react';
import Rating from './Rating.jsx';
import styles from '../styles/AddReview.styles.css';
export default (props) => (
  <div className={styles.inputWrapper}>
    <div className={`${styles.controls} ${(props.addReviewVisible ? styles.active : '')}`}> 
      <div className={styles.left}>
        {!props.addReviewVisible ? '' : (
          <button>Submit</button>
        )}
        <button className={props.addReviewVisible ? styles.secondary : ''} onClick={props.onAddReviewbuttonClick}>{!props.addReviewVisible ? '+ Add A Review' : '× Cancel'}</button>
      </div>
      {!props.addReviewVisible ? '' : (
        <div className={styles.right}>
          <span className={styles.name}>{props.activeUser.name}</span> <img className={styles.avatar} src={props.activeUser.avatarUrl}/>
        </div>
      )}
      </div>
      
      {!props.addReviewVisible || !props.activeUser ? '' : (
        <div className={styles.mainInput}>
          <div className={styles.reviewsSelection}>
            <div className={styles.left}>
              <Rating name="Accuracy" avg={0} onChangeStar={(val) => {props.onChangeRating('acc', val)}} />
              <Rating name="Communication" avg={0} onChangeStar={(val) => {props.onChangeRating('com', val)}} />
              <Rating name="Cleanliness" avg={0} onChangeStar={(val) => {props.onChangeRating('cle', val)}} />
            </div>
            <div className={styles.right}>
              <Rating name="Location" avg={0} onChangeStar={(val) => {props.onChangeRating('loc', val)}} />
              <Rating name="Check-in" avg={0} onChangeStar={(val) => {props.onChangeRating('chk', val)}} />
              <Rating name="Value" avg={0} onChangeStar={(val) => {props.onChangeRating('val', val)}} />
            </div>
          </div>
        </div>
      )}

    {!props.addReviewVisible ? '' : (
      <textarea className={styles.textarea} placeholder='Type your awesome review here!'></textarea>
    )}
  </div>
);