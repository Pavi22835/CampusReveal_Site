import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Share2, Heart, ShieldCheck, Edit3, ThumbsUp, Award } from 'lucide-react';
import LocationInfo from './LocationInfo';
import RatingBars from './RatingBars';
import ReviewCard from './ReviewCard';
import { api } from '../services/api';
import './collegeDetails.css';

const CollegeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching college with ID:", id);
        
        // ✅ Use getUniversity API instead of fetching all universities
        const result = await api.getUniversity(id);
        console.log("API Response:", result);
        
        if (result.success && result.data) {
          setCollege(result.data);
          
          // ✅ Fetch real reviews for this college
          const reviewsResult = await api.getReviews(id);
          if (reviewsResult && reviewsResult.success) {
            setReviews(reviewsResult.data || []);
          }
        } else {
          setError(result.message || "University not found");
        }
      } catch (err) {
        console.error("Error fetching college:", err);
        setError("Failed to load college details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollege();
    window.scrollTo(0, 0);
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="college-details-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading college details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !college) {
    return (
      <div className="college-details-page">
        <div className="error-container">
          <div className="error-card">
            <div className="error-icon">😕</div>
            <h2>Something went wrong</h2>
            <p>{error || "University not found"}</p>
            <div className="error-actions">
              <button onClick={() => navigate('/')} className="error-btn primary">
                Go to Home
              </button>
              <button onClick={() => navigate('/colleges')} className="error-btn secondary">
                Explore Other Colleges
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format review count for display
  const reviewCount = reviews.length;
  const reviewCountDisplay = reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount;
  
  // Get rating
  const rating = college.rating || 0;
  const ratingDisplay = rating > 0 ? rating.toFixed(1) : 'No ratings yet';

  return (
    <div className="college-details-page">
      
      <div className="details-header-banner">
        <div className="banner-overlay"></div>
        <div className="header-content-container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} /> Back
          </button>
          
          <div className="header-main-info">
            <div className="header-left">
              <div className="badge-row">
                {college.type && (
                  <span className="premium-badge">{college.type}</span>
                )}
                <span className="verified-badge"><ShieldCheck size={14} /> Verified</span>
              </div>
              <h1>{college.name}</h1>
              <div className="location-row">
                {(college.location || college.city) && (
                  <>
                    <MapPin size={18} />
                    <span>{college.location || college.city}</span>
                  </>
                )}
                {rating > 0 && (
                  <span className="rating-badge-header">
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span>{ratingDisplay} ({reviewCountDisplay} {reviewCount === 1 ? 'Review' : 'Reviews'})</span>
                  </span>
                )}
              </div>
            </div>
            
            {rating > 0 && (
              <div className="header-right">
                <div className="rating-card">
                  <div className="rating-value">
                    <Star size={24} fill="#f59e0b" color="#f59e0b" />
                    <span>{ratingDisplay}</span>
                  </div>
                  <div className="rating-count">Based on {reviewCountDisplay} {reviewCount === 1 ? 'review' : 'reviews'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="details-container">
        <div className="details-grid">
          <div className="details-main-content">
            
            {/* Student Verdict - Rating Bars */}
            {college.verdict && Object.keys(college.verdict).length > 0 && (
              <div className="ratings-wrapper">
                <RatingBars ratings={college.verdict} />
              </div>
            )}

            {/* Location Info Section - Only if location exists */}
            {(college.location || college.city || college.state) && (
              <LocationInfo university={college} />
            )}

            {/* Featured Review Section - Only if real reviews exist */}
            {reviews.length > 0 && (
              <section className="featured-review-section">
                <div className="section-header">
                  <h2>Student Reviews</h2>
                </div>
                
                <div className="reviews-list-vertical">
                  {reviews.slice(0, 3).map((review, index) => (
                    <ReviewCard 
                      key={review.id || index}
                      review={{
                        author: review.user?.name || 'Anonymous',
                        classYear: review.classYear,
                        major: review.major,
                        title: review.title,
                        content: review.content,
                        pros: review.pros || [],
                        cons: review.cons || [],
                        rating: review.rating || 0
                      }}
                    />
                  ))}
                </div>
                
                {reviews.length > 3 && (
                  <button 
                    className="view-all-reviews-btn"
                    onClick={() => navigate(`/university/${college.id}?tab=reviews`)}
                  >
                    View all {reviews.length} reviews →
                  </button>
                )}
              </section>
            )}

            {/* About the Institution */}
            <section className="about-section">
              <h2>About the Institution</h2>
              <p>{college.description || 'No description available.'}</p>
              
              {(college.studentCount || college.facultyCount) && (
                <div className="stats-strip">
                  {college.studentCount && (
                    <div className="stat-item">
                      <span className="stat-val">{college.studentCount.toLocaleString()}+</span>
                      <span className="stat-label">Students</span>
                    </div>
                  )}
                  {college.facultyCount && (
                    <div className="stat-item">
                      <span className="stat-val">{college.facultyCount.toLocaleString()}+</span>
                      <span className="stat-label">Faculty</span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* No Reviews Message */}
            {reviews.length === 0 && (
              <div className="no-reviews-section">
                <h3>No Reviews Yet</h3>
                <p>Be the first to share your experience at {college.name}.</p>
                <button 
                  className="write-review-btn"
                  onClick={() => navigate(`/write-review/${college.id}`)}
                >
                  Write a Review
                </button>
              </div>
            )}
          </div>

          <aside className="details-sidebar">
            {/* Fast Facts Card - Only show if data exists */}
            {(college.acceptanceRate || college.studentFacultyRatio || college.placementRate) && (
              <div className="sidebar-card facts-card">
                <h3>Fast Facts</h3>
                <div className="facts-list-compact">
                  {college.acceptanceRate && (
                    <div className="fact-row">
                      <span className="fact-label">Acceptance Rate:</span>
                      <span className="fact-value">{college.acceptanceRate}</span>
                    </div>
                  )}
                  {college.studentFacultyRatio && (
                    <div className="fact-row">
                      <span className="fact-label">Student-Faculty Ratio:</span>
                      <span className="fact-value">{college.studentFacultyRatio}</span>
                    </div>
                  )}
                  {college.placementRate && (
                    <div className="fact-row">
                      <span className="fact-label">Placement Rate:</span>
                      <span className="fact-value">{college.placementRate}</span>
                    </div>
                  )}
                  {college.scholarshipAvailable && (
                    <div className="fact-row">
                      <span className="fact-label">Scholarships:</span>
                      <span className="fact-value">Available</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="sidebar-card action-card">
              <h3>Interested?</h3>
              <p>Get personalized guidance for admissions.</p>
              <button className="primary-btn-wide">Apply Now</button>
              <button className="secondary-btn-wide">Download Brochure</button>
              
              <div className="action-footer">
                <button className="icon-action-btn"><Heart size={20} /> Save</button>
                <button className="icon-action-btn"><Share2 size={20} /> Share</button>
              </div>
            </div>

            <div className="sidebar-card review-cta-card">
              <h3>Share your experience?</h3>
              <p>Help other students by sharing your honest feedback.</p>
              <button className="secondary-btn-wide" onClick={() => navigate(`/write-review/${college.id}`)}>
                <Edit3 size={18} style={{ marginRight: '8px' }} /> Write a Review
              </button>
            </div>

            {/* Courses Section - If available */}
            {college.offeredCourses && college.offeredCourses.length > 0 && (
              <div className="sidebar-card info-card">
                <h3>Courses Offered</h3>
                <ul className="quick-links">
                  {college.offeredCourses.slice(0, 5).map((course, idx) => (
                    <li key={idx}>{course}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CollegeDetails;