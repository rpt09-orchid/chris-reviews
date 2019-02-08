import React, { Component } from 'react';
import styles from '../styles/review.styles.css';
import replyStyles from '../styles/reply.styles.css';
import axios from 'axios';

import Words from './Words.jsx';
import Word from './Word.jsx';

class Reply extends Component {
  constructor(props) {
    super(props);
    this.state = {
      readMore: false,
      name: '',
      url: 'https://s3-us-west-2.amazonaws.com/chris-firebnb/defaults/default.png'
    };
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    const propertyId = this.props.propertyId;
    axios.get(`${this.props.HOSTS.rooms}/users/${propertyId}`)
      .then(res => res.data.data)
      .then(res => {
        if (res.user) {
          this.setState({ 
            name: res.user,
            url: res.avatar
          });
        }
      });
  }

  handleClick(props) {
    this.setState({
      readMore: true
    });
  }

  render() {
    let reply, splitReply;

    if (this.props.keyWords.length) {
      splitReply = this.props.reply.slice(0, 281).split(' ').map((word, index) => {
        return (
          <Word 
            word={word}
            keyWords={this.props.keyWords}
            key={index}
            index={index}/>
        )
      })
    } else {
      splitReply = <span>{this.props.reply.slice(0,281)}</span>
    }

    if (this.state.readMore) {
      reply =  <Words 
          text={this.props.reply}
          keyWords={this.props.keyWords}
          className={replyStyles.reply}/>
    } else {
      if (this.props.reply.length > 280) {
        reply = <div className={replyStyles.reply}>
          { splitReply }
          <span>...</span>
          <span className={styles.read} onClick={this.handleClick}>Read more</span>
        </div>
      } else {
        reply = <Words 
          text={this.props.reply}
          keyWords={this.props.keyWords}
          className={replyStyles.reply}/>
      }
    }
    return (
      <div className={replyStyles.inner}>
        <div className={replyStyles.avatarContainer}>
          <div className={replyStyles.avatarInner}>
            <div className={replyStyles.avatar}>
              <img 
                className={replyStyles.img} 
                src={this.state.url}
                height="40" 
                width="40" 
                alt={`${this.state.name}'s User Profile'`}
                title={`${this.state.name}'s User Profile'`}
              />
            </div>
          </div>
        </div>
        <div className={replyStyles.container}>
          <div className={replyStyles.response}>
            {`Response from ${this.state.name}`}
          </div>
          <div>
            { reply }
          </div>
          <div className={replyStyles.dateContainer}>
            <div className={replyStyles.date}>
              {this.props.mapDateText(this.props.replyDate)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Review extends Component {
  constructor(props) {
    super(props);
    this.state = {
      readMore: false
    };
    this.mapDateText = this.mapDateText.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  mapDateText(date) {
    const months = {
      '01': 'January',
      '02': 'February',
      '03': 'March',
      '04': 'April',
      '05': 'May',
      '06': 'June',
      '07': 'July',
      '08': 'August',
      '09': 'September',
      '10': 'October',
      '11': 'November',
      '12': 'December'
    };
    const splitDate = date.split('-');
    const yearMonth = splitDate.slice(0, 2);
    return '' + months[yearMonth[1]] + ' ' + yearMonth[0];
  }

  handleClick(props) {
    this.setState({
      readMore: true
    });
  }

  render() {
    const { property_id: propertyId } = this.props.review;
    const { name, avatarUrl } = this.props.review.user;
    const { date, review, reply, reply_date: replyDate } = this.props.review; 

    let reviewText, splitReview;

    if (this.props.keyWords.length) {
      splitReview = review.slice(0, 281).split(' ').map((word, index) => {
        return (
          <Word 
            word={word}
            keyWords={this.props.keyWords}
            key={index}
            index={index}/>
        )
      })
    } else {
      splitReview = <span>{review.slice(0,281)}</span>
    }

    if (this.state.readMore) {
      reviewText =  <Words 
          text={review}
          keyWords={this.props.keyWords}
          className={styles.text}/>
    } else {
      if (review.length > 280) {
        reviewText = <div className={styles.text}>
          { splitReview }
          <span>...</span>
          <span className={styles.read} onClick={this.handleClick}>Read more</span>
        </div>
      } else {
        reviewText = <Words 
          text={review}
          keyWords={this.props.keyWords}
          className={styles.text}/>
      }
    }

    return (
      <div>
        <div className={styles.userContainer}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              <img 
                className={styles.innerAvatar} 
                src={avatarUrl} 
                height="48" 
                width="48" 
              />
            </div>
          </div>
          <div className={styles.infoContainer}>
            <div className={styles.info}>
              <div className={styles.name} >{name}</div>
              <div className={styles.date} >{this.mapDateText(date)} </div>
            </div>
          </div>
          <div className={styles.flagContainer}>
            <div className={styles.flag}>
              <svg 
                viewBox="0 0 24 24" 
                role="img" 
                aria-label="Report" 
                focusable="false" 
                className={styles.svg}>
                <path 
                  d="m22.39 5.8-.27-.64a207.86 207.86 0 0 0 -2.17-4.87.5.5 0 0 0 -.84-.11 7.23 7.23 0 0 1 -.41.44c-.34.34-.72.67-1.13.99-1.17.87-2.38 1.39-3.57 1.39-1.21 0-2-.13-3.31-.48l-.4-.11c-1.1-.29-1.82-.41-2.79-.41a6.35 6.35 0 0 0 -1.19.12c-.87.17-1.79.49-2.72.93-.48.23-.93.47-1.35.71l-.11.07-.17-.49a.5.5 0 1 0 -.94.33l7 20a .5.5 0 0 0 .94-.33l-2.99-8.53a21.75 21.75 0 0 1 1.77-.84c.73-.31 1.44-.56 2.1-.72.61-.16 1.16-.24 1.64-.24.87 0 1.52.11 2.54.38l.4.11c1.39.37 2.26.52 3.57.52 2.85 0 5.29-1.79 5.97-3.84a.5.5 0 0 0 0-.32c-.32-.97-.87-2.36-1.58-4.04zm-4.39 7.2c-1.21 0-2-.13-3.31-.48l-.4-.11c-1.1-.29-1.82-.41-2.79-.41-.57 0-1.2.09-1.89.27a16.01 16.01 0 0 0 -2.24.77c-.53.22-1.04.46-1.51.7l-.21.11-3.17-9.06c.08-.05.17-.1.28-.17.39-.23.82-.46 1.27-.67.86-.4 1.7-.7 2.48-.85.35-.06.68-.1.99-.1.87 0 1.52.11 2.54.38l.4.11c1.38.36 2.25.51 3.56.51 1.44 0 2.85-.6 4.18-1.6.43-.33.83-.67 1.18-1.02a227.9 227.9 0 0 1 1.85 4.18l.27.63c.67 1.57 1.17 2.86 1.49 3.79-.62 1.6-2.62 3.02-4.97 3.02z" 
                  fillRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className={styles.textContainer}>
          { reviewText }
        </div>
        {
          reply ? (
            <div className={styles.replyContainer}>
              <Reply 
                HOSTS={this.props.HOSTS}
                mapDateText={this.mapDateText}
                reply={reply} 
                replyDate={replyDate}
                propertyId={propertyId}
                keyWords={this.props.keyWords}
              />
            </div>
          ) : null
        }
        <div className={styles.lineContainer}>
          <div className={styles.line}></div>
        </div>
      </div>
    );
  }
}

export default Review;