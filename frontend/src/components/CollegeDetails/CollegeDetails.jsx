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
  const [featuredReviewIndex, setFeaturedReviewIndex] = useState(0);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching college with ID:", id);
        console.log("ID type:", typeof id);
        
        const res = await api.getUniversities();
        console.log("API Response:", res);
        console.log("Universities data:", res.data);
        
        // Try to find college by ID (handle both string and number)
        const found = res.data.find(c => {
          console.log(`Comparing ${c.id} with ${id} (${typeof c.id} vs ${typeof id})`);
          return String(c.id) === String(id);
        });
        
        console.log("Found college:", found);
        
        if (found) {
          setCollege(found);
        } else {
          setError("University not found");
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

  // Featured reviews data
  const featuredReviews = college ? [
    {
      author: "Alex Chen",
      classYear: "2024",
      major: "Computer Science",
      title: "The entrepreneurial spirit is unmatched here.",
      content: `Being at ${college.name} is less about attending classes and more about joining an ecosystem. The proximity to Silicon Valley means guest lecturers are often industry titans.`,
      quote: "The entrepreneurial spirit is unmatched here.",
      pros: ["Unbeatable networking opportunities", "Cutting edge research facilities"],
      cons: ["Extremely high cost of living nearby", "High pressure 'duck syndrome' culture"],
      rating: 5
    },
    {
      author: "Maya Patel",
      classYear: "2025",
      major: "Product Design",
      title: "Interdisciplinary learning at its finest.",
      content: `The d.school is a life-changing place. You aren't just limited to your major; you're encouraged to break silos and build things that matter.`,
      quote: "Interdisciplinary learning at its finest.",
      pros: ["Cross-disciplinary collaboration", "World-class design facilities", "Industry connections"],
      cons: ["Competitive environment", "Expensive housing"],
      rating: 5
    }
  ] : [];

  const currentReview = featuredReviews[featuredReviewIndex];

  const nextReview = () => {
    setFeaturedReviewIndex((prev) => (prev + 1) % featuredReviews.length);
  };

  const prevReview = () => {
    setFeaturedReviewIndex((prev) => (prev - 1 + featuredReviews.length) % featuredReviews.length);
  };

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
              <button onClick={() => navigate('/search')} className="error-btn secondary">
                Explore Other Colleges
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <span className="premium-badge">{college.badge || 'A+ Grade'}</span>
                <span className="verified-badge"><ShieldCheck size={14} /> Verified</span>
              </div>
              <h1>{college.name}</h1>
              <div className="location-row">
                <MapPin size={18} />
                <span>{college.location || 'Location not specified'}</span>
                <span className="rating-badge-header">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{college.rating || '4.8'} ({college.reviewCount || '2.4k'} Reviews)</span>
                </span>
              </div>
            </div>
            
            <div className="header-right">
              <div className="rating-card">
                <div className="rating-value">
                  <Star size={24} fill="#f59e0b" color="#f59e0b" />
                  <span>{college.rating || '4.8'}</span>
                </div>
                <div className="rating-count">Based on {college.reviewCount || '2.4k'} reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="details-container">
        <div className="details-grid">
          <div className="details-main-content">
            
            {/* Student Verdict - Rating Bars */}
            <div className="ratings-wrapper">
              <RatingBars ratings={college.verdict} />
            </div>

            {/* Location Info Section */}
            <LocationInfo university={college} />

            {/* Featured Review Section */}
            {featuredReviews.length > 0 && (
              <section className="featured-review-section">
                <div className="section-header">
                  <h2>Featured Review</h2>
                  <div className="review-navigation">
                    <button onClick={prevReview} className="nav-arrow">←</button>
                    <span className="review-counter">{featuredReviewIndex + 1} / {featuredReviews.length}</span>
                    <button onClick={nextReview} className="nav-arrow">→</button>
                  </div>
                </div>
                
                <div className="featured-review-card">
                  <div className="quote-icon">"</div>
                  <h3 className="featured-review-quote">{currentReview.quote}</h3>
                  <p className="featured-review-content">{currentReview.content}</p>
                  
                  <div className="review-author-detail">
                    <div className="author-avatar-large">
                      {currentReview.author.charAt(0)}
                    </div>
                    <div className="author-info-detail">
                      <strong>{currentReview.author}</strong>
                      <span>Class of {currentReview.classYear} • {currentReview.major}</span>
                    </div>
                    <div className="review-rating">
                      <Star size={16} fill="#f59e0b" color="#f59e0b" />
                      <span>{currentReview.rating}</span>
                    </div>
                  </div>

                  <div className="review-pros-cons">
                    <div className="pros-section">
                      <div className="section-label">
                        <ThumbsUp size={16} /> Pros
                      </div>
                      <ul>
                        {currentReview.pros.map((pro, idx) => (
                          <li key={idx}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="cons-section">
                      <div className="section-label">
                        <span className="cons-icon">✗</span> Cons
                      </div>
                      <ul>
                        {currentReview.cons.map((con, idx) => (
                          <li key={idx}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* About the Institution */}
            <section className="about-section">
              <h2>About the Institution</h2>
              <p>{college.description || "A premier global institution dedicated to excellence in education, innovation, and research. With a rich history spanning decades, it offers a transformative learning experience led by world-class faculty."}</p>
              
              <div className="stats-strip">
                <div className="stat-item">
                  <span className="stat-val">{college.students || '12k+'}</span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">{college.faculty || '450+'}</span>
                  <span className="stat-label">Faculty</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">{college.studentFacultyRatio || '5:1'}</span>
                  <span className="stat-label">Student-Faculty Ratio</span>
                </div>
              </div>
            </section>

            {/* More Reviews Section */}
            <section className="reviews-preview">
              <div className="section-header">
                <h2>Real Student Experiences</h2>
                <button className="text-btn">Read all {college.reviewCount || '124'} reviews →</button>
              </div>
              
              <div className="reviews-list-vertical">
                <ReviewCard 
                  review={{
                    author: "Arjun Sharma",
                    classYear: "2024",
                    major: "B.Tech Computer Science",
                    title: "Exceptional Research Culture",
                    content: `My journey at ${college.name} has been nothing short of transformative. The faculty here doesn't just teach from books; they involve you in real-world research projects from the second year onwards.`,
                    pros: ["Advanced Labs", "Industry Network", "Vibrant Campus"],
                    cons: ["High Workload", "Distal Campus Location"]
                  }}
                />
                
                <ReviewCard 
                  review={{
                    author: "Sneha Reddy",
                    classYear: "2023",
                    major: "M.Sc Data Science",
                    title: "Solid Placements and Network",
                    content: "The placement cell is extremely proactive. Almost 90% of my batch got placed in Top 500 companies before the final semester even ended.",
                    pros: ["Placement Cell", "Peer Learning", "Guest Lectures"],
                    cons: ["Inflexible Curriculum"]
                  }}
                />
              </div>
            </section>
          </div>

          <aside className="details-sidebar">
            {/* Fast Facts Card */}
            <div className="sidebar-card facts-card">
              <h3>Fast Facts</h3>
              <div className="facts-list-compact">
                <div className="fact-row">
                  <span className="fact-label">Acceptance Rate:</span>
                  <span className="fact-value">{college.acceptanceRate || '3.9%'}</span>
                </div>
                <div className="fact-row">
                  <span className="fact-label">Student-Faculty Ratio:</span>
                  <span className="fact-value">{college.studentFacultyRatio || '5:1'}</span>
                </div>
                <div className="fact-row">
                  <span className="fact-label">Median Salary:</span>
                  <span className="fact-value">{college.medianSalary || '$92,000'}</span>
                </div>
                <div className="fact-row">
                  <span className="fact-label">Financial Aid:</span>
                  <span className="fact-value">{college.financialAid || '70%+'}</span>
                </div>
              </div>
            </div>

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
              <h3>Shared your experience?</h3>
              <p>Help other students by sharing your honest feedback.</p>
              <button className="secondary-btn-wide" onClick={() => navigate(`/write-review/${id}`)}>
                <Edit3 size={18} style={{ marginRight: '8px' }} /> Write a Review
              </button>
            </div>

            <div className="sidebar-card info-card">
              <h3>Quick Links</h3>
              <ul className="quick-links">
                <li>Courses & Fees</li>
                <li>Admission 2024</li>
                <li>Placements</li>
                <li>Infrastructure</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CollegeDetails;