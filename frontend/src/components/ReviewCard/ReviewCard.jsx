import React from 'react';
import './reviewCard.css';

const ReviewCard = ({ review }) => {
  if (!review) return null;
  
  // Check if review has any meaningful content
  const hasContent = review.content || review.pros?.length > 0 || review.cons?.length > 0;
  
  if (!hasContent) {
    return null;
  }

  return (
    <div className="review-card">
      <div className="review-author">
        <div className="author-avatar">{review.author ? review.author.charAt(0) : '?'}</div>
        <div className="author-info">
          {review.author && <strong>{review.author}</strong>}
          {(review.classYear || review.major) && (
            <span>
              {review.classYear && `Class of ${review.classYear}`}
              {review.classYear && review.major && ' • '}
              {review.major}
            </span>
          )}
        </div>
      </div>
      
      {review.title && <h4 className="review-title">{review.title}</h4>}
      
      {review.content && <p className="review-text">{review.content}</p>}
      
      {(review.pros?.length > 0 || review.cons?.length > 0) && (
        <div className="review-stats">
          {review.pros?.length > 0 && (
            <div className="pros">
              <span className="stat-label">Pro</span>
              <ul>
                {review.pros.map((pro, idx) => (
                  <li key={idx}>✓ {pro}</li>
                ))}
              </ul>
            </div>
          )}
          {review.cons?.length > 0 && (
            <div className="cons">
              <span className="stat-label">Con</span>
              <ul>
                {review.cons.map((con, idx) => (
                  <li key={idx}>✗ {con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;