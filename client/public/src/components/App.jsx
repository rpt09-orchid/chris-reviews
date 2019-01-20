import React, { Component } from 'react';
import axios from 'axios';
import styles from '../styles/app.styles.css';
import Reviews from './Reviews.jsx';
import ReviewsHeader from './ReviewsHeader.jsx';
import RatingsBox from './RatingsBox.jsx';
import SearchStatement from './SearchStatement.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ratings: null,
      reviews: null,
      keyWords: [],
      totalReviews: null,
      searchText: ''
    };
    this.handleState = this.handleState.bind(this);
    if (process.env.NODE_ENV === 'production') {
      this.HOSTS = {
        reviews: 'http://firebnb-reviews.8di9c2yryn.us-east-1.elasticbeanstalk.com',
        rooms: 'i dont know yet'
      }
    } else {
      this.HOSTS = {
        reviews: 'http://localhost:3003',
        rooms: 'http://localhost:3001'
      }
    }
  }


  componentDidMount() {
    let path = window.location.pathname;
    
    if (!path.match(/^\/[0-9]+/)) {
      path = '/1';
    }
    axios.get(`${this.HOSTS.reviews}/reviews${path}`)
      .then(res => res.data)
      .then(res => {
        this.setState({ 
          ratings: res.ratings,
          reviews: res.reviews,
          totalReviews: res.reviews.length
        });
      });
  }

  handleState(prop, newState) {
    this.setState({[prop]: newState});
  }

  render() {
    let searchStatement;
    if (this.state.keyWords.length) {
      searchStatement = (
        <SearchStatement 
          searchText={this.state.searchText}
          reviews={this.state.reviews}
          handleState={this.handleState}
        />
      )
    } else {
      searchStatement = (
        <RatingsBox avg={this.state.ratings}/>
      );
    }

    return (
      this.state.reviews ? (
        <div className={styles.reviews}>
          <ReviewsHeader
            reviews={this.state.totalReviews}
            average={this.state.ratings.avg}
            searchText={this.state.searchText}
            handleState={this.handleState}/>
          { searchStatement }
          <Reviews 
            HOSTS={this.HOSTS}
            reviews={this.state.reviews} 
            keyWords={this.state.keyWords}/>
        </div>
      ) : (
        <div>
          No reviews
        </div>
      )
    );
  }
}

export default App;