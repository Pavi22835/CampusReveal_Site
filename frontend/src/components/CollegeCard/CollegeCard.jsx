import React from 'react';
import { Star, MapPin, ChevronRight, Users, DollarSign, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './collegeCard.css';

const CollegeCard = ({ college, index }) => {
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="college-card-premium"
      onClick={() => requireAuth(() => navigate(`/university/${college.id}`))}
    >
      {/* Image Section - Smaller height */}
      <div className="card-image-wrapper">
        {college.image ? (
          <img 
            src={college.image} 
            alt={college.name || 'College image'} 
            className="card-image"
            referrerPolicy="no-referrer"
          />
        ) : null}
        
        {/* Premier Badge */}
        <div className="card-badge">
          {college.badge || 'PREMIER'}
        </div>

        {/* Rating Badge */}
        <div className="card-rating">
          <Star size={12} className="star-icon" fill="#f59e0b" />
          <span>{college.rating || '4.8'}</span>
        </div>
      </div>

      {/* Content Section - Compact */}
      <div className="card-content">
        <h3 className="card-title">
          {college.name}
        </h3>
        
        <div className="card-location">
          <MapPin size={14} className="pin-icon" />
          <span>{college.location || 'Chennai, Tamil Nadu'}</span>
        </div>

        {/* Stats Row - Compact grid */}
        <div className="card-stats">
          <div className="stat-item">
            <Users size={12} className="stat-icon" />
            <div>
              <span className="stat-label">Students</span>
              <span className="stat-value">{college.students || '8,500+'}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <DollarSign size={12} className="stat-icon" />
            <div>
              <span className="stat-label">Fee</span>
              <span className="stat-value">{college.netPrice || '₹1.2L'}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <Award size={12} className="stat-icon" />
            <div>
              <span className="stat-label">Acceptance</span>
              <span className="stat-value">{college.acceptanceRate || '2.5%'}</span>
            </div>
          </div>
        </div>

        {/* Footer with action button */}
        <div className="card-footer">
          <div className="footer-meta">
            <span className="meta-label">Est. 1964</span>
          </div>
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