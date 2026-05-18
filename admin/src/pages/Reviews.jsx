import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Star, Eye, Trash2, Search, X, ChevronLeft, ChevronRight, Edit, Archive, RotateCcw, User, Building2, Calendar as CalendarIcon } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import './Reviews.css';

const Reviews = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [trashedReviews, setTrashedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [itemsPerPage] = useState(10);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReviewData, setEditReviewData] = useState({ title: '', content: '', rating: null });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (activeTab === 'trash') {
      fetchTrashedReviews();
    }
  }, [activeTab]);

  useEffect(() => {
    filterReviews();
  }, [searchTerm, reviews, trashedReviews, activeTab]);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getReviews(token);
      if (result.success && result.data) {
        const activeReviews = result.data.filter(review => !review.isTrashed);
        setReviews(activeReviews);
      } else {
        setReviews([]);
        if (!result.success) {
          setError(result.message || 'No Data Available');
        }
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
      setError('Unable to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashedReviews = async () => {
    try {
      if (!api.getTrashedReviews) {
        setTrashedReviews([]);
        return;
      }
      
      const result = await api.getTrashedReviews(token);
      if (result?.success && result?.data) {
        setTrashedReviews(result.data);
      } else {
        setTrashedReviews([]);
      }
    } catch (error) {
      console.error('Error fetching trashed reviews:', error);
      setTrashedReviews([]);
    }
  };

  const filterReviews = () => {
    const currentList = activeTab === 'all' ? reviews : trashedReviews;
    let filtered = [...currentList];

    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.university?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReviews(filtered);
    setCurrentPage(1);
  };

  const handleView = (review) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  const handleEdit = (review) => {
    setSelectedReview(review);
    setEditReviewData({
      title: review.title || '',
      content: review.content || '',
      rating: review.rating || null
    });
    setShowEditModal(true);
  };

  const handleSoftDelete = async (reviewId) => {
    if (!api.softDeleteReview) {
      setError('Soft delete feature is not available');
      return;
    }
    
    if (window.confirm('Move this review to trash? You can restore it later.')) {
      try {
        const result = await api.softDeleteReview(reviewId, token);
        if (result?.success) {
          await fetchReviews();
          await fetchTrashedReviews();
        } else {
          setError(result?.message || 'Failed to move review to trash');
        }
      } catch (err) {
        console.error('Soft delete error:', err);
        setError('Error moving review to trash');
      }
    }
  };

  const handleRestore = async (reviewId) => {
    if (!api.restoreReview) {
      setError('Restore feature is not available');
      return;
    }
    
    if (window.confirm('Restore this review from trash?')) {
      try {
        const result = await api.restoreReview(reviewId, token);
        if (result?.success) {
          await fetchReviews();
          await fetchTrashedReviews();
        } else {
          setError(result?.message || 'Failed to restore review');
        }
      } catch (err) {
        console.error('Restore error:', err);
        setError('Error restoring review');
      }
    }
  };

  const handlePermanentDelete = async (reviewId) => {
    if (!api.permanentDeleteReview) {
      setError('Permanent delete feature is not available');
      return;
    }
    
    if (window.confirm('Permanently delete this review? This action cannot be undone.')) {
      try {
        const result = await api.permanentDeleteReview(reviewId, token);
        if (result.success) {
          await fetchTrashedReviews();
        } else {
          setError(result?.message || 'Failed to permanently delete review');
        }
      } catch (err) {
        console.error('Permanent delete error:', err);
        setError('Error deleting review');
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditReviewData(prev => ({
      ...prev,
      [name]: name === 'rating' ? (value ? Number(value) : null) : value
    }));
  };

  const handleUpdateReview = async () => {
    if (!selectedReview) return;
    
    if (!editReviewData.title?.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!editReviewData.rating || editReviewData.rating < 1 || editReviewData.rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }
    
    try {
      const result = await api.updateReview(selectedReview.id, editReviewData, token);
      if (result.success) {
        setShowEditModal(false);
        setSelectedReview(null);
        await fetchReviews();
        await fetchTrashedReviews();
      } else {
        setError(result.message || 'Failed to update review');
      }
    } catch (err) {
      console.error('Update review error:', err);
      setError('Error updating review');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const currentListCount = activeTab === 'all' ? reviews.length : trashedReviews.length;

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

  const renderStars = (rating) => {
    if (!rating || rating === 0) {
      return <span className="no-rating">No rating</span>;
    }
    
    const numRating = typeof rating === 'number' ? rating : parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = (numRating - fullStars) >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star filled">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return null;
    }
  };

  // Mobile Review Card Component
  const ReviewCard = ({ review }) => (
    <div className={`review-card ${review.isTrashed ? 'trashed-card' : ''}`}>
      <div className="card-header">
        <div className="card-title">
          <div className="rating-stars">{renderStars(review.rating)}</div>
          <h3>{review.title || 'Untitled Review'}</h3>
        </div>
        {review.isTrashed && <span className="trashed-badge">Trashed</span>}
      </div>
      
      <div className="card-details">
        <div className="detail-item">
          <Building2 size={14} />
          <span>{review.university?.name || 'Unknown'}</span>
        </div>
        <div className="detail-item">
          <User size={14} />
          <span>{review.user?.name || 'Unknown'}</span>
        </div>
        {formatDate(review.createdAt) && (
          <div className="detail-item">
            <CalendarIcon size={14} />
            <span>{formatDate(review.createdAt)}</span>
          </div>
        )}
        {(review.helpfulCount || review.helpful) > 0 && (
          <div className="detail-item helpful">
            <span className="helpful-count">{review.helpfulCount || review.helpful || 0}</span>
            <span>people found this helpful</span>
          </div>
        )}
      </div>
      
      {review.content && (
        <div className="card-content">
          <p>{review.content.substring(0, 100)}{review.content.length > 100 ? '...' : ''}</p>
        </div>
      )}
      
      <div className="card-actions">
        <button onClick={() => handleView(review)} className="action-btn view-btn" title="View">
          <Eye size={16} />
        </button>
        {!review.isTrashed && (
          <>
            <button onClick={() => handleEdit(review)} className="action-btn edit-btn" title="Edit">
              <Edit size={16} />
            </button>
            <button onClick={() => handleSoftDelete(review.id)} className="action-btn trash-btn" title="Move to Trash">
              <Archive size={16} />
            </button>
          </>
        )}
        {review.isTrashed && (
          <>
            <button onClick={() => handleRestore(review.id)} className="action-btn restore-btn" title="Restore">
              <RotateCcw size={16} />
            </button>
            <button onClick={() => handlePermanentDelete(review.id)} className="action-btn delete-permanent-btn" title="Permanently Delete">
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      {/* View Review Modal */}
      {showReviewModal && selectedReview && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Details</h3>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {selectedReview.user?.name && (
                <div className="detail-row">
                  <div className="detail-label">Reviewer</div>
                  <div className="detail-value">{selectedReview.user.name}</div>
                </div>
              )}
              {selectedReview.university?.name && (
                <div className="detail-row">
                  <div className="detail-label">University</div>
                  <div className="detail-value">{selectedReview.university.name}</div>
                </div>
              )}
              <div className="detail-row">
                <div className="detail-label">Rating</div>
                <div className="detail-value">{selectedReview.rating || 'No rating'}</div>
              </div>
              {selectedReview.title && (
                <div className="detail-row">
                  <div className="detail-label">Title</div>
                  <div className="detail-value">{selectedReview.title}</div>
                </div>
              )}
              {(selectedReview.content || selectedReview.comment) && (
                <div className="detail-row">
                  <div className="detail-label">Comment</div>
                  <div className="detail-value review-comment">
                    {selectedReview.content || selectedReview.comment}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-close-btn" onClick={() => setShowReviewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && selectedReview && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Review</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title <span className="required">*</span></label>
                <input type="text" name="title" value={editReviewData.title} onChange={handleEditInputChange} required />
              </div>
              <div className="form-group">
                <label>Rating <span className="required">*</span></label>
                <input type="number" name="rating" min="1" max="5" step="0.1" value={editReviewData.rating || ''} onChange={handleEditInputChange} required />
                <small>Rating from 1 to 5</small>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea name="content" rows="4" value={editReviewData.content} onChange={handleEditInputChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-save-btn" onClick={handleUpdateReview}>Save Changes</button>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Reviews</h1>
          <p>Manage and moderate student reviews</p>
        </div>
        {currentListCount > 0 && (
          <div className="stats-pill">
            <Star size={18} />
            <span>{currentListCount} {activeTab === 'all' ? 'reviews' : 'in trash'}</span>
          </div>
        )}
      </div>

      <div className="reviews-control-bar">
        <div className="reviews-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} 
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
              setSearchTerm('');
            }}
          >
            <Star size={16} />
            All Reviews
            {reviews.length > 0 && <span className="tab-count">{reviews.length}</span>}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'trash' ? 'active' : ''}`} 
            onClick={() => {
              setActiveTab('trash');
              setCurrentPage(1);
              setSearchTerm('');
              fetchTrashedReviews();
            }}
          >
            <Archive size={16} />
            Trash
            {trashedReviews.length > 0 && <span className="tab-count trash-count">{trashedReviews.length}</span>}
          </button>
        </div>

        <div className="search-bar-wrapper">
          <div className="search-bar-container">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="clear-search-btn">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <EmptyState 
          title="Error" 
          message={error}
        />
      ) : filteredReviews.length === 0 ? (
        <EmptyState 
          title="No Reviews Available"
          message={searchTerm ? 'No reviews match your search criteria' : activeTab === 'all' ? 'No reviews have been submitted yet' : 'Trash is empty'}
          icon="📋"
        />
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="reviews-cards-view">
            {currentReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="reviews-table-wrapper">
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Review Title</th>
                  <th>University</th>
                  <th>Reviewer</th>
                  <th>Rating</th>
                  <th>Helpful</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentReviews.map((review) => (
                  <tr key={review.id} className={review.isTrashed ? 'trashed-row' : ''}>
                    <td className="review-title">
                      {review.title || 'Untitled Review'}
                      {review.isTrashed && <span className="trashed-badge">Trashed</span>}
                    </td>
                    <td className="university-name">{review.university?.name || 'Unknown'}</td>
                    <td className="reviewer-name">{review.user?.name || 'Unknown'}</td>
                    <td className="rating-cell">
                      <div className="rating-badge">
                        <Star size={14} className="star-icon" />
                        <span>{review.rating ? review.rating.toFixed(1) : 'No rating'}</span>
                      </div>
                    </td>
                    <td className="helpful-cell">{review.helpfulCount || review.helpful || 0}</td>
                    <td className="date-cell">{formatDate(review.createdAt) || 'N/A'}</td>
                    <td className="actions-cell">
                      <button className="view-btn" onClick={() => handleView(review)} title="View">
                        <Eye size={16} />
                      </button>
                      {!review.isTrashed && (
                        <>
                          <button className="edit-btn" onClick={() => handleEdit(review)} title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="trash-btn" onClick={() => handleSoftDelete(review.id)} title="Move to Trash">
                            <Archive size={16} />
                          </button>
                        </>
                      )}
                      {review.isTrashed && (
                        <>
                          <button className="restore-btn" onClick={() => handleRestore(review.id)} title="Restore">
                            <RotateCcw size={16} />
                          </button>
                          <button className="delete-permanent-btn" onClick={() => handlePermanentDelete(review.id)} title="Permanently Delete">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="pagination-btn"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <div className="pagination-numbers">
                {getPageNumbers().map((page, idx) => (
                  page === '...' ? (
                    <span key={`dots-${idx}`} className="page-dots">...</span>
                  ) : (
                    <button 
                      key={page} 
                      onClick={() => paginate(page)} 
                      className={`page-number ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="pagination-btn"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
          
          {/* Results Info */}
          {filteredReviews.length > 0 && (
            <div className="results-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredReviews.length)} of {filteredReviews.length} reviews
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reviews;