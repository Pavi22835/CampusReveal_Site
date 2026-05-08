import React from 'react';
import './locationInfo.css';

const LocationInfo = ({ university = {} }) => {
  return (
    <div className="location-info">
      <div className="location-section">
        <h3>Location</h3>
        <div className="walk-score">
          <span className="score-label">Walk Score:</span>
          <span className="score-value">{university.walkScore || '85'}</span>
        </div>
        <p className="walk-desc">{university.walkDescription || 'Very Walkable. Most errands can be accomplished on foot.'}</p>
        <div className="transit">
          <strong>{university.transit || 'Public Transit'}</strong>
          <span>{university.transitCost || '$2.75 / ride'}</span>
        </div>
      </div>
      
      <div className="fast-facts">
        <h3>Fast Facts</h3>
        <div className="facts-list">
          <div className="fact">
            <span className="fact-label">Acceptance Rate:</span>
            <span className="fact-value">{university.acceptanceRate || '15%'}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Median Salary:</span>
            <span className="fact-value">{university.medianSalary || '$75,000'}</span>
          </div>
          <div className="fact">
            <span className="fact-label">Financial Aid:</span>
            <span className="fact-value">{university.financialAid || '60% of students'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationInfo;
