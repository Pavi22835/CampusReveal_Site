import React from 'react';
import { Star, MapPin, ChevronRight, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './collegeCard.css';

const CollegeCard = ({ college, index }) => {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  // ✅ NO HARDCODED BADGE LOGIC - Only show badge if explicitly provided by admin
  const getBadge = () => {
    // Only show badge if college has a badge property from API
    if (college.badge) {
      return { text: college.badge, bgColor: '#2563eb', icon: GraduationCap };
    }
    return null;
  };

  const badge = getBadge();
  const BadgeIcon = badge?.icon;

  // ✅ NO FALLBACK RATING - Show nothing if rating doesn't exist
  const getRating = () => {
    if (college.rating && college.rating > 0) {
      return college.rating.toFixed(1);
    }
    return null;
  };

  const rating = getRating();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="college-card-premium"
      onClick={() => requireAuth(() => navigate(`/university/${college.id}`))}
    >
      {/* Image Section */}
      <div className="card-image-wrapper">
        {college.image ? (
          <img 
            src={college.image} 
            alt={college.name || 'College'} 
            className="card-image"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.target.style.display = 'none';
              const placeholder = e.target.nextSibling;
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="card-image-placeholder" style={{ display: college.image ? 'none' : 'flex' }}>
          <GraduationCap size={32} className="placeholder-icon" />
        </div>
        
        {/* Badge - Only show if provided by admin */}
        {badge && (
          <div className="card-badge" style={{ backgroundColor: badge.bgColor }}>
            <BadgeIcon size={10} />
            <span>{badge.text}</span>
          </div>
        )}
        
        {/* Rating Badge - Only show if rating exists */}
        {rating && (
          <div className="card-rating">
            <Star size={12} className="star-icon" fill="#f59e0b" />
            <span>{rating}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="card-content">
        <h3 className="card-title">
          {college.name}
        </h3>
        
        {/* Location - Only show if exists */}
        {(college.location || college.city) && (
          <div className="card-location">
            <MapPin size={14} className="pin-icon" />
            <span>{college.location || college.city}</span>
          </div>
        )}

        {/* Footer with action button */}
        <div className="card-footer">
          <button className="card-action-btn">
            Details 
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CollegeCard;