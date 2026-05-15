import React from 'react';
import { Star, MapPin, ChevronRight, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './collegeCard.css';

const CollegeCard = ({ college, index }) => {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  // Determine badge based on category or college name
  const getBadge = () => {
    const name = (college.name || '').toLowerCase();
    const category = (college.category || '').toLowerCase();
    
    if (category === 'iit' || name.includes('iit') || college.badge === 'IIT') {
      return { text: 'PREMIER', bgColor: '#f59e0b', icon: GraduationCap };
    }
    if (category === 'deemed' || name.includes('vit') || name.includes('srm') || college.badge === 'Deemed') {
      return { text: 'UNIVERSITY', bgColor: '#4f46e5', icon: GraduationCap };
    }
    if (category === 'heritage' || (college.established && parseInt(college.established) < 1960)) {
      return { text: 'HERITAGE', bgColor: '#10b981', icon: GraduationCap };
    }
    if (college.rating && college.rating >= 4.5) {
      return { text: 'TOP RATED', bgColor: '#8b5cf6', icon: GraduationCap };
    }
    if (college.badge) {
      return { text: college.badge, bgColor: '#2563eb', icon: GraduationCap };
    }
    return null;
  };

  const badge = getBadge();
  const BadgeIcon = badge?.icon;

  // Get rating
  const getRating = () => {
    return (college.rating || 4.5).toFixed(1);
  };

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
            alt={college.name || 'College image'} 
            className="card-image"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="card-image-placeholder">
            <GraduationCap size={32} className="placeholder-icon" />
          </div>
        )}
        
        {/* Badge - PREMIER / UNIVERSITY / HERITAGE */}
        {badge && (
          <div className="card-badge" style={{ backgroundColor: badge.bgColor }}>
            <BadgeIcon size={10} />
            <span>{badge.text}</span>
          </div>
        )}
        
        {/* Rating Badge */}
        <div className="card-rating">
          <Star size={12} className="star-icon" fill="#f59e0b" />
          <span>{getRating()}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="card-content">
        <h3 className="card-title">
          {college.name}
        </h3>
        
        <div className="card-location">
          <MapPin size={14} className="pin-icon" />
          <span>{college.location || college.city || 'Chennai, Tamil Nadu'}</span>
        </div>

        {/* Footer with action button only - No EST */}
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