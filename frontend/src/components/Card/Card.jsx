import React from 'react';
import './card.css';

const Card = ({ title, description, image, rating }) => {
  return (
    <div className="modern-card">
      {image && <img src={image} alt={title} className="modern-card-image" />}
      <div className="modern-card-content">
        {rating && <span className="modern-card-rating">★ {rating}</span>}
        <h3 className="modern-card-title">{title}</h3>
        <p className="modern-card-description">{description}</p>
      </div>
    </div>
  );
};

export default Card;
