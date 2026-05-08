/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Search, Star, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Reviews.css';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [expandedUniversities, setExpandedUniversities] = useState({});
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const ratingRef = useRef(null);

  // Fetch real reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await api.getAllReviews();
        if (res.success) {
          const reviewData = Array.isArray(res.data) ? res.data : [];
          setReviews(reviewData);
          setError('');
        } else {
          setError(res.error || 'Unable to load reviews.');
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('An unexpected error occurred while fetching reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Close rating dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ratingRef.current && !ratingRef.current.contains(event.target)) {
        setIsRatingOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRating]);

  // Group reviews by university and apply filters
  const sections = useMemo(() => {
    const grouped = reviews.reduce((acc, review) => {
      const university = review.university || {
        id: review.universityId,
        name: review.universityName || 'Unknown University',
        location: review.universityLocation || ''
      };
      const universityId = university.id || review.universityId;

      if (!acc[universityId]) {
        acc[universityId] = {
          university: {
            id: universityId,
            name: university.name || 'Unknown University',
            location: university.location || ''
          },
          reviews: []
        };
      }

      acc[universityId].reviews.push(review);
      return acc;
    }, {});

    let result = Object.values(grouped).filter((item) => item.reviews.length > 0);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.university.name.toLowerCase().includes(query) ||
        item.university.location.toLowerCase().includes(query)
      );
    }

    if (selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating);
      result = result.filter(item => {
        const avgRating = item.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / item.reviews.length;
        if (minRating === 5.0) return avgRating === 5.0;
        return avgRating >= minRating;
      });
    }

    return result;
  }, [reviews, searchQuery, selectedRating]);

  const totalPages = Math.ceil(sections.length / itemsPerPage);
  const paginatedSections = sections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const getAverageRating = (reviewsList) => {
    if (!reviewsList.length) return 0;
    const sum = reviewsList.reduce((acc, r) => acc + (r.rating || 0), 0);
    return parseFloat((sum / reviewsList.length).toFixed(1));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffMonths >= 12) {
      const years = Math.floor(diffMonths / 12);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
    if (diffMonths >= 1) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
    if (diffDays >= 7) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    if (diffDays >= 1) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    return 'Today';
  };

  // ============================================
  // CORRECTED STAR RENDERING FUNCTION
  // ============================================
  const renderStars = (rating) => {
    // Ensure rating is a number
    const numRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    
    // Calculate full stars (floor of rating)
    const fullStars = Math.floor(numRating);
    
    // Check if there should be a half star (rating - fullStars >= 0.5)
    const hasHalfStar = (numRating - fullStars) >= 0.5;
    
    // Calculate empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const stars = [];
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star filled">★</span>);
    }
    
    // Add half star
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    
    return stars;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRating('all');
  };

  const toggleUniversityReviews = (universityId) => {
    setExpandedUniversities(prev => ({
      ...prev,
      [universityId]: !prev[universityId]
    }));
  };

  const ratingOptions = [
    { value: 'all', label: 'All Ratings', stars: 0 },
    { value: '5.0', label: '5.0', stars: 5 },
    { value: '4.5', label: '4.5+', stars: 4.5 },
    { value: '4.0', label: '4.0+', stars: 4 },
    { value: '3.5', label: '3.5+', stars: 3.5 },
    { value: '3.0', label: '3.0+', stars: 3 }
  ];

  const currentRatingLabel = ratingOptions.find(o => o.value === selectedRating)?.label;

  if (loading) {
    return (
      <div className="reviews-page">
        <Navbar />
        <div className="reviews-container">
          <div className="reviews-loading">
            <div className="loading-spinner"></div>
            <p>Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      <Navbar />
      <div className="reviews-container">
        {/* Header */}
        <div className="reviews-header">
          <p className="reviews-badge">COLLEGE REVIEWS</p>
          <h1 className="reviews-title">Browse student reviews by college</h1>
        </div>

        {/* Action Controls Section */}
        <div className="reviews-controls-row">
          <div className="search-field-pill prominent">
            <Search size={20} className="search-icon-inner" />
            <input 
              type="text" 
              placeholder="Search by college name or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-pill prominent-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear-btn prominent-clear">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="custom-dropdown-wrap" ref={ratingRef}>
            <button 
              className={`dropdown-pill prominent-dropdown ${isRatingOpen ? 'active' : ''}`} 
              onClick={() => setIsRatingOpen(!isRatingOpen)}
            >
              <span className="dropdown-label">{currentRatingLabel}</span>
              <ChevronDown size={18} className={`chevron ${isRatingOpen ? 'rotate' : ''}`} />
            </button>
            {isRatingOpen && (
              <div className="dropdown-menu prominent-menu">
                {ratingOptions.map(option => (
                  <button 
                    key={option.value} 
                    className={`dropdown-item ${selectedRating === option.value ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedRating(option.value);
                      setIsRatingOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="clear-filters-btn prominent-clear-btn" onClick={clearFilters}>
            Clear filters
          </button>
        </div>

        {/* Results Info */}
        {!loading && sections.length > 0 && (
          <div className="results-info-row">
            Showing <span className="results-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, sections.length)}-{Math.min(currentPage * itemsPerPage, sections.length)}</span> of <span className="results-bold">{sections.length}</span> colleges
          </div>
        )}

        {error && (
          <div className="reviews-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div className="reviews-empty">
            <p>No reviews found yet. Please check back later.</p>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && sections.length === 0 && (
          <div className="reviews-no-results">
            <p>No results match your filters. Try a different search.</p>
            <button onClick={clearFilters} className="clear-filters-retry">Clear all filters</button>
          </div>
        )}

        {/* Reviews List */}
        {!loading && !error && sections.length > 0 && (
          <div className="reviews-universities">
            {paginatedSections.map(({ university, reviews: universityReviews }) => {
              const avgRating = getAverageRating(universityReviews);
              const isExpanded = expandedUniversities[university.id];
              const displayReviews = isExpanded ? universityReviews : universityReviews.slice(0, 1);
              const hasMoreReviews = universityReviews.length > 1;

              return (
                <div key={university.id} className="university-card-item prominent-card">
                  <div className="uni-header-box prominent-header">
                    <div className="uni-main-info">
                      <h2 className="uni-title prominent-title">{university.name}</h2>
                      <p className="uni-loc prominent-loc">{university.location || 'India'}</p>
                    </div>
                    <div className="uni-rating-details">
                      <div className="stars-row">
                        {renderStars(avgRating)}
                        <span className="rating-text prominent-rating">{avgRating.toFixed(1)}</span>
                      </div>
                      <Link to={`/university/${university.id}`} className="view-details-link prominent-link">
                        View details →
                      </Link>
                    </div>
                  </div>

                  <div className="reviews-sub-list">
                    {displayReviews.map((review) => (
                      <div key={review.id} className="single-review-block prominent-review">
                        <div className="reviewer-meta">
                          <div className="reviewer-avatar-box prominent-avatar">
                            {review.user?.name?.charAt(0) || review.author?.charAt(0) || 'S'}
                          </div>
                          <div className="reviewer-text">
                            <h4 className="reviewer-name prominent-name">
                              {review.user?.name || review.author || 'Anonymous Student'}
                            </h4>
                            <p className="reviewer-sub">Verified Student · {formatDate(review.createdAt)}</p>
                          </div>
                        </div>

                        <div className="review-content-body">
                          <div className="stars-mini-row">
                            {renderStars(review.rating || 0)}
                          </div>
                          <p className="review-txt prominent-text">
                            {review.content || review.tips || 'No review content available.'}
                          </p>
                          {(review.pros?.length > 0 || review.cons?.length > 0) && (
                            <div className="review-tags">
                              {review.pros?.slice(0, 2).map((pro, idx) => (
                                <span key={idx} className="tag-pro">👍 {pro}</span>
                              ))}
                              {review.cons?.slice(0, 2).map((con, idx) => (
                                <span key={idx} className="tag-con">👎 {con}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {hasMoreReviews && (
                      <button 
                        className="view-more-action prominent-more" 
                        onClick={() => toggleUniversityReviews(university.id)}
                      >
                        {isExpanded ? '↑ Show less reviews' : `↓ View all ${universityReviews.length} reviews`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && sections.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <button 
              onClick={goToPrevPage} 
              disabled={currentPage === 1}
              className="pagination-prev"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="pagination-numbers">
              {getPageNumbers().map((page, idx) => (
                page === '...' ? (
                  <span key={`dots-${idx}`} className="pagination-dots">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages}
              className="pagination-next"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}