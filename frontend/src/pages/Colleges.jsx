import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { CollegeFilters } from '../components/CollegeFilters/CollegeFilters';
import './Colleges.css';

const Colleges = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiError, setApiError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, pages: 1, total: 0 });
  
  // Filter states for server-side query
  const [filters, setFilters] = useState({
    academicStream: '',
    academicLevel: '',
    department: '',
    course: '',
    location: '',
    transport: '',
    minRating: '',
    maxRating: ''
  });
  const [sortBy, setSortBy] = useState('best');

  // Helper function to get logo URL - NO HARDCODED FALLBACKS
  const getLogoUrl = (college) => {
    if (college.logoUrl && college.logoUrl !== '') return college.logoUrl;
    if (college.imageUrl && college.imageUrl !== '') return college.imageUrl;
    if (college.image && college.image !== '') return college.image;
    if (college.images && college.images.length > 0) return college.images[0];
    return null;
  };

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');

    if (searchParam) {
      setSearchTerm(searchParam);
    }

    const fetchColleges = async () => {
      setLoading(true);
      setApiError(null);

      const apiParams = {
        page: currentPage,
        limit: itemsPerPage,
        collegeName: searchParam || searchTerm || undefined,
        location: filters.location || undefined,
        academicStream: filters.academicStream || undefined,
        academicLevel: filters.academicLevel || undefined,
        department: filters.department || undefined,
        course: filters.course || undefined,
        transport: filters.transport || undefined,
        minRating: filters.minRating || undefined,
        maxRating: filters.maxRating || undefined,
      };

      try {
        const result = await api.getColleges(apiParams);
        if (!mounted) return;

        if (result.success && Array.isArray(result.data)) {
          const transformed = result.data.map((college) => ({
            ...college,
            id: college.id,
            name: college.name,
            logoUrl: getLogoUrl(college),
            location: college.location || college.city || college.state,
            description: college.description,
            students: college.studentCount ? `${college.studentCount.toLocaleString()}+` : null,
            reviews: college._count?.reviews ?? 0,
            netPrice: college.tuitionFee || null,
            acceptanceRate: college.acceptanceRate || null,
            rating: college.rating || null,
          }));
          setColleges(transformed);
          setPagination(result.pagination || { page: currentPage, limit: itemsPerPage, pages: 1, total: result.total || transformed.length });
          console.log(`✅ Loaded ${transformed.length} colleges`);
        } else {
          setApiError(result.error || 'Unable to fetch colleges.');
          setColleges([]);
          setPagination({ page: currentPage, limit: itemsPerPage, pages: 1, total: 0 });
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
        setApiError(error.message || 'Connection error.');
        setColleges([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchColleges();
    return () => {
      mounted = false;
    };
  }, [location.search, searchTerm, filters, currentPage]);

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const sortedColleges = useMemo(() => {
    if (sortBy === 'rating') {
      return [...colleges].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return colleges;
  }, [colleges, sortBy]);

  const currentColleges = sortedColleges;
  const totalPages = pagination.pages || 1;

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

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      academicStream: '',
      academicLevel: '',
      department: '',
      course: '',
      location: '',
      transport: '',
      minRating: '',
      maxRating: ''
    });
    setSearchTerm('');
    setSortBy('best');
    setCurrentPage(1);
    navigate({ pathname: location.pathname, search: '' }, { replace: true });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`pagination-number ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  if (loading) {
    return (
      <div className="colleges-loading">
        <div className="spinner"></div>
        <p>Loading colleges...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="colleges-error">
        <p>{apiError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="colleges-page">
      <div className="container">
        {/* Hero Heading Section */}
        <div className="hero-heading">
          <h1 className="hero-title">Find Your Perfect College</h1>
          <p className="hero-subtitle">
            Browse through our list of institutions
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-container prominent">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by college name, location, or city..."
                className="search-input prominent-input"
              />
              {searchTerm && (
                <button 
                  type="button" 
                  className="search-clear" 
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
            <button type="button" className="clear-search prominent-clear" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>

        <CollegeFilters
          initialFilters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Sort Bar */}
        <div className="sort-bar">
          <div className="results-info">
            <span className="results-count">
              Showing {filteredColleges.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredColleges.length)} of {filteredColleges.length} results
            </span>
          </div>
          <div className="sort-options">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="best">Best Match</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Cards Grid - NO HARDCODED FALLBACKS */}
        <div className="colleges-grid">
          {currentColleges.length > 0 ? (
            currentColleges.map((college) => (
              <div 
                key={college.id} 
                className="college-card"
                onClick={() => navigate(`/university/${college.id}`)}
              >
                <div className="college-card-header">
                  <div className="college-logo">
                    {college.logoUrl ? (
                      <img
                        src={college.logoUrl}
                        alt={`${college.name} logo`}
                        className="college-logo-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="college-logo-placeholder" style={{ display: college.logoUrl ? 'none' : 'flex' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 2 6 2 9 0v-5" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="college-name">{college.name}</h3>
                    <p className="college-location">{college.location || 'Location not specified'}</p>
                  </div>
                </div>
                
                <div className="college-stats">
                  {college.students && (
                    <div className="stat">
                      <span className="stat-label">STUDENTS</span>
                      <span className="stat-value">{college.students}</span>
                    </div>
                  )}
                  {college.netPrice && (
                    <div className="stat">
                      <span className="stat-label">FEE</span>
                      <span className="stat-value">{college.netPrice}</span>
                    </div>
                  )}
                  {!college.students && !college.netPrice && (
                    <div className="stat no-data">
                      <span className="stat-value">No data available</span>
                    </div>
                  )}
                </div>
                
                <div className="card-footer">
                  <button className="details-btn">View Details</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No colleges found matching your criteria.</p>
              <button onClick={clearFilters}>Clear all filters</button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredColleges.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <button 
              className="pagination-prev"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              ‹ Previous
            </button>
            <div className="pagination-numbers">
              {renderPaginationButtons()}
            </div>
            <button 
              className="pagination-next"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next ›
            </button>
          </div>
        )}

        {filteredColleges.length === 0 && currentColleges.length === 0 && !loading && (
          <div className="no-results">
            <p>No colleges found matching your criteria.</p>
            <button onClick={clearFilters}>Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;