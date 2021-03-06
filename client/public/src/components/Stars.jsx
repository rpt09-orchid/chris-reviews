import React from 'react';
import styles from '../styles/stars.styles.css';



class Stars extends React.Component {
  
  constructor({average, onChangeStar, interactive, wprClass}) {
    super();
    this.wprClass = wprClass;
    this.interactive = interactive;
    this.average = Math.round(Number(Math.floor(average*2)/2) * 2) / 2;
    this.timer = null;
    this.state = {
      hoveringOn: 0
    };
    ['mouseOut', 'getValue', 'mouseOver', 'getStarType'].map((method) => {
      this[method] = this[method].bind(this);
    })
  }

  mouseOut() {
    if (this.interactive) {
      clearInterval(this.timer);
      this.timer = setTimeout(() => {
        this.setState({
          hoveringOn: 0
        });
      }, 100);
    }
  };

  getValue() {
    return (this.state.hoveringOn) ? this.state.hoveringOn : this.average;
  }

  mouseOver(newHover) {
    if (this.interactive) {
      clearInterval(this.timer);
      if (newHover) {
        this.setState({
          hoveringOn: newHover
        });
      }
    }
  };

  getStarType(rating) {
    let starType = styles.greyStar;
    if (this.interactive && this.state.hoveringOn) {
        if (rating <= this.average) {
          starType = styles.removalStar;
        } 
        if (this.state.hoveringOn >= rating) {
          starType = styles.hoverStar;
          if (this.average >= this.state.hoveringOn) { 
            if (this.state.hoveringOn <= this.average) {
              starType = styles.greenStar;
            }
          } else if (this.average < this.state.hoveringOn) {
            if (this.average >= rating) {
             starType = styles.greenStar;
            } else {
              starType = styles.hoverStar;
            }
          }
        } 
    } else {
      starType = (this.getValue() >= rating) ? styles.greenStar : styles.greyStar;
    }

    return starType;

  }


  componentWillUpdate(props) {
    this.average = Math.round(Number(Math.floor(props.average*2)/2) * 2) / 2;
  }
  
  render() {
    return (
      <div>
        <span 
          onMouseOver={() => {this.mouseOver()}}
          onMouseOut={() => {this.mouseOut()}}
          onClick={() => {if (this.props.onChangeStar) {this.props.onChangeStar(this.state.hoveringOn)}}}
        >
          {
            [...new Array(5)].map((star, index) => {
              return (
                <span key={index} className={`${styles.halfStarContainer} ${styles[this.wprClass] ?  styles[this.wprClass]  : ''} ${this.interactive  ? styles.interactive : ''}`}>
                  <span 
                    className={this.getStarType(index + 0.5)} 
                    onMouseOver={() => {this.mouseOver(index + 0.5)}}

                  >
                  <svg 
                      viewBox="0 0 500 1000" 
                      role="presentation" 
                      aria-hidden="true" 
                      focusable="false" 
                      className={`${styles.star}`}>
                      <path d="M510.2 23.3l1 767.3-226.1 172.2c-25 17-59 12-78-12-12-16-15-33-8-51l86-278.1L58 447.5c-21-17-28-39-19-67 8-24 29-40 52-40h280.1l87-278.1c7.1-23.1 28.1-39.1 52.1-39.1z"></path>
                    </svg>
                  </span>
                  <span 
                    className={this.getStarType(index + 1)} 
                    onMouseOver={() => {this.mouseOver(index + 1)}}
                  >
                    <svg 
                      viewBox="0 0 500 1000" 
                      role="presentation" 
                      aria-hidden="true" 
                      focusable="false" 
                      className={`${styles.star} ${styles.flipped}`}>
                      <path d="M510.2 23.3l1 767.3-226.1 172.2c-25 17-59 12-78-12-12-16-15-33-8-51l86-278.1L58 447.5c-21-17-28-39-19-67 8-24 29-40 52-40h280.1l87-278.1c7.1-23.1 28.1-39.1 52.1-39.1z"></path>
                    </svg>
                  </span>
                </span>
              );
            })
          }
        </span>
      </div>
    );
  }
};

export default Stars;