import React from 'react';
import './locationInfo.css';

const LocationInfo = ({ university = {} }) => {
  // Helper to check if location data exists
  const hasLocationData = university.location || university.city || university.state || university.address;
  
  // Helper to check if any fast facts exist
  const hasFastFacts = university.acceptanceRate || university.placementRate || university.scholarshipAvailable;
  
  if (!hasLocationData && !hasFastFacts) {
    return null;
  }

  return (
    <div className="location-info">
      {/* Location Section - Only show if location data exists */}
      {hasLocationData && (
        <div className="location-section">
          <h3>Location</h3>
          <div className="location-address">
            {university.location || university.address || [university.city, university.state].filter(Boolean).join(', ')}
          </div>
        </div>
      )}

      {/* Fast Facts Section - Only show if facts exist */}
      {hasFastFacts && (
        <div className="fast-facts">
          <h3>Fast Facts</h3>
          <div className="facts-list">
            {university.acceptanceRate && (
              <div className="fact">
                <span className="fact-label">Acceptance Rate:</span>
                <span className="fact-value">{university.acceptanceRate}</span>
              </div>
            )}
            {university.placementRate && (
              <div className="fact">
                <span className="fact-label">Placement Rate:</span>
                <span className="fact-value">{university.placementRate}</span>
              </div>
            )}
            {university.scholarshipAvailable && (
              <div className="fact">
                <span className="fact-label">Scholarship:</span>
                <span className="fact-value">Available</span>
              </div>
            )}
            {university.hostelAvailable && (
              <div className="fact">
                <span className="fact-label">Hostel:</span>
                <span className="fact-value">Available {university.hostelType && `(${university.hostelType})`}</span>
              </div>
            )}
            {university.transportAvailable && (
              <div className="fact">
                <span className="fact-label">Transport:</span>
                <span className="fact-value">Available</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInfo;