import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Star, StarHalf, Share2, Heart, ShieldCheck, Users, 
  GraduationCap, Building2, Globe, Sparkles, BookOpen, Clock,
  ArrowRight, MessageSquare, CheckCircle, Zap, Wifi, Dumbbell,
  Library, Bus, Utensils, Award, TrendingUp, Calendar,
  DollarSign, Home, Video, Activity, Target,
  Info, XCircle, Coffee, Briefcase, UserCheck, School,
  Verified, Phone, Mail
} from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import ProfileDetailsModal from "../components/ProfileDetailsModal/ProfileDetailsModal";
import './UniversityDetail.css';

// ==================== COMPONENTS ====================

const HeroImageSlider = ({ images }) => {
  const [index, setIndex] = useState(0);
  const displayImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop'
  ];

  const paginate = (newDirection) => {
    setIndex((prev) => (prev + newDirection + displayImages.length) % displayImages.length);
  };

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timer);
  }, [displayImages.length]);

  return (
    <div className="hero-slider-wrap">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={displayImages[index]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="hero-background-img"
          alt="Campus"
        />
      </AnimatePresence>
      <div className="hero-slider-overlay" />
    </div>
  );
};

// Helper function to render stars
const renderStars = (rating) => {
  const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating - fullStars >= 0.5;
  const stars = [];
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} size={14} fill="#f59e0b" color="#f59e0b" />);
  }
  
  if (hasHalfStar) {
    stars.push(<StarHalf key="half" size={14} fill="#f59e0b" color="#f59e0b" />);
  }
  
  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} size={14} color="#e5e7eb" />);
  }
  
  return stars;
};

// ==================== MAIN COMPONENT ====================

export default function UniversityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [reviews, setReviews] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [averageRatings, setAverageRatings] = useState({
    academics: 0,
    faculty: 0,
    infrastructure: 0,
    campusLife: 0,
    transport: 0,
    placements: 0,
    studentLife: 0,
    sports: 0
  });

  useEffect(() => {
    if (id) fetchUniversityData();
  }, [id]);

  const fetchUniversityData = async () => {
    setLoading(true);
    setError(null);
    try {
      const uniResult = await api.getUniversity(id);
      if (uniResult.success && uniResult.data) {
        setUniversity(uniResult.data);
      } else {
        setError(uniResult.message || 'University not found');
      }

      const reviewsResult = await api.getReviews(id);
      if (reviewsResult && reviewsResult.success) {
        const reviewsData = reviewsResult.data || [];
        setReviews(reviewsData);
        
        if (reviewsData.length > 0) {
          calculateAverageRatings(reviewsData);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load university details');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRatings = (reviewsData) => {
    let academicsSum = 0;
    let facultySum = 0;
    let infrastructureSum = 0;
    let campusLifeSum = 0;
    let transportSum = 0;
    let placementsSum = 0;
    let studentLifeSum = 0;
    let sportsSum = 0;
    let count = 0;

    reviewsData.forEach(review => {
      if (review.ratings && typeof review.ratings === 'object') {
        academicsSum += review.ratings.academicRigor || review.ratings.teachingQuality || 0;
        facultySum += review.ratings.facultySupport || 0;
        infrastructureSum += review.ratings.campusInfrastructure || review.ratings.classrooms || 0;
        campusLifeSum += review.ratings.socialLife || review.ratings.eventsFests || 0;
        transportSum += review.ratings.transportFacilities || review.ratings.busAvailability || 0;
        placementsSum += review.ratings.placementSupport || review.ratings.internshipOpportunities || 0;
        studentLifeSum += review.ratings.clubsActivities || review.ratings.eventsFests || 0;
        sportsSum += review.ratings.sportsFacilities || review.ratings.gymFacilities || 0;
        count++;
      } else if (review.rating) {
        academicsSum += review.rating;
        facultySum += review.rating;
        infrastructureSum += review.rating;
        campusLifeSum += review.rating;
        transportSum += review.rating;
        placementsSum += review.rating;
        studentLifeSum += review.rating;
        sportsSum += review.rating;
        count++;
      }
    });

    if (count > 0) {
      setAverageRatings({
        academics: parseFloat((academicsSum / count).toFixed(1)),
        faculty: parseFloat((facultySum / count).toFixed(1)),
        infrastructure: parseFloat((infrastructureSum / count).toFixed(1)),
        campusLife: parseFloat((campusLifeSum / count).toFixed(1)),
        transport: parseFloat((transportSum / count).toFixed(1)),
        placements: parseFloat((placementsSum / count).toFixed(1)),
        studentLife: parseFloat((studentLifeSum / count).toFixed(1)),
        sports: parseFloat((sportsSum / count).toFixed(1))
      });
    }
  };

  const tabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Student Verdict', label: 'Student Verdict' },
    { id: 'Facts', label: 'Facts' },
    { id: 'Facilities', label: 'Facilities' },
    { id: 'Fees', label: 'Fees' },
    { id: 'Reviews', label: 'Reviews' }
  ];

  const handleTabChange = (label) => {
    setActiveTab(label);
  };

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Loading Campus...</p>
    </div>
  );

  if (error || !university) return (
    <div className="error-container">
      <div className="error-icon">
        <XCircle size={48} />
      </div>
      <h2>Data Unavailable</h2>
      <p>{error || 'Could not locate campus profile.'}</p>
      <Link to="/" className="error-btn">Return Home</Link>
    </div>
  );

  const addressText = university.location || [university.city, university.state].filter(Boolean).join(', ');
  const galleryImages = university.images && university.images.length > 0 ? university.images : [university.imageUrl, university.image].filter(Boolean);
  const activeFacilities = university.campusFacilities || [];
  const reviewCountDisplay = reviews.length >= 1000 ? `${(reviews.length / 1000).toFixed(1)}k` : `${reviews.length}`;
  const ratingValue = university.rating ? Number(university.rating).toFixed(1) : '0.0';

  const verdictCategories = [
    { label: "Academics", score: averageRatings.academics || 4.0, color: "#3b82f6" },
    { label: "Faculty", score: averageRatings.faculty || 4.0, color: "#8b5cf6" },
    { label: "Infrastructure", score: averageRatings.infrastructure || 4.0, color: "#10b981" },
    { label: "Campus Life", score: averageRatings.campusLife || 4.0, color: "#f59e0b" },
    { label: "Transport", score: averageRatings.transport || 4.0, color: "#06b6d4" },
    { label: "Placements", score: averageRatings.placements || 4.0, color: "#ef4444" },
    { label: "Student Life", score: averageRatings.studentLife || 4.0, color: "#ec4899" },
    { label: "Sports", score: averageRatings.sports || 4.0, color: "#f97316" }
  ];

  return (
    <div className="university-detail-page">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/colleges">Colleges</Link>
          <span>/</span>
          <span className="current">{university.name}</span>
        </div>

        {/* Hero Section Grid */}
        <section className="hero-grid">
          <div className="banner-column">
            <HeroImageSlider images={galleryImages} />
            <div className="banner-overlay-content">
              <div className="hero-badges">
                <span className="badge-primary">{university.category || 'Engineering'}</span>
                <span className="badge-rating">
                  <Star size={12} fill="currentColor" /> {ratingValue} ({reviewCountDisplay} Reviews)
                </span>
                {university.naacGrade && (
                  <span className="badge-naac">
                    <Verified size={12} /> NAAC {university.naacGrade} Accredited
                  </span>
                )}
              </div>
              <h1 className="banner-title">{university.name}</h1>
              <div className="banner-metadata">
                <span className="meta-item"><MapPin size={14} /> {addressText}</span>
                <span className="meta-item"><Calendar size={14} /> Est. {university.established || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="stats-column">
            <div className="stat-card">
              <TrendingUp className="stat-icon" size={32} />
              <div className="stat-value">{university.placementRate || 'Not disclosed'}</div>
              <div className="stat-label">PLACEMENTS</div>
            </div>
            <div className="stat-card">
              <UserCheck className="stat-icon" size={32} />
              <div className="stat-value">{university.facultyCount ? `${university.facultyCount}+` : 'Not disclosed'}</div>
              <div className="stat-label">EXPERT FACULTY</div>
            </div>
            <div className="stat-card">
              <Users className="stat-icon" size={32} />
              <div className="stat-value">{university.studentCount ? `${Math.floor(university.studentCount / 1000)}k+` : 'Not disclosed'}</div>
              <div className="stat-label">ACTIVE STUDENTS</div>
            </div>
          </div>
        </section>

        {/* Tab Switcher */}
        <nav className="tab-navigation">
          {tabs.map(tab => (
            <button key={tab.id} 
                    className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => handleTabChange(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Main Content Area */}
        <div className="content-grid">
          <div className="main-content">
            {activeTab === 'Overview' && (
              <div className="overview-container">
                <div className="about-card-new info-card">
                  <div className="section-badge-new">ABOUT THE INSTITUTION</div>
                  <h3 className="section-title-xl">{university.name}</h3>
                  <p className="about-text-new">{university.description || 'No description available.'}</p>
                </div>
                
                <div className="mv-grid-new">
                  {university.mission && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mv-card-new mission"
                    >
                      <div className="mv-icon-box-new mission">
                        <Target size={24} />
                      </div>
                      <h4 className="mv-card-title">Our Mission</h4>
                      <p className="mv-card-text">{university.mission}</p>
                    </motion.div>
                  )}
                  
                  {university.vision && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mv-card-new vision"
                    >
                      <div className="mv-icon-box-new vision">
                        <Zap size={24} />
                      </div>
                      <h4 className="mv-card-title">Our Vision</h4>
                      <p className="mv-card-text">{university.vision}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Student Verdict' && (
              <div className="verdict-card info-card">
                <div className="verdict-header">
                  <div className="verdict-title-box">
                    <h3>Student Verdict</h3>
                    <p>Based on {reviews.length} verified student {reviews.length === 1 ? 'review' : 'reviews'}.</p>
                  </div>
                  <div className="verdict-score-box">
                    <div className="score-main">
                      <span className="score-num">{ratingValue}</span>
                      <span className="score-total">/5</span>
                    </div>
                    <div className="score-stars">
                      {renderStars(ratingValue)}
                    </div>
                  </div>
                </div>

                <div className="verdict-grid">
                  {verdictCategories.map((item, idx) => (
                    <div key={idx} className="verdict-item">
                      <div className="v-row">
                        <span className="v-label">{item.label}</span>
                        <span className="v-score">{item.score.toFixed(1)}</span>
                      </div>
                      <div className="v-progress-bg">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.score / 5) * 100}%` }}
                          className="v-progress-fill"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'Facts' && (
              <div className="facts-grid-new">
                {[
                  { label: "Affiliation", value: university.affiliation, icon: Globe, color: "blue" },
                  { label: "Type", value: university.type, icon: Building2, color: "indigo" },
                  { label: "Est. Year", value: university.established, icon: Calendar, color: "blue" },
                  { label: "NAAC Grade", value: university.naacGrade, icon: Award, color: "violet" },
                  { label: "Avg. Package", value: university.averagePackage, icon: TrendingUp, color: "blue" },
                  { label: "Highest Package", value: university.highestPackage, icon: Award, color: "violet" },
                  { label: "Total Students", value: university.studentCount ? university.studentCount.toLocaleString() : 'N/A', icon: Users, color: "green" },
                  { label: "Total Faculty", value: university.facultyCount ? university.facultyCount.toLocaleString() : 'N/A', icon: GraduationCap, color: "purple" },
                ].filter(stat => stat.value).map((stat, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="fact-card-new"
                  >
                    <div className={`fact-icon-box ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <div className="fact-content">
                      <span className="fact-label">{stat.label}</span>
                      <p className="fact-value">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {activeTab === 'Facilities' && (
              <div className="facilities-container-new info-card">
                <div className="section-header-flex">
                  <h3 className="section-title">Campus Facilities</h3>
                  <div className="section-subtitle-new">World-class amenities for a holistic campus experience</div>
                </div>
                
                <div className="facilities-grid-modern">
                  {activeFacilities.length > 0 ? activeFacilities.map((facility, i) => {
                    const getIcon = () => {
                      const name = facility.toLowerCase();
                      if (name.includes('lab')) return <Video size={22} />;
                      if (name.includes('library')) return <Library size={22} />;
                      if (name.includes('wifi')) return <Wifi size={22} />;
                      if (name.includes('sports')) return <Dumbbell size={22} />;
                      if (name.includes('hostel')) return <Home size={22} />;
                      if (name.includes('canteen') || name.includes('food')) return <Utensils size={22} />;
                      if (name.includes('bus') || name.includes('transport')) return <Bus size={22} />;
                      if (name.includes('gym')) return <Dumbbell size={22} />;
                      if (name.includes('auditorium')) return <Video size={22} />;
                      return <CheckCircle size={22} />;
                    };
                    
                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="facility-item-new"
                      >
                        <div className="facility-icon-box-new default">
                          {getIcon()}
                        </div>
                        <div className="facility-content-new">
                          <h4 className="facility-title-new">{facility}</h4>
                        </div>
                      </motion.div>
                    );
                  }) : (
                    <div className="no-facilities">No facilities data available.</div>
                  )}
                </div>

                <div className="facility-footer-badges">
                  {university.hostelAvailable && (
                    <div className="status-badge-modern blue">
                      <Home size={14} />
                      <span>Hostel Available {university.hostelType && `(${university.hostelType})`}</span>
                    </div>
                  )}
                  {university.transportAvailable && (
                    <div className="status-badge-modern indigo">
                      <Bus size={14} />
                      <span>Transport Available</span>
                    </div>
                  )}
                  {university.scholarshipAvailable && (
                    <div className="status-badge-modern violet">
                      <Award size={14} />
                      <span>Scholarship Available</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Fees' && (
              <div className="fees-container-new info-card">
                <div className="fees-layout">
                  <div className="fees-info-box">
                    <div className="fees-header-box">
                      <h3>Fee Structure</h3>
                    </div>
                    <div className="fees-list">
                      {university.tuitionFee && (
                        <div className="fee-item">
                          <span className="fee-label">Tuition Fee (per year)</span>
                          <span className="fee-value">{university.tuitionFee}</span>
                        </div>
                      )}
                      {university.hostelFee && (
                        <div className="fee-item">
                          <span className="fee-label">Hostel Fee (per year)</span>
                          <span className="fee-value">{university.hostelFee}</span>
                        </div>
                      )}
                      {!university.tuitionFee && !university.hostelFee && (
                        <div className="fee-item">
                          <span className="fee-label">Fee Information</span>
                          <span className="fee-value">Not disclosed</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="scholarship-info-box">
                    <h4 className="scholarship-title">SCHOLARSHIPS</h4>
                    <p className="scholarship-desc">
                      {university.scholarshipAvailable 
                        ? 'Merit-cum-means assistance is available for eligible candidates. Various scholarship programs offered by the institution and government.'
                        : 'Currently no active scholarship programs for this academic cycle.'}
                    </p>
                    {university.scholarshipAvailable && (
                      <button className="scholarship-btn">
                        View Scholarship Portal
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div className="reviews-container-new info-card">
                <div className="reviews-header-main">
                  <h3 className="section-title">Community Reviews</h3>
                  <button onClick={() => setShowProfileModal(true)} className="write-review-btn-new">Write a Review</button>
                </div>
                
                <div className="reviews-list-new">
                  {reviews.length > 0 ? reviews.map((review, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="review-card-new"
                    >
                      <div className="review-user-info">
                        <div className="user-avatar-new">{review.user?.name?.[0] || 'A'}</div>
                        <div className="user-details-new">
                          <span className="user-name-new">{review.user?.name || 'Anonymous Student'}</span>
                          <span className="review-date-new">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="review-stars-new">
                        {renderStars(review.rating || 0)}
                      </div>
                      
                      <p className="review-text-new">{review.content || review.comment || 'No review content available.'}</p>
                      
                      {(review.pros?.length > 0 || review.cons?.length > 0) && (
                        <div className="review-tags-new">
                          {review.pros?.slice(0, 2).map((pro, index) => (
                            <span key={index} className="tag-pro-new">👍 {pro}</span>
                          ))}
                          {review.cons?.slice(0, 2).map((con, index) => (
                            <span key={index} className="tag-con-new">👎 {con}</span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )) : (
                    <div className="no-reviews-message">
                      <MessageSquare size={48} />
                      <h3>No verified reviews yet</h3>
                      <p>Be the first to share your journey with thousands of prospective students.</p>
                      <button onClick={() => setShowProfileModal(true)} className="write-review-btn-new primary">
                        Write a Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="content-sidebar">
            <div className="location-card info-card">
              <h3>Campus Location</h3>
              <div className="map-preview">
                <iframe 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(addressText)}&output=embed`} 
                  title="University Location Map"
                />
              </div>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`, '_blank')}
                className="primary-btn-full"
              >
                Open in Maps <ArrowRight size={16} />
              </button>
              <div className="contact-info">
                  <div className="c-row">
                    <div className="c-label-group">
                      <Phone size={14} />
                      <span>Phone</span>
                    </div>
                    <strong>{university.phone || 'Not available'}</strong>
                  </div>
                  <div className="c-row">
                    <div className="c-label-group">
                      <Mail size={14} />
                      <span>Email</span>
                    </div>
                    <strong>{university.email || 'Not available'}</strong>
                  </div>
                  <div className="c-row">
                    <div className="c-label-group">
                      <Globe size={14} />
                      <span>Website</span>
                    </div>
                    <strong>
                      {university.website ? (
                        <a href={university.website.startsWith('http') ? university.website : `https://${university.website}`} target="_blank" rel="noreferrer">
                          {university.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : 'Not available'}
                    </strong>
                  </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ProfileDetailsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSuccess={() => navigate(`/write-review/${university.id}`)}
      />
    </div>
  );
}