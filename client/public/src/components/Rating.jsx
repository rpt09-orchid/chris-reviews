import React, { Component } from 'react';
import Stars from './Stars.jsx';
import styles from '../styles/rating.styles.css';

const Rating = ({ name, avg, onChangeStar }) => {
  return (
    <div className={styles.ratingContainer}>
      <div className={styles.ratingContainerInner}>
        <div className={styles.ratingNameContainer}>
          <span className={styles.ratingName}>
            { name }
          </span>
        </div>
        <div className={styles.starsContainer}>
          <Stars average={avg} onChangeStar={onChangeStar} />
        </div>
      </div>
    </div>
  );
};

export default Rating;