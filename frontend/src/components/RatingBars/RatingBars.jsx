import React from 'react';
import './ratingBars.css';

const RatingBars = ({ ratings = [] }) => {
  const maxRating = 5;
  
  const defaultRatings = [
    { category: 'Academics', score: 4.5 },
    { category: 'Placements', score: 4.8 },
    { category: 'Infrastructure', score: 4.2 },
    { category: 'Campus Life', score: 4.7 },
  ];

  const displayRatings = ratings.length > 0 ? ratings : defaultRatings;
  
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
          <div className="rating-score">{item.score}</div>
        </div>
      ))}
    </div>
  );
};

export default RatingBars;
