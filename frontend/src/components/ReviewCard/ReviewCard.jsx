import React from 'react';
import './reviewCard.css';

const ReviewCard = ({ review }) => {
  if (!review) return null;

  return (
    <div className="review-card">
      <div className="review-author">
        <div className="author-avatar">{review.author ? review.author.charAt(0) : 'U'}</div>
        <div className="author-info">
          <strong>{review.author || 'Anonymous'}</strong>
          <span>Class of {review.classYear || 'N/A'} • {review.major || 'General'}</span>
        </div>
      </div>
      
      <h4 className="review-title">{review.title || 'Student Perspective'}</h4>
      <p className="review-text">{review.content || 'No detailed review provided.'}</p>
      
      <div className="review-stats">
        <div className="pros">
          <span className="stat-label">Pro</span>
          <ul>
            {(review.pros || []).map((pro, idx) => (
              <li key={idx}>✓ {pro}</li>
            ))}
          </ul>
        </div>
        <div className="cons">
          <span className="stat-label">Con</span>
          <ul>
            {(review.cons || []).map((con, idx) => (
              <li key={idx}>✗ {con}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
