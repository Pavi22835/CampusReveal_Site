import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Filter, Building2, Globe, ShieldCheck, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProfileDetailsModal from '../components/ProfileDetailsModal/ProfileDetailsModal';
import SelectedFiltersBar from '../components/Home/SelectedFiltersBar.jsx';
import HomeHeroSection from '../components/Home/HomeHeroSection.jsx';
import FilterSidebar from '../components/Home/FilterSidebar.jsx';
import UniversityGrid from '../components/Home/UniversityGrid.jsx';
import ActionCards from '../components/Home/ActionCards.jsx';
import TrendingUniversities from '../components/Home/TrendingUniversities.jsx';
import StatsSection from '../components/Home/StatsSection.jsx';

// ==================== FILTER DATA (Only UI labels, no hardcoded university data) ====================

const academicStreams = [
  { id: 'science_tech', name: 'Science & Technology', icon: '🔬' },
  { id: 'engineering', name: 'Engineering', icon: '🏗️' },
  { id: 'arts_science', name: 'Arts & Science', icon: '🎓' },
  { id: 'commerce', name: 'Commerce & Management', icon: '📊' },
  { id: 'law', name: 'Law', icon: '⚖️' },
  { id: 'design', name: 'Design & Creative', icon: '🎨' },
  { id: 'professional', name: 'Professional Studies', icon: '💼' }
];

const academicLevels = [
  { id: 'diploma', name: 'Diploma', icon: '📜' },
  { id: 'ug', name: 'UG (Undergraduate)', icon: '🎓' },
  { id: 'pg', name: 'PG (Postgraduate)', icon: '📚' },
  { id: 'phd', name: 'PhD / Doctorate', icon: '🔬' }
];

const getCollegeImage = (college) => {
  if (Array.isArray(college.images) && college.images.length > 0) {
    return college.images[0];
  }
  if (college.imageUrl && college.imageUrl !== college.logoUrl) {
    return college.imageUrl;
  }
  if (college.image && college.image !== college.logoUrl) {
    return college.image;
  }
  if (college.logoUrl && college.logoUrl.startsWith('http')) {
    return college.logoUrl;
  }
  if (college.coverImage && college.coverImage.startsWith('http')) {
    return college.coverImage;
  }
  return null;
};

const defaultLocationOptions = ['All Regions', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'];

export default function Home() {
  const { requireAuth, isAuthenticated, openAuthModal, token } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);

  const [activeFilters, setActiveFilters] = useState({
    stream: '',
    level: '',
    department: '',
    course: '',
    location: 'All Regions',
    type: 'All',
    transport: 'All',
    rating: 'Any Rating'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [trendingColleges, setTrendingColleges] = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayColleges, setDisplayColleges] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    academicStreams: [],
    academicLevels: [],
    departments: [],
    cities: [],
    states: [],
    offeredCourses: [],
    types: []
  });
  const [expandedSections, setExpandedSections] = useState({
    stream: true,
    level: true,
    department: false,
    course: false,
    location: true,
    collegeSearch: true,
    transport: true,
    rating: false
  });
  const searchRef = useRef(null);
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [statValues, setStatValues] = useState([0, 0, 0, 0]);
  const [statsData, setStatsData] = useState([
    { label: 'Universities', target: 2500, icon: Building2, format: 'comma' },
    { label: 'Student Reviews', target: 45000, icon: MessageSquare, format: 'thousand' },
    { label: 'Communities', target: 12000, icon: Globe, format: 'thousand' },
    { label: 'Happy Graduates', target: 30000, icon: ShieldCheck, format: 'thousand' }
  ]);

  const formatStatValue = (value, format) => {
    if (format === 'thousand') {
      if (value <= 0) return '0';
      return `${Math.round(value / 1000)}k+`;
    }
    if (format === 'comma') {
      return `${value.toLocaleString()}+`;
    }
    return `${value}+`;
  };

  // Get dynamic stream options from API or fallback to UI labels
  const streamOptions = (() => {
    if (Array.isArray(filterOptions?.academicStreams) && filterOptions.academicStreams.length) {
      return filterOptions.academicStreams.map(s => {
        const found = academicStreams.find(a => a.id === s || a.name === s);
        return found || { id: s, name: s, icon: '📚' };
      });
    }
    return academicStreams;
  })();

  // Get dynamic level options from API or fallback to UI labels
  const levelOptions = (() => {
    if (Array.isArray(filterOptions?.academicLevels) && filterOptions.academicLevels.length) {
      return filterOptions.academicLevels.map(l => {
        const found = academicLevels.find(a => a.id === l || a.name === l);
        return found || { id: l, name: l, icon: '📜' };
      });
    }
    return academicLevels;
  })();

  // Get dynamic departments from API
  const availableDepartments = Array.isArray(filterOptions?.departments) && filterOptions.departments.length
    ? filterOptions.departments
    : [];

  // Get dynamic courses from API based on selected department
  const availableCourses = (() => {
    if (Array.isArray(filterOptions?.offeredCourses) && filterOptions.offeredCourses.length) {
      const normalizedDept = activeFilters.department?.toLowerCase() || '';
      if (normalizedDept) {
        return filterOptions.offeredCourses
          .filter(course => course.toLowerCase().includes(normalizedDept))
          .slice(0, 80);
      }
      return filterOptions.offeredCourses.slice(0, 80);
    }
    return [];
  })();

  // Get dynamic location options from API
  const locationOptions = (() => {
    const locations = [];
    if (Array.isArray(filterOptions?.cities) && filterOptions.cities.length) {
      locations.push(...filterOptions.cities);
    }
    if (Array.isArray(filterOptions?.states) && filterOptions.states.length) {
      locations.push(...filterOptions.states);
    }
    if (locations.length) {
      return ['All Regions', ...new Set(locations)].sort();
    }
    return defaultLocationOptions;
  })();

  const types = ['All', 'Private', 'Public'];
  const transportOptions = ['All', 'Available', 'Not Available'];
  const ratings = ['Any Rating', '4.5+', '4.0+', '3.5+', '3.0+'];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleStreamChange = (streamId) => {
    setActiveFilters(prev => ({ ...prev, stream: streamId, department: '', course: '' }));
  };

  const handleLevelChange = (levelId) => {
    setActiveFilters(prev => ({ ...prev, level: levelId, course: '' }));
  };

  const handleDepartmentChange = (dept) => {
    setActiveFilters(prev => ({ ...prev, department: dept, course: '' }));
  };

  const handleCourseChange = (course) => {
    setActiveFilters(prev => ({ ...prev, course: course }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      stream: '', level: '', department: '', course: '', location: 'All Regions',
      type: 'All', transport: 'All', rating: 'Any Rating'
    });
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    // Reset to show trending colleges
    if (trendingColleges.length > 0) {
      setDisplayColleges(trendingColleges.slice(0, 6));
    }
  };

  const hasActiveFilters = () => {
    return activeFilters.stream !== '' || activeFilters.level !== '' || activeFilters.department !== '' ||
      activeFilters.course !== '' || activeFilters.location !== 'All Regions' || activeFilters.type !== 'All' ||
      activeFilters.transport !== 'All' || activeFilters.rating !== 'Any Rating';
  };

  const getSelectedFiltersArray = () => {
    const selected = [];
    if (activeFilters.stream) {
      const streamName = streamOptions.find(s => s.id === activeFilters.stream)?.name || activeFilters.stream;
      selected.push({ type: 'stream', label: streamName });
    }
    if (activeFilters.level) {
      const levelName = levelOptions.find(l => l.id === activeFilters.level)?.name || activeFilters.level;
      selected.push({ type: 'level', label: levelName });
    }
    if (activeFilters.department) {
      selected.push({ type: 'department', label: activeFilters.department });
    }
    if (activeFilters.course) {
      selected.push({ type: 'course', label: activeFilters.course });
    }
    if (activeFilters.location !== 'All Regions') {
      selected.push({ type: 'location', label: activeFilters.location });
    }
    if (activeFilters.transport !== 'All') {
      selected.push({ type: 'transport', label: activeFilters.transport });
    }
    if (activeFilters.rating !== 'Any Rating') {
      selected.push({ type: 'rating', label: activeFilters.rating });
    }
    if (activeFilters.type !== 'All') {
      selected.push({ type: 'type', label: activeFilters.type });
    }
    return selected;
  };

  const removeFilter = (filterType) => {
    if (filterType === 'stream') {
      setActiveFilters(prev => ({ ...prev, stream: '', department: '', course: '' }));
    } else if (filterType === 'level') {
      setActiveFilters(prev => ({ ...prev, level: '', course: '' }));
    } else if (filterType === 'department') {
      setActiveFilters(prev => ({ ...prev, department: '', course: '' }));
    } else if (filterType === 'course') {
      setActiveFilters(prev => ({ ...prev, course: '' }));
    } else if (filterType === 'location') {
      setActiveFilters(prev => ({ ...prev, location: 'All Regions' }));
    } else if (filterType === 'transport') {
      setActiveFilters(prev => ({ ...prev, transport: 'All' }));
    } else if (filterType === 'rating') {
      setActiveFilters(prev => ({ ...prev, rating: 'Any Rating' }));
    } else if (filterType === 'type') {
      setActiveFilters(prev => ({ ...prev, type: 'All' }));
    }
  };

  const selectedFilters = getSelectedFiltersArray();

  // Handle Write a Review click from Home page
  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    localStorage.removeItem('reviewUniversityId');
    localStorage.removeItem('reviewUniversityName');
    localStorage.removeItem('userDepartment');
    localStorage.removeItem('userGraduationYear');
    localStorage.removeItem('userCollegeName');

    if (selectedCollegeId) {
      const selectedCollege = allColleges.find((college) => String(college.id) === String(selectedCollegeId));
      if (selectedCollege) {
        localStorage.setItem('reviewUniversityId', selectedCollegeId);
        localStorage.setItem('reviewUniversityName', selectedCollege.name);
      }
    }

    setShowProfileModal(true);
  };

  // Handle profile modal success
  const handleProfileSuccess = () => {
    const universityId = localStorage.getItem('reviewUniversityId');
    if (universityId) {
      navigate(`/write-review/${universityId}`);
    } else {
      navigate('/write-review');
    }
  };

  // Fetch trending colleges, filter options
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching universities data...');

        // Fetch all universities first
        const universitiesResult = await api.getUniversities(token);
        console.log('Universities Response:', universitiesResult);

        // Try to fetch filter options
        let filterResult = { success: false, data: {} };
        try {
          filterResult = await api.getFilterOptions();
          console.log('Filter Options Response:', filterResult);
        } catch (err) {
          console.warn('Filter options not available:', err);
        }

        // Handle universities data
        if (universitiesResult.success && Array.isArray(universitiesResult.data)) {
          // Filter out trashed universities
          const activeUniversities = universitiesResult.data.filter(uni => !uni.isTrashed);

          const formatted = activeUniversities.map((college) => ({
            ...college,
            id: college.id,
            name: college.name,
            location: college.location || college.city || 'India',
            city: college.city,
            rating: college.rating || 4.0,
            studentCount: college.studentCount,
            tuitionFee: college.tuitionFee,
            category: college.category || 'University',
            image: getCollegeImage(college),
            students: college.studentCount ? `${college.studentCount.toLocaleString()}+` : 'N/A',
            netPrice: college.tuitionFee ? `₹${college.tuitionFee.toLocaleString()}` : 'N/A'
          }));

          setTrendingColleges(formatted);
          setAllColleges(formatted);
          // Show first 6 cards only
          setDisplayColleges(formatted.slice(0, 6));
          console.log('Set display colleges:', formatted.slice(0, 6).length, 'universities');
        } else {
          console.warn('No universities found or API returned empty');
          setTrendingColleges([]);
          setAllColleges([]);
          setDisplayColleges([]);
        }

        // Handle filter options if available
        if (filterResult.success && filterResult.data) {
          setFilterOptions({
            academicStreams: filterResult.data.academicStreams || [],
            academicLevels: filterResult.data.academicLevels || [],
            departments: filterResult.data.departments || [],
            cities: filterResult.data.cities || [],
            states: filterResult.data.states || [],
            offeredCourses: filterResult.data.offeredCourses || [],
            types: filterResult.data.types || []
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setTrendingColleges([]);
        setAllColleges([]);
        setDisplayColleges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (!statsRef.current || statsAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsAnimated(true);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsAnimated]);

  useEffect(() => {
    if (!statsAnimated) return;

    const duration = 1600;
    const startTime = performance.now();
    const targets = statsData.map((stat) => stat.target);
    let rafId = null;

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const updated = targets.map((target) => Math.round(target * progress));
      setStatValues(updated);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [statsAnimated, statsData]);

  // Apply filters when they change - Always show max 6 cards
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...allColleges];

      // Apply stream filter
      if (activeFilters.stream) {
        filtered = filtered.filter(college =>
          college.academicStream === activeFilters.stream ||
          college.stream === activeFilters.stream
        );
      }

      // Apply level filter
      if (activeFilters.level) {
        filtered = filtered.filter(college =>
          college.academicLevel === activeFilters.level ||
          college.level === activeFilters.level
        );
      }

      // Apply department filter
      if (activeFilters.department) {
        filtered = filtered.filter(college =>
          college.department?.toLowerCase() === activeFilters.department.toLowerCase()
        );
      }

      // Apply course filter
      if (activeFilters.course) {
        filtered = filtered.filter(college =>
          college.course?.toLowerCase() === activeFilters.course.toLowerCase()
        );
      }

      // Apply location filter
      if (activeFilters.location && activeFilters.location !== 'All Regions') {
        filtered = filtered.filter(college =>
          college.location === activeFilters.location ||
          college.city === activeFilters.location ||
          college.state === activeFilters.location
        );
      }

      // Apply search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(college =>
          college.name?.toLowerCase().includes(query) ||
          college.location?.toLowerCase().includes(query) ||
          college.city?.toLowerCase().includes(query)
        );
      }

      // Always show only first 6 cards
      setDisplayColleges(filtered.slice(0, 6));
    };

    if (hasActiveFilters() || searchQuery.trim()) {
      applyFilters();
    } else if (allColleges.length > 0) {
      setDisplayColleges(allColleges.slice(0, 6));
    }
  }, [activeFilters, searchQuery, allColleges]);

  const handleSearchChange = async (query) => {
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const searchTerm = query.trim();
      let suggestionsResult = [];

      try {
        const searchResult = await api.searchUniversities(searchTerm);
        console.log('Search suggestions:', searchResult);
        if (searchResult.success && Array.isArray(searchResult.data)) {
          suggestionsResult = searchResult.data.slice(0, 6).map(college => ({
            ...college,
            id: college.id,
            name: college.name,
            location: college.location || college.city || 'India',
            city: college.city,
            rating: college.rating,
            category: college.category,
            image: getCollegeImage(college)
          }));
        }
      } catch (err) {
        console.error('API search error:', err);
      }

      setSuggestions(suggestionsResult);
      setShowSuggestions(suggestionsResult.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleSuggestionClick = (college) => {
    setSearchQuery(college.name);
    setShowSuggestions(false);
    navigate(`/university/${college.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">

      {/* Selected Filters Display */}
      {selectedFilters.length > 0 && (
        <SelectedFiltersBar
          selectedFilters={selectedFilters}
          removeFilter={removeFilter}
          clearAllFilters={clearAllFilters}
        />
      )}

      <HomeHeroSection
        searchQuery={searchQuery}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSearchChange={handleSearchChange}
        onSearchKeyPress={handleKeyPress}
        onInputFocus={() => {
          if (searchQuery.length > 0 && suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onSuggestionClick={handleSuggestionClick}
        onViewAllResults={() => {
          if (searchQuery.trim()) {
            navigate(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
          }
        }}
        resetSearch={() => {
          setSearchQuery('');
          setSuggestions([]);
          setShowSuggestions(false);
        }}
        closeSuggestions={() => setShowSuggestions(false)}
        searchRef={searchRef}
      />

      <section id="university-explorer" className="pt-14 pb-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-full text-indigo-700 text-[10px] font-bold mb-2 uppercase tracking-wider">
                <Filter size={10} /> Find Your Perfect Course
              </div>
              <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">University Explorer</h2>
              <p className="text-slate-500 text-sm mt-1">Select your stream, level, department and course to find matching colleges</p>
            </div>
            <button
              onClick={() => navigate('/colleges')}
              className="mt-3 sm:mt-0 px-5 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-2 shadow-sm"
            >
              Search <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <FilterSidebar
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              activeFilters={activeFilters}
              streamOptions={streamOptions}
              levelOptions={levelOptions}
              availableDepartments={availableDepartments}
              availableCourses={availableCourses}
              locationOptions={locationOptions}
              transportOptions={transportOptions}
              ratings={ratings}
              handleStreamChange={handleStreamChange}
              handleLevelChange={handleLevelChange}
              handleDepartmentChange={handleDepartmentChange}
              handleCourseChange={handleCourseChange}
              handleSearchChange={handleSearchChange}
              setActiveFilters={setActiveFilters}
              hasActiveFilters={hasActiveFilters}
              clearAllFilters={clearAllFilters}
              searchQuery={searchQuery}
            />

            <UniversityGrid
              loading={loading}
              searchQuery={searchQuery}
              allColleges={allColleges}
              displayColleges={displayColleges}
              clearAllFilters={clearAllFilters}
              activeFilters={activeFilters}
              streamOptions={streamOptions}
              levelOptions={levelOptions}
            />
          </div>
        </div>
      </section>

      <ActionCards
        allCollegesCount={allColleges.length}
        onReviewClick={handleWriteReviewClick}
        onNavigate={navigate}
      />

      <TrendingUniversities
        loading={loading}
        trendingColleges={trendingColleges}
        onNavigate={navigate}
      />

      <StatsSection
        statsRef={statsRef}
        statsData={statsData}
        statValues={statValues}
        formatStatValue={formatStatValue}
      />

      {/* Profile Details Modal */}
      <ProfileDetailsModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedCollegeId(null);
          localStorage.removeItem('reviewUniversityId');
          localStorage.removeItem('reviewUniversityName');
        }}
        onSuccess={handleProfileSuccess}
      />
    </div>
  );
}