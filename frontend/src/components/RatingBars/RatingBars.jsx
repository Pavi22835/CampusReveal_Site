import React from 'react';
import './ratingBars.css';

const RatingBars = ({ ratings = [] }) => {
  const maxRating = 5;
  
  // Only use real ratings from API, no default dummy data
  const displayRatings = ratings && ratings.length > 0 ? ratings : [];
  
  if (displayRatings.length === 0) {
    return null;
  }
  
  return (
    <div className="rating-bars">
      <h3>Student Verdict</h3>
      {displayRatings.map((item, index) => (
        <div key={index} className="rating-item">
          <div className="rating-label">{item.category}</div>
          <div className="rating-bar-container">
            <div 
              className="rating-bar-fill" 
              style={{ width: `${(item.score / maxRating) * 100}%` }}
            />
          </div>
          <div className="rating-score">{item.score.toFixed(1)}</div>
        </div>
      ))}
    </div>
  );
};

export default RatingBars;