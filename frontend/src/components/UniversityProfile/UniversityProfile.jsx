import React from 'react';
import './universityProfile.css';

const UniversityProfile = ({ university }) => {
  if (!university) return null;

  return (
    <section className="university-profile">
      <div className="container">
        <div className="profile-content">
          <div className="profile-main">
            <h1>{university.name}</h1>
            <div className="location">
              📍 {university.location || `${university.city || 'Tamil Nadu'}, India`}
            </div>
            <div className="rating-followers">
              <div className="rating">
                ⭐ {university.rating || '4.5'} Rating
              </div>
              <div className="followers">
                <strong>15.2k</strong> Followers
              </div>
            </div>
          </div>
          
          <div className="profile-actions">
            <button className="follow-btn">Follow</button>
            <button className="share-profile-btn">Share</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniversityProfile;
