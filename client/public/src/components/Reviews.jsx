import React, { Component } from 'react';
import Review from './Review.jsx';
// import JwPagination from 'jw-react-pagination';
import Pagination from './Pagination.jsx';

const customLabels = {
  'first': '<<',
  'last': '>>',
  'previous': '<',
  'next': '>'
};

const customStyles = {
  ul: {
    padding: '0px',
    marginBottom: '32px',
    marginTop: '0px',
    display: 'inline-block'
  },
  li: {
    border: '1px solid rgb(0, 132, 137)',
    width: '32px',
    height: '32px',
    position: 'relative',
    borderWidth: '1px',
    borderRadius: '16px',
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: '16px',
    marginLeft: '16px'
  },
  number: {
    listStyle: 'none',
    display: 'inline',
    textAlign: 'center',
    width: '32px',
    height: '32px',
    position: 'relative',
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: '16px',
    marginLeft: '16px'
  },
  a: {
    color: 'rgb(0, 132, 137)',
    top: '50%',
    left: '50%'
  }
};

class Reviews extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageOfItems: []
    };
    this.onChangePage = this.onChangePage.bind(this);
  }

  onChangePage(pageOfItems) {
    // update local state with new page of items
    this.setState({ pageOfItems });
  }

  render() {
    return (
      <div className="reviewsContainer">
        {
          this.state.pageOfItems.map((item, index) => {
            return (
              <Review 
                key={index} 
                review={item} 
                HOSTS={this.props.HOSTS}
                keyWords={this.props.keyWords}
              />
            );
          })
        }
        <Pagination 
          items={this.props.reviews} 
          onChangePage={this.onChangePage} 
          pageSize={7}
          labels={customLabels}
          styles={customStyles}
        />
      </div>
    );
  }
}

export default Reviews;