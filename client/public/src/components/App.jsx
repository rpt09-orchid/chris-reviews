import React, { Component } from 'react';
import axios from 'axios';
import styles from '../styles/app.styles.css';
import AddReview from './AddReview.jsx';
import Reviews from './Reviews.jsx';
import ReviewsHeader from './ReviewsHeader.jsx';
import RatingsBox from './RatingsBox.jsx';
import SearchStatement from './SearchStatement.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ratings: null,
      id: null,
      error: false,
      reviews: null,
      keyWords: [],
      totalReviews: null,
      searchText: '',
      addReviewVisible: false,
      refreshUserRatings: false,
      reviewBody: '',
      userRatings: {},
      activeUser: {
        id: 1,
        name: '',
        avatarUrl: 'https://s3-us-west-2.amazonaws.com/chris-firebnb/defaults/default.png'
      }
    };
    this.handleState = this.handleState.bind(this);
    this.onAddReviewbuttonClick = this.onAddReviewbuttonClick.bind(this);
    this.onReviewBodyChange = this.onReviewBodyChange.bind(this);
    this.onChangeRating = this.onChangeRating.bind(this);
    this.onSubmission = this.onSubmission.bind(this);
    console.log('env:', process.env.NODE_ENV, 'docker:', process.env.IS_LOCAL_DOCKER);
    if (process.env.NODE_ENV === 'production') {
      this.HOSTS = {
        reviews: 'http://ec2-35-166-43-127.us-west-2.compute.amazonaws.com',
        rooms: 'http://ec2-13-52-103-229.us-west-1.compute.amazonaws.com'
      }
    } else {
      this.HOSTS = {
        reviews:  (process.env.IS_LOCAL_DOCKER) ? 'http://localhost' : 'http://localhost:3003',
        rooms: 'http://localhost:3001'
      }
    }

  }

  componentDidMount() {
    let path = window.location.pathname;
    
    if (!path.match(/^\/[0-9]+/)) {
      path = '/1';
    }

    this.setState({id: path.replace('/', '')}, () => {
      axios.get(`${this.HOSTS.rooms}/users${path}`)
        .then(res => res.data.data)
        .then(res => {
          this.setState({
            activeUser:{ 
              id: this.state.id,
              name: res.user,
              avatarUrl: res.avatar
            }
          });
        });
      this.getReviews(this.state.id);
    });
  }

  getReviews(id) {
    axios.get(`${this.HOSTS.reviews}/reviews/${id}`)
      .then(res => res.data)
      .then(res => {
        this.setState({ 
          ratings: res.ratings,
          reviews: res.reviews,
          totalReviews: res.reviews.length
        });
      });
  }

  onSubmission() {
    this.setState({error: false});
    axios.post(`${this.HOSTS.reviews}/reviews/${this.state.id}`, {
      review_body: this.state.reviewBody,
      user_id: this.state.activeUser.id,
      user_ratings: this.state.userRatings,
      property_id: this.state.id
      
    }).then((resp) => {
      console.log(resp);
      if (resp.data && resp.data.error) {
        this.setState({error: resp.data.error});
        return;
      } else {
        this.getReviews(this.state.id);
        this.setState({
            success: 'Review added!', 
            addReviewVisible: false, 
            reviewBody: '',
            userRatings: {}
          }, () => {
          setTimeout(() => {
            this.setState({success: false});
          }, 5000);
        })
      }
    }).catch((error) => {
      console.log('Error!', error);
      this.setState({error: error});
    });
  }

  onChangeRating(type, val) {
    const newRatings = Object.assign({}, this.state.userRatings);
    newRatings[type] = (val === this.state.userRatings[type]) ? 0 : val;
    this.setState({userRatings: newRatings});
  }

  onReviewBodyChange(e) {
    this.setState({
      reviewBody: e.target.value
    })
  }

  onAddReviewbuttonClick() {
    this.setState({
      addReviewVisible: !this.state.addReviewVisible
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
          <AddReview 
            success={this.state.success}
            error={this.state.error}
            activeUser={this.state.activeUser}
            addReviewVisible={this.state.addReviewVisible}
            onReviewBodyChange={this.onReviewBodyChange}
            onAddReviewbuttonClick={this.onAddReviewbuttonClick}
            onChangeRating={this.onChangeRating}
            onSubmission={this.onSubmission}
            userRatings={this.state.userRatings}
            refreshUserRatings={this.setState.refreshUserRatings}
            userRatings={this.state.userRatings}
          />
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