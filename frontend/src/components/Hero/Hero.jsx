import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Search as SearchIcon, X } from 'lucide-react';
import { api } from '../services/api'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDetailsModal from './ProfileDetailsModal';
import './hero.css';

const Hero = ({ setSearchQuery }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, requireAuth } = useAuth();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [filters, setFilters] = useState({
    type: [],
    degree: '',
    course: '',
    location: ''
  });

  const inputRef = useRef(null);

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getUniversities({ limit: 100 });
        if (res?.data) {
          setColleges(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // ================= SUGGESTIONS =================
  useEffect(() => {
    if (input.length > 0) {
      const normalized = input.toLowerCase();
      const filtered = colleges
        .filter(c =>
          c.name?.toLowerCase().includes(normalized) ||
          c.location?.toLowerCase().includes(normalized) ||
          c.city?.toLowerCase().includes(normalized) ||
          c.category?.toLowerCase().includes(normalized)
        )
        .slice(0, 6);

      setSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [input, colleges]);

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    const handleClick = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ================= HANDLERS =================
  const handleSelect = (college) => {
    setInput(college.name);
    setShowDropdown(false);
    // Navigate directly to university page when selected
    navigate(`/university/${college.id}`);
  };

  const handleCheckbox = (value) => {
    setFilters(prev => ({
      ...prev,
      type: prev.type.includes(value)
        ? prev.type.filter(v => v !== value)
        : [...prev.type, value]
    }));
  };

  const handleSearch = async () => {
    if (!input.trim()) return;
    
    try {
      // Navigate to search results page with query
      navigate(`/colleges?search=${encodeURIComponent(input.trim())}`);
      setShowDropdown(false);
      
      // Also update parent if setSearchQuery prop exists
      if (setSearchQuery) {
        const res = await api.searchUniversitiesAdvanced({
          search: input,
          type: filters.type,
          degree: filters.degree,
          course: filters.course,
          location: filters.location
        });
        if (res?.data) {
          setSearchQuery(res.data);
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback: still navigate with search term
      navigate(`/colleges?search=${encodeURIComponent(input.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTagClick = (tag) => {
    setInput(tag);
    navigate(`/colleges?search=${encodeURIComponent(tag)}`);
  };

  // ================= HANDLE WRITE REVIEW CLICK =================
  const handleWriteReviewClick = () => {
    // Show profile details modal directly
    setShowProfileModal(true);
  };

  // ================= HANDLE PROFILE SUCCESS =================
  const handleProfileSuccess = () => {
    // After profile is verified, navigate to write review
    navigate('/write-review');
  };

  return (
    <>
      <section
        className="hero"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 26, 58, 0.95), rgba(49, 46, 129, 0.95))'
        }}
      >
        <div className="hero-content">
          <span className="tag">DISCOVER YOUR CAMPUS</span>

          <h1>
            Find Colleges, Courses & Exams Best for <span>You</span>
          </h1>

          <p>
            Join 12K+ students sharing real reviews, placement insights, and campus guides.
          </p>

          {/* PREMIUM SEARCH */}
          <div className="premium-search" ref={inputRef}>

            {/* INPUT - UPDATED with BOLD and BLINKING CURSOR */}
            <div className="search-main">
              <div className="search-input-wrapper">
                <SearchIcon size={20} className="search-input-icon" />
                <input
                  type="text"
                  placeholder="🔍 Search by college name, location, city..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="search-input-bold blinking-cursor"
                  style={{ 
                    fontWeight: 'bold',
                    color: '#1e293b',
                    fontSize: '16px'
                  }}
                />
                {input && (
                  <button onClick={() => setInput('')} className="clear-input-btn">
                    <X size={16} />
                  </button>
                )}
              </div>

              <button onClick={handleSearch} className="search-btn">
                Search <ArrowRight size={18} />
              </button>
            </div>

            {/* DROPDOWN */}
            {showDropdown && suggestions.length > 0 && (
              <div className="search-dropdown">
                <div className="dropdown-header">
                  <span>🏫 Suggested Colleges ({suggestions.length})</span>
                </div>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    className="dropdown-item"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="item-icon">📚</div>
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-loc">{item.location || item.city || 'India'}</span>
                      {item.rating && (
                        <span className="item-rating">⭐ {item.rating}</span>
                      )}
                    </div>
                    <ArrowRight size={16} className="item-arrow" />
                  </div>
                ))}
              </div>
            )}

            {/* FILTERS - PREMIUM STYLE */}
            <div className="search-filters">
              <div className="filter-item">
                <label>College Type</label>
                <div className="filter-pills">
                  {['Engineering', 'Arts', 'Management'].map(type => (
                    <button 
                      key={type}
                      onClick={() => handleCheckbox(type)}
                      className={`pill ${filters.type.includes(type) ? 'active' : ''}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-item">
                <label>Degree</label>
                <select 
                  value={filters.degree}
                  onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
                  className="filter-select"
                >
                  <option value="">Select Degree</option>
                  <option value="UG">Undergraduate (UG)</option>
                  <option value="PG">Postgraduate (PG)</option>
                  <option value="Diploma">Diploma</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="City or state..."
                  className="filter-input-small"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Popular Search Tags */}
          <div className="popular-tags">
            <span className="tags-label">Popular searches:</span>
            <div className="tags-container">
              {['Engineering', 'Management', 'Chennai', 'Coimbatore', 'IIT Madras', 'Anna University'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="tag-btn"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FLOATING REVIEW CARD */}
        <div className="review-float-card">
          <div className="review-card-inner">
            <div className="flex flex-col gap-1 text-left">
              <h3 className="text-2xl font-black text-[#1a1a3a] flex items-center gap-3">
                Write a Review 
              </h3>
              <p className="text-slate-500 text-base font-medium">Share your college experience and help future students</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleWriteReviewClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md font-bold text-base transition-all flex items-center gap-2 group"
              >
                Write a Review <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="bg-amber-50 px-6 py-3 rounded-md flex items-center gap-3 border border-amber-200 shadow-sm">
                <Sparkles size={20} className="text-amber-600" />
                <span className="text-amber-700 font-bold text-sm">Get Upto 300 Credits</span>
              </div>
            </div>
          </div>
          
          {/* Carousel Indicator */}
          <div className="flex justify-center mt-6">
            <div className="bg-black/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-sm font-bold">
              1 / 3
            </div>
          </div>
        </div>
      </section>

      {/* Profile Details Modal */}
      <ProfileDetailsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSuccess={handleProfileSuccess}
      />
    </>
  );
};

export default Hero;