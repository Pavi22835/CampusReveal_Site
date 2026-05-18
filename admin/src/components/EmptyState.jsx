import React from 'react';
import './EmptyState.css';

const EmptyState = ({ title, message, icon = '📭' }) => {
  return (
    <div className="empty-state">
      <div className="empty-state__content">
        <div className="empty-state__icon">{icon}</div>
        <h3 className="empty-state__title">{title}</h3>
        <p className="empty-state__message">{message}</p>
      </div>
    </div>
  );
};

export default EmptyState;
