import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import './searchBar.css';

const SearchBar = ({ searchQuery, setSearchQuery, placeholder }) => {
  const navigate = useNavigate();
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [collegeSearchInput, setCollegeSearchInput] = useState('');
  const [locationSearchInput, setLocationSearchInput] = useState('');
  const [universities, setUniversities] = useState([]);
  const [locations, setLocations] = useState([]);

  const collegeRef = useRef(null);
  const locationRef = useRef(null);

  // ================= FETCH UNIVERSITIES =================
  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const result = await api.getUniversities({ limit: 200 });

      // ✅ safer check
      if (result?.data) {
        setUniversities(result.data);

        const uniqueLocations = [
          ...new Set(
            result.data
              .map(
                (uni) =>
                  uni.city ||
                  uni.location?.split(',')[0]?.trim()
              )
              .filter(Boolean)
          ),
        ];

        setLocations(uniqueLocations);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  // ================= FILTER COLLEGES =================
  const filteredColleges = useMemo(() => {
    if (!collegeSearchInput) return [];

    return universities
      .filter((college) =>
        college.name?.toLowerCase().includes(collegeSearchInput.toLowerCase())
      )
      .slice(0, 10);
  }, [collegeSearchInput, universities]);

  // ================= FILTER LOCATIONS =================
  const filteredLocations = useMemo(() => {
    if (!locationSearchInput) return [];

    return locations
      .filter((location) =>
        location.toLowerCase().includes(locationSearchInput.toLowerCase())
      )
      .slice(0, 10);
  }, [locationSearchInput, locations]);

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (collegeRef.current && !collegeRef.current.contains(event.target)) {
        setShowCollegeDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ================= HANDLERS =================
  const handleCollegeSelect = (collegeName) => {
    setSelectedCollege(collegeName);
    setCollegeSearchInput(collegeName);
    setShowCollegeDropdown(false);
    setSearchQuery(collegeName);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationSearchInput(location);
    setShowLocationDropdown(false);
    setSearchQuery(location);
  };

  const handleClearFilters = () => {
    setSelectedCollege('');
    setSelectedLocation('');
    setCollegeSearchInput('');
    setLocationSearchInput('');
    setSearchQuery('');
  };

  const handleExplore = () => {
    const searchTerm =
      collegeSearchInput || locationSearchInput || searchQuery;

    if (searchTerm) {
      setSearchQuery(searchTerm);
      // Navigate to colleges page with search parameter
      navigate(`/colleges?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="search-container">
      <div className="search-filters">

        {/* 🎓 COLLEGE SEARCH */}
        <div className="filter-group" ref={collegeRef}>
          <div className="filter-input-wrapper">
            <span className="filter-icon">🎓</span>
            <input
              type="text"
              placeholder="Search College"
              value={collegeSearchInput}
              onChange={(e) => {
                setCollegeSearchInput(e.target.value);
                setShowCollegeDropdown(true);
              }}
              onFocus={() => setShowCollegeDropdown(true)}
              className="filter-input"
            />
          </div>

          {showCollegeDropdown && filteredColleges.length > 0 && (
            <div className="dropdown-menu">
              {filteredColleges.map((college) => (
                <div
                  key={college.id}
                  className="dropdown-item"
                  onClick={() => handleCollegeSelect(college.name)}
                >
                  <span className="dropdown-icon">🏛️</span>
                  {college.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📍 LOCATION SEARCH */}
        <div className="filter-group" ref={locationRef}>
          <div className="filter-input-wrapper">
            <span className="filter-icon">📍</span>
            <input
              type="text"
              placeholder="Search Location"
              value={locationSearchInput}
              onChange={(e) => {
                setLocationSearchInput(e.target.value);
                setShowLocationDropdown(true);
              }}
              onFocus={() => setShowLocationDropdown(true)}
              className="filter-input"
            />
          </div>

          {showLocationDropdown && filteredLocations.length > 0 && (
            <div className="dropdown-menu">
              {filteredLocations.map((location) => (
                <div
                  key={location}
                  className="dropdown-item"
                  onClick={() => handleLocationSelect(location)}
                >
                  <span className="dropdown-icon">🏙️</span>
                  {location}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🚀 EXPLORE BUTTON */}
        <button className="explore-btn" onClick={handleExplore}>
          Explore
        </button>
      </div>

      {/* ❌ CLEAR FILTERS */}
      {(selectedCollege || selectedLocation || searchQuery) && (
        <div className="clear-all-container">
          <button className="clear-all-btn" onClick={handleClearFilters}>
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
