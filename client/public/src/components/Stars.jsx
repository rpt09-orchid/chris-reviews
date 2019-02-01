import React from 'react';
import styles from '../styles/stars.styles.css';



class Stars extends React.Component {
  
  constructor({average}) {
    super();
    this.average = Math.round(Number(Math.floor(average*2)/2) * 2) / 2;
    this.timer = null;
    this.state = {
      hoveringOn: 0
    };
    ['mouseOut', 'getValue', 'mouseOver'].map((method) => {
      this[method] = this[method].bind(this);
    })
  }

  mouseOut() {
    clearInterval(this.timer);
    this.timer = setTimeout(() => {
      this.setState({
        hoveringOn: 0
      });
    }, 100);
  };

  getValue() {
    return (this.state.hoveringOn) ? this.state.hoveringOn : this.average;
  }

  mouseOver(newHover) {
    clearInterval(this.timer);
    console.log(newHover);
    if (newHover) {
      this.setState({
        hoveringOn: newHover
      });
    }
  };
  
  render() {
    return (
      <div>
        <span 
          onMouseOver={() => {this.mouseOver()}}
          onMouseOut={() => {this.mouseOut()}}
        >
          {
            [...new Array(5)].map((star, index) => {
              return (
                <span key={index} className={`${styles.halfStarContainer} ${styles.interactive}`}>
                  <span 
                    className={(this.getValue() >= index + 0.5)  ?  (this.state.hoveringOn ? styles.hoverStar : styles.greenStar) : styles.greyStar} 
                    data-rating={index + 0.5}
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
                    className={(this.getValue() >= index + 1)  ?  (this.state.hoveringOn ? styles.hoverStar : styles.greenStar): styles.greyStar} 
                    data-rating={index + 1}
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