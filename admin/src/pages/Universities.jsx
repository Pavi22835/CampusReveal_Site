import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  GraduationCap,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Users,
  Calendar,
  Archive,
  RotateCcw,
  BookOpen,
  DollarSign
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import './Universities.css';

const Universities = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [trashedUniversities, setTrashedUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
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
    fetchUniversities();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'trash') {
      fetchTrashedUniversities();
    }
  }, [activeTab]);

  const fetchUniversities = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getUniversities(token);
      if (result.success && result.data) {
        const activeUniversities = result.data.filter(uni => !uni.isTrashed);
        setUniversities(activeUniversities);
      } else {
        setUniversities([]);
        setError(result.message || 'No Data Available');
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
      setError('Failed to load universities');
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashedUniversities = async () => {
    try {
      if (!api.getTrashedUniversities) {
        setTrashedUniversities([]);
        return;
      }
      
      const result = await api.getTrashedUniversities(token);
      if (result?.success && result?.data) {
        setTrashedUniversities(result.data);
      } else {
        setTrashedUniversities([]);
      }
    } catch (error) {
      console.error('Error fetching trashed universities:', error);
      setTrashedUniversities([]);
    }
  };

  const handleSoftDelete = async (id, name) => {
    if (!api.softDeleteUniversity) {
      setError('Soft delete feature is not available');
      return;
    }
    
    if (window.confirm(`Move "${name}" to trash? You can restore it later.`)) {
      try {
        const result = await api.softDeleteUniversity(id, token);
        if (result?.success) {
          await fetchUniversities();
          await fetchTrashedUniversities();
        } else {
          setError(result?.message || 'Failed to move university to trash');
        }
      } catch (error) {
        console.error('Error moving to trash:', error);
        setError('Error moving university to trash');
      }
    }
  };

  const handleRestore = async (id, name) => {
    if (!api.restoreUniversity) {
      setError('Restore feature is not available');
      return;
    }
    
    if (window.confirm(`Restore "${name}" from trash?`)) {
      try {
        const result = await api.restoreUniversity(id, token);
        if (result?.success) {
          await fetchUniversities();
          await fetchTrashedUniversities();
        } else {
          setError(result?.message || 'Failed to restore university');
        }
      } catch (error) {
        console.error('Error restoring:', error);
        setError('Error restoring university');
      }
    }
  };

  const handlePermanentDelete = async (id, name) => {
    if (!api.permanentDeleteUniversity) {
      setError('Permanent delete feature is not available');
      return;
    }
    
    if (window.confirm(`Permanently delete "${name}"? This action cannot be undone.`)) {
      try {
        const result = await api.permanentDeleteUniversity(id, token);
        if (result.success) {
          await fetchTrashedUniversities();
        } else {
          setError(result.message || 'Failed to permanently delete university');
        }
      } catch (error) {
        console.error('Error deleting:', error);
        setError('Error deleting university');
      }
    }
  };

  const handleView = async (id) => {
    try {
      const result = await api.getUniversity(id);
      if (result.success && result.data) {
        setSelectedUniversity(result.data);
        setShowViewModal(true);
      } else {
        setError('No Data Available');
      }
    } catch (error) {
      console.error('Error fetching university details:', error);
      setError('Error loading university details');
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/universities/edit/${id}`);
  };

  const currentList = activeTab === 'all' ? universities : trashedUniversities;

  const filteredList = currentList.filter(uni =>
    uni.name?.toLowerCase().includes(search.toLowerCase()) ||
    (uni.location && uni.location.toLowerCase().includes(search.toLowerCase())) ||
    (uni.city && uni.city.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  // Mobile Card Component
  const UniversityCard = ({ uni, isTrashedView }) => (
    <div className={`university-card ${uni.isTrashed ? 'trashed-card' : ''}`}>
      <div className="card-header">
        <div className="card-title">
          <GraduationCap size={18} className="card-icon" />
          <h3>{uni.name}</h3>
        </div>
        {uni.isTrashed && <span className="trashed-badge">Trashed</span>}
      </div>

      <div className="card-details">
        {(uni.location || uni.city) && (
          <div className="detail-item">
            <MapPin size={14} />
            <span>{[uni.city, uni.state].filter(Boolean).join(', ') || uni.location}</span>
          </div>
        )}
        {uni.rating && (
          <div className="detail-item">
            <Star size={14} className="star-icon" />
            <span>{uni.rating} / 5</span>
          </div>
        )}
        {uni.studentCount && (
          <div className="detail-item">
            <Users size={14} />
            <span>{uni.studentCount.toLocaleString()} Students</span>
          </div>
        )}
        {(uni._count?.reviews !== undefined) && (
          <div className="detail-item">
            <BookOpen size={14} />
            <span>{uni._count.reviews} Reviews</span>
          </div>
        )}
        {uni.tuitionFee && (
          <div className="detail-item">
            <DollarSign size={14} />
            <span>₹{uni.tuitionFee.toLocaleString()}</span>
          </div>
        )}
        {(uni.updatedAt || uni.createdAt) && (
          <div className="detail-item">
            <Calendar size={14} />
            <span>Updated: {formatDate(uni.updatedAt || uni.createdAt)}</span>
          </div>
        )}
      </div>

      <div className="card-actions">
        <button onClick={() => handleView(uni.id)} className="action-btn view-btn" title="View">
          <Eye size={16} />
        </button>
        {!uni.isTrashed && (
          <>
            <button onClick={() => handleEdit(uni.id)} className="action-btn edit-btn" title="Edit">
              <Edit size={16} />
            </button>
            <button onClick={() => handleSoftDelete(uni.id, uni.name)} className="action-btn trash-btn" title="Move to Trash">
              <Trash2 size={16} />
            </button>
          </>
        )}
        {uni.isTrashed && (
          <>
            <button onClick={() => handleRestore(uni.id, uni.name)} className="action-btn restore-btn" title="Restore">
              <RotateCcw size={16} />
            </button>
            <button onClick={() => handlePermanentDelete(uni.id, uni.name)} className="action-btn delete-permanent-btn" title="Permanently Delete">
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading universities...</p>
      </div>
    );
  }

  return (
    <div className="universities-page">
      {/* View Modal */}
      {showViewModal && selectedUniversity && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content-compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-compact">
              <h3>University Details</h3>
              <button className="modal-close-compact" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body-compact">
              {selectedUniversity.logoUrl ? (
                <div className="university-image-wrapper">
                  <div className="university-detail-image">
                    <img
                      src={selectedUniversity.logoUrl}
                      alt={selectedUniversity.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="no-image-placeholder">No Image Available</div>';
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="no-image-placeholder">No Image Available</div>
              )}
              
              <div className="detail-row-compact">
                <div className="detail-label-compact">University Name</div>
                <div className="detail-value-compact">{selectedUniversity.name}</div>
              </div>
              
              {selectedUniversity.shortName && (
                <div className="detail-row-compact">
                  <div className="detail-label-compact">Short Name</div>
                  <div className="detail-value-compact">{selectedUniversity.shortName}</div>
                </div>
              )}
              
              {(selectedUniversity.location || selectedUniversity.city) && (
                <div className="detail-row-compact">
                  <div className="detail-label-compact">Location</div>
                  <div className="detail-value-compact">
                    <MapPin size={14} />
                    {[selectedUniversity.city, selectedUniversity.state, selectedUniversity.location]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>
              )}
              
              {selectedUniversity.googleMapsLink && (
                <div className="detail-row-compact">
                  <div className="detail-label-compact">Map Link</div>
                  <div className="detail-value-compact link">
                    <a href={selectedUniversity.googleMapsLink} target="_blank" rel="noreferrer">Open in Maps</a>
                  </div>
                </div>
              )}
              
              <div className="detail-row-compact two-col">
                {selectedUniversity.city && (
                  <div className="detail-col">
                    <div className="detail-label-compact">City</div>
                    <div className="detail-value-compact">{selectedUniversity.city}</div>
                  </div>
                )}
                {selectedUniversity.state && (
                  <div className="detail-col">
                    <div className="detail-label-compact">State</div>
                    <div className="detail-value-compact">{selectedUniversity.state}</div>
                  </div>
                )}
              </div>
              
              <div className="detail-row-compact two-col">
                {selectedUniversity.established && (
                  <div className="detail-col">
                    <div className="detail-label-compact">Established</div>
                    <div className="detail-value-compact">{selectedUniversity.established}</div>
                  </div>
                )}
                {selectedUniversity.type && (
                  <div className="detail-col">
                    <div className="detail-label-compact">Type</div>
                    <div className="detail-value-compact">{selectedUniversity.type}</div>
                  </div>
                )}
              </div>
              
              <div className="detail-row-compact two-col">
                {selectedUniversity.rating && (
                  <div className="detail-col">
                    <div className="detail-label-compact">Rating</div>
                    <div className="detail-value-compact rating">
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      {selectedUniversity.rating}
                    </div>
                  </div>
                )}
                {selectedUniversity.studentCount && (
                  <div className="detail-col">
                    <div className="detail-label-compact">Student Count</div>
                    <div className="detail-value-compact">
                      <Users size={14} />
                      {selectedUniversity.studentCount.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="detail-row-compact two-col">
                {selectedUniversity._count?.reviews !== undefined && (
                  <div className="detail-col">
                    <div className="detail-label-compact">Total Reviews</div>
                    <div className="detail-value-compact">{selectedUniversity._count.reviews} reviews</div>
                  </div>
                )}
                {selectedUniversity.averagePackage && (
                  <div className="detail-col">
                    <div className="detail-label-compact">Average Package</div>
                    <div className="detail-value-compact">{selectedUniversity.averagePackage}</div>
                  </div>
                )}
              </div>
              
              {selectedUniversity.academicStreams && selectedUniversity.academicStreams.length > 0 && (
                <div className="detail-row-compact">
                  <div className="detail-label-compact">Academic Streams</div>
                  <div className="detail-value-compact">
                    {selectedUniversity.academicStreams.join(', ')}
                  </div>
                </div>
              )}
              
              {selectedUniversity.academicLevels && selectedUniversity.academicLevels.length > 0 && (
                <div className="detail-row-compact">
                  <div className="detail-label-compact">Academic Levels</div>
                  <div className="detail-value-compact">
                    {selectedUniversity.academicLevels.join(', ')}
                  </div>
                </div>
              )}
              
              {selectedUniversity.createdAt && (
                <div className="detail-row-compact">
                  <div className="detail-label-compact">Created At</div>
                  <div className="detail-value-compact">
                    <Calendar size={14} />
                    {formatDate(selectedUniversity.createdAt)}
                  </div>
                </div>
              )}
              
              {selectedUniversity.updatedAt && (
                <div className="detail-row-compact">
                  <div className="detail-label-compact">Last Updated</div>
                  <div className="detail-value-compact">
                    <Calendar size={14} />
                    {formatDate(selectedUniversity.updatedAt)}
                  </div>
                </div>
              )}
              
              {selectedUniversity.description && (
                <div className="detail-row-compact">
                  <div className="detail-label-compact">Description</div>
                  <div className="detail-value-compact description">
                    {selectedUniversity.description}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer-compact">
              <button className="modal-edit-btn" onClick={() => {
                setShowViewModal(false);
                handleEdit(selectedUniversity.id);
              }}>
                <Edit size={14} /> Edit University
              </button>
              <button className="modal-close-btn" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Universities</h1>
          <p>Manage all universities in the platform</p>
        </div>
        <Link to="/admin/add-university" className="add-btn">
          <Plus size={18} />
          Add University
        </Link>
      </div>

      {/* Error Display */}
      {error && !loading && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Control Bar */}
      <div className="universities-control-bar">
        <div className="universities-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
              setSearch('');
            }}
          >
            <GraduationCap size={16} />
            All Universities
            {universities.length > 0 && <span className="tab-count">{universities.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === 'trash' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('trash');
              setCurrentPage(1);
              setSearch('');
              fetchTrashedUniversities();
            }}
          >
            <Archive size={16} />
            Trash
            {trashedUniversities.length > 0 && <span className="tab-count trash-count">{trashedUniversities.length}</span>}
          </button>
        </div>

        <div className="search-bar-wrapper">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!loading && !error && filteredList.length === 0 && (
        <EmptyState 
          title="No Universities Available"
          message={search ? 'No universities match your search criteria' : activeTab === 'all' ? 'No universities have been added yet' : 'Trash is empty'}
          actionButton={activeTab === 'all' && !search ? 'Add Your First University' : undefined}
          onAction={activeTab === 'all' && !search ? () => navigate('/admin/add-university') : undefined}
        />
      )}

      {/* Content - Only show if there are results */}
      {!loading && !error && filteredList.length > 0 && (
        <>
          {/* Mobile Card View */}
          <div className="universities-cards-view">
            {paginatedList.map((uni) => (
              <UniversityCard key={uni.id} uni={uni} />
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="universities-table-container">
            <table className="universities-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>University Name</th>
                  <th>Location</th>
                  <th>Rating</th>
                  <th>Students</th>
                  <th>Reviews</th>
                  <th>Fee</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedList.map((uni) => (
                  <tr key={uni.id} className={uni.isTrashed ? 'trashed-row' : ''}>
                    <td className="uni-id">{uni.id?.slice(-8)}</td>
                    <td className="uni-name">
                      <GraduationCap size={16} />
                      {uni.name}
                      {uni.isTrashed && <span className="trashed-badge">Trashed</span>}
                    </td>
                    <td>{[uni.city, uni.state].filter(Boolean).join(', ') || uni.location || 'N/A'}</td>
                    <td className="rating-cell">
                      {uni.rating ? (
                        <span className="rating-badge">
                          ★ {uni.rating}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>{uni.studentCount?.toLocaleString() || 'N/A'}</td>
                    <td>{uni._count?.reviews || 0}</td>
                    <td>{uni.tuitionFee ? `₹${uni.tuitionFee.toLocaleString()}` : 'N/A'}</td>
                    <td className="updated-date">{formatDate(uni.updatedAt || uni.createdAt) || 'N/A'}</td>
                    <td className="actions">
                      <button onClick={() => handleView(uni.id)} className="view-btn" title="View">
                        <Eye size={16} />
                      </button>
                      {!uni.isTrashed && (
                        <>
                          <button onClick={() => handleEdit(uni.id)} className="edit-btn" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleSoftDelete(uni.id, uni.name)} className="trash-btn" title="Move to Trash">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      {uni.isTrashed && (
                        <>
                          <button onClick={() => handleRestore(uni.id, uni.name)} className="restore-btn" title="Restore">
                            <RotateCcw size={16} />
                          </button>
                          <button onClick={() => handlePermanentDelete(uni.id, uni.name)} className="delete-permanent-btn" title="Permanently Delete">
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
                className="prev-next-btn"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="page-numbers">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`dots-${index}`} className="page-dots">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`page-number ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="prev-next-btn"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Results Info */}
          <div className="results-info">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredList.length)} of {filteredList.length} universities
            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
          </div>
        </>
      )}
    </div>
  );
};

export default Universities;