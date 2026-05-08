import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  MessageCircle, 
  Search, 
  Eye, 
  Trash2, 
  Archive, 
  RotateCcw,
  ChevronLeft, 
  ChevronRight,
  User,
  Clock,
  MessageSquare,
  X
} from 'lucide-react';
import './Discussions.css';

const Discussions = () => {
  const { token } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [trashedDiscussions, setTrashedDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  useEffect(() => {
    if (activeTab === 'trash') {
      fetchTrashedDiscussions();
    }
  }, [activeTab]);

  const fetchDiscussions = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getDiscussions();
      console.log('Fetched discussions:', result);
      
      // Handle different response structures
      let discussionsData = [];
      if (result.success && result.data) {
        discussionsData = Array.isArray(result.data) ? result.data : [];
      } else if (Array.isArray(result)) {
        discussionsData = result;
      } else if (result.data && Array.isArray(result.data)) {
        discussionsData = result.data;
      }
      
      // Filter out trashed discussions if they have isTrashed flag
      const activeDiscussions = discussionsData.filter(d => !d.isTrashed);
      setDiscussions(activeDiscussions);
      
      if (discussionsData.length === 0 && !result.success) {
        setError(result.message || 'Failed to load discussions');
      }
    } catch (err) {
      console.error('Fetch discussions error:', err);
      setError('Unable to load discussions. Please check your connection.');
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashedDiscussions = async () => {
    if (!api.getTrashedDiscussions) {
      console.warn('getTrashedDiscussions method not available');
      setTrashedDiscussions([]);
      return;
    }
    
    try {
      const result = await api.getTrashedDiscussions(token);
      console.log('Fetched trashed discussions:', result);
      
      let trashedData = [];
      if (result?.success && result?.data) {
        trashedData = Array.isArray(result.data) ? result.data : [];
      } else if (Array.isArray(result)) {
        trashedData = result;
      } else if (result?.data && Array.isArray(result.data)) {
        trashedData = result.data;
      }
      
      setTrashedDiscussions(trashedData);
    } catch (error) {
      console.error('Error fetching trashed discussions:', error);
      setTrashedDiscussions([]);
    }
  };

  const handleView = (discussion) => {
    setSelectedDiscussion(discussion);
    setShowViewModal(true);
  };

  const handleSoftDelete = async (id, title) => {
    if (!api.softDeleteDiscussion) {
      alert('Soft delete feature is not available');
      return;
    }
    
    if (window.confirm(`Move "${title}" to trash? You can restore it later.`)) {
      try {
        const result = await api.softDeleteDiscussion(id, token);
        if (result?.success) {
          await fetchDiscussions();
          if (activeTab === 'trash') {
            await fetchTrashedDiscussions();
          }
          alert('Discussion moved to trash successfully');
        } else {
          alert(result?.message || 'Failed to move discussion to trash');
        }
      } catch (err) {
        console.error('Soft delete error:', err);
        alert('Error moving discussion to trash');
      }
    }
  };

  const handleRestore = async (id, title) => {
    if (!api.restoreDiscussion) {
      alert('Restore feature is not available');
      return;
    }
    
    if (window.confirm(`Restore "${title}" from trash?`)) {
      try {
        const result = await api.restoreDiscussion(id, token);
        if (result?.success) {
          await fetchDiscussions();
          await fetchTrashedDiscussions();
          alert('Discussion restored successfully');
        } else {
          alert(result?.message || 'Failed to restore discussion');
        }
      } catch (err) {
        console.error('Restore error:', err);
        alert('Error restoring discussion');
      }
    }
  };

  const handlePermanentDelete = async (id, title) => {
    if (!api.permanentDeleteDiscussion) {
      alert('Permanent delete feature is not available');
      return;
    }
    
    if (window.confirm(`Permanently delete "${title}"? This action cannot be undone.`)) {
      try {
        const result = await api.permanentDeleteDiscussion(id, token);
        if (result?.success) {
          await fetchTrashedDiscussions();
          alert('Discussion permanently deleted');
        } else {
          alert(result?.message || 'Failed to permanently delete discussion');
        }
      } catch (err) {
        console.error('Permanent delete error:', err);
        alert('Error deleting discussion');
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const currentList = activeTab === 'all' ? discussions : trashedDiscussions;
  
  const filteredList = currentList.filter(discussion =>
    discussion.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  const currentListCount = activeTab === 'all' ? discussions.length : trashedDiscussions.length;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return 'Invalid Date';
    }
  };

  // Mobile Card Component
  const DiscussionCard = ({ discussion }) => (
    <div className={`discussion-card ${discussion.isTrashed ? 'trashed-card' : ''}`}>
      <div className="card-header">
        <div className="card-title">
          <h3>{discussion.title || 'Untitled'}</h3>
        </div>
        {discussion.isTrashed && <span className="trashed-badge">Trashed</span>}
      </div>
      
      <div className="card-details">
        <div className="detail-item">
          <User size={14} />
          <span>{discussion.author?.name || 'Unknown'}</span>
        </div>
        <div className="detail-item">
          <MessageSquare size={14} />
          <span>{discussion.replies || discussion._count?.comments || 0} replies</span>
        </div>
        <div className="detail-item">
          <Clock size={14} />
          <span>{formatDate(discussion.createdAt)}</span>
        </div>
      </div>
      
      <div className="card-content">
        <p>{discussion.content?.substring(0, 100)}{discussion.content?.length > 100 ? '...' : ''}</p>
      </div>
      
      <div className="card-actions">
        <button onClick={() => handleView(discussion)} className="action-btn view-btn" title="View">
          <Eye size={16} />
        </button>
        {!discussion.isTrashed && (
          <button onClick={() => handleSoftDelete(discussion.id, discussion.title)} className="action-btn trash-btn" title="Move to Trash">
            <Archive size={16} />
          </button>
        )}
        {discussion.isTrashed && (
          <>
            <button onClick={() => handleRestore(discussion.id, discussion.title)} className="action-btn restore-btn" title="Restore">
              <RotateCcw size={16} />
            </button>
            <button onClick={() => handlePermanentDelete(discussion.id, discussion.title)} className="action-btn delete-permanent-btn" title="Permanently Delete">
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );

  const getPageNumbers = () => {
    if (totalPages <= 1) return [];
    
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

  return (
    <div className="discussions-page">
      {/* View Modal */}
      {showViewModal && selectedDiscussion && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Discussion Details</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-label">Title</div>
                <div className="detail-value">{selectedDiscussion.title || 'Untitled'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Author</div>
                <div className="detail-value">
                  <User size={14} style={{ marginRight: '8px' }} />
                  {selectedDiscussion.author?.name || 'Unknown'}
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Content</div>
                <div className="detail-value content">
                  {selectedDiscussion.content || 'No content'}
                </div>
              </div>
              <div className="detail-row two-col">
                <div className="detail-col">
                  <div className="detail-label">Replies</div>
                  <div className="detail-value">
                    <MessageSquare size={14} style={{ marginRight: '8px' }} />
                    {selectedDiscussion.replies || selectedDiscussion._count?.comments || 0}
                  </div>
                </div>
                <div className="detail-col">
                  <div className="detail-label">Created At</div>
                  <div className="detail-value">
                    <Clock size={14} style={{ marginRight: '8px' }} />
                    {formatDate(selectedDiscussion.createdAt)}
                  </div>
                </div>
              </div>
              {selectedDiscussion.tags?.length > 0 && (
                <div className="detail-row">
                  <div className="detail-label">Tags</div>
                  <div className="detail-value tags">
                    {selectedDiscussion.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-close-btn" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Discussions</h1>
          <p>Manage and moderate community discussions</p>
        </div>
        <div className="stats-pill">
          <MessageCircle size={18} />
          <span>{currentListCount} {activeTab === 'all' ? 'discussions' : 'in trash'}</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="discussions-control-bar">
        <div className="discussions-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
              setSearchTerm('');
              fetchDiscussions();
            }}
          >
            <MessageCircle size={16} />
            All Discussions
            <span className="tab-count">{discussions.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'trash' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('trash');
              setCurrentPage(1);
              setSearchTerm('');
              fetchTrashedDiscussions();
            }}
          >
            <Archive size={16} />
            Trash
            <span className="tab-count trash-count">{trashedDiscussions.length}</span>
          </button>
        </div>

        <div className="search-bar-wrapper">
          <div className="search-bar-container">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder={`Search by title, content, or author...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading discussions...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchDiscussions}>Try Again</button>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No discussions found</h3>
          <p>{searchTerm ? 'Try adjusting your search' : activeTab === 'all' ? 'Discussions will appear here' : 'Trash is empty'}</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="discussions-cards-view">
            {paginatedList.map((discussion) => (
              <DiscussionCard key={discussion.id} discussion={discussion} />
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="discussions-table-wrapper">
            <table className="discussions-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Replies</th>
                  <th>Views</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((discussion) => (
                  <tr key={discussion.id} className={discussion.isTrashed ? 'trashed-row' : ''}>
                    <td className="discussion-title">
                      {discussion.title || 'Untitled'}
                      {discussion.isTrashed && <span className="trashed-badge">Trashed</span>}
                    </td>
                    <td className="author-name">
                      {discussion.author?.name || 'Unknown'}
                    </td>
                    <td className="replies-count">
                      {discussion.replies || discussion._count?.comments || 0}
                    </td>
                    <td className="views-count">
                      {discussion.views || 0}
                    </td>
                    <td className="date-cell">
                      {formatDate(discussion.createdAt)}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="view-btn" 
                        onClick={() => handleView(discussion)}
                        title="View Discussion"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {!discussion.isTrashed && (
                        <button 
                          className="trash-btn" 
                          onClick={() => handleSoftDelete(discussion.id, discussion.title)}
                          title="Move to Trash"
                        >
                          <Archive size={16} />
                        </button>
                      )}
                      
                      {discussion.isTrashed && (
                        <>
                          <button 
                            className="restore-btn" 
                            onClick={() => handleRestore(discussion.id, discussion.title)}
                            title="Restore from Trash"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button 
                            className="delete-permanent-btn" 
                            onClick={() => handlePermanentDelete(discussion.id, discussion.title)}
                            title="Permanently Delete"
                          >
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
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                      onClick={() => setCurrentPage(page)}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
          
          {/* Results Info */}
          {filteredList.length > 0 && (
            <div className="results-info">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredList.length)} of {filteredList.length} discussions
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Discussions;