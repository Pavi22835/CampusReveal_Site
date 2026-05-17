import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Star, ArrowRight, ChevronRight, ShieldCheck, Users, Edit3,
  Search, GraduationCap, Building2, Globe, Sparkles, MessageSquare,
  Filter, SlidersHorizontal, X, Command, School, TrendingUp, Award,
  Building, Bus, GraduationCap as GraduationIcon, BookOpen, MapPin as MapPinIcon,
  ChevronDown, ChevronUp, Layers, Briefcase, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CollegeCard from '../components/CollegeCard/CollegeCard.jsx';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProfileDetailsModal from '../components/ProfileDetailsModal/ProfileDetailsModal';

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
        <div className="bg-white border-b border-slate-100 py-3 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">
                Applied Filters:
              </span>
              {selectedFilters.map((filter, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-sm"
                >
                  <span className="text-indigo-700 font-medium">{filter.label}</span>
                  <button
                    onClick={() => removeFilter(filter.type)}
                    className="text-indigo-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-500 hover:text-red-600 font-medium ml-2"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-auto pt-20 md:pt-24 pb-12 overflow-visible bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-50/80 via-white/90 to-purple-50/80" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center mt-4 overflow-visible">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full overflow-visible"
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-slate-900 leading-[1.2] tracking-tight mb-3 flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1"
            >
              <span className="whitespace-nowrap">Unveiling the</span>
              <span className="whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Next Frontier</span>
              <span className="whitespace-nowrap">of Education.</span>
            </motion.h1>

            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed mb-6 max-w-2xl mx-auto">
              Authentic reviews, real projects, and honest insights shared by students, for students. Find your perfect fit based on merit and student life.
            </p>

            <div className="relative max-w-2xl mx-auto z-[9999]" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 z-10" size={18} />
                <input
                  type="text"
                  placeholder="Search by college name, location, city..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => {
                    if (searchQuery.length > 0 && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full h-12 pl-11 pr-12 bg-gradient-to-r from-indigo-50 via-white to-purple-50 rounded-xl shadow-lg shadow-indigo-200/50 border-2 border-indigo-300 font-bold text-slate-800 placeholder:text-indigo-400 placeholder:font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-400/50 focus:border-indigo-500 transition-all text-sm relative z-10"
                  style={{ caretColor: '#4f46e5' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors z-20"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 99999,
                      marginTop: '12px'
                    }}
                    className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
                  >
                    <div className="px-5 py-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-100">
                      <span className="text-[11px] font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2">
                        <Command size={12} /> SUGGESTED INSTITUTIONS ({suggestions.length})
                      </span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {suggestions.map((college) => (
                        <button
                          key={college.id}
                          onClick={() => handleSuggestionClick(college)}
                          className="w-full flex items-start gap-4 px-5 py-4 hover:bg-indigo-50 transition-all border-b border-slate-100 last:border-0 group text-left"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-sm">
                            {college.image ? (
                              <img src={college.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <School size={24} className="text-indigo-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors break-words mb-1">
                              {college.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <MapPin size={12} /> {college.location || college.city || 'India'}
                              </span>
                              {college.rating && (
                                <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                  <Star size={12} fill="currentColor" /> {college.rating}
                                </span>
                              )}
                              {college.category && (
                                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                  {college.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                        </button>
                      ))}
                    </div>
                    <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
                      <button
                        onClick={() => {
                          setShowSuggestions(false);
                          if (searchQuery.trim()) {
                            navigate(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
                          }
                        }}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center justify-center gap-1 mx-auto"
                      >
                        View all results <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* University Explorer Section */}
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
            {/* Filters Sidebar */}
            <aside className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden sticky top-24">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={14} className="text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
                  </div>
                  {hasActiveFilters() && (
                    <button onClick={clearAllFilters} className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700">
                      Clear all
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
                  {/* Academic Stream */}
                  <div className="filter-section">
                    <button onClick={() => toggleSection('stream')} className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2"><BookOpen size={14} className="text-indigo-500" /><span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Academic Stream</span></div>
                      {expandedSections.stream ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expandedSections.stream && (
                      <div className="px-4 pb-3 space-y-1">
                        {streamOptions.map(stream => (
                          <label key={stream.id} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                            <input type="radio" name="stream" checked={activeFilters.stream === stream.id} onChange={() => handleStreamChange(stream.id)} className="w-3.5 h-3.5 accent-indigo-600" />
                            <span className={`text-xs ${activeFilters.stream === stream.id ? 'text-indigo-600 font-medium' : 'text-slate-600'} group-hover:text-indigo-600`}>{stream.icon} {stream.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Academic Level */}
                  <div className="filter-section">
                    <button onClick={() => toggleSection('level')} className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2"><GraduationIcon size={14} className="text-indigo-500" /><span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Academic Level</span></div>
                      {expandedSections.level ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expandedSections.level && (
                      <div className="px-4 pb-3 space-y-1">
                        {levelOptions.map(level => (
                          <label key={level.id} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                            <input type="radio" name="level" checked={activeFilters.level === level.id} onChange={() => handleLevelChange(level.id)} className="w-3.5 h-3.5 accent-indigo-600" />
                            <span className={`text-xs ${activeFilters.level === level.id ? 'text-indigo-600 font-medium' : 'text-slate-600'} group-hover:text-indigo-600`}>{level.icon} {level.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Department */}
                  <div className="filter-section">
                    <button onClick={() => toggleSection('department')} className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2"><Building2 size={14} className="text-indigo-500" /><span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Department</span></div>
                      {expandedSections.department ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expandedSections.department && (
                      <div className="px-4 pb-3">
                        {availableDepartments.length > 0 ? (
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {availableDepartments.map(dept => (
                              <label key={dept} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                                <input type="radio" name="department" checked={activeFilters.department === dept} onChange={() => handleDepartmentChange(dept)} className="w-3.5 h-3.5 accent-indigo-600" />
                                <span className={`text-xs ${activeFilters.department === dept ? 'text-indigo-600 font-medium' : 'text-slate-600'} group-hover:text-indigo-600`}>{dept}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">No departments available</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Course */}
                  <div className="filter-section">
                    <button onClick={() => toggleSection('course')} className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2"><Layers size={14} className="text-indigo-500" /><span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Course</span></div>
                      {expandedSections.course ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expandedSections.course && (
                      <div className="px-4 pb-3">
                        {availableCourses.length > 0 ? (
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {availableCourses.map(course => (
                              <label key={course} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                                <input type="radio" name="course" checked={activeFilters.course === course} onChange={() => handleCourseChange(course)} className="w-3.5 h-3.5 accent-indigo-600" />
                                <span className={`text-xs ${activeFilters.course === course ? 'text-indigo-600 font-medium' : 'text-slate-600'} group-hover:text-indigo-600`}>{course}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">No courses available</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="filter-section">
                    <button onClick={() => toggleSection('location')} className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2"><MapPinIcon size={14} className="text-indigo-500" /><span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Location</span></div>
                      {expandedSections.location ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expandedSections.location && (
                      <div className="px-4 pb-3">
                        <select
                          value={activeFilters.location}
                          onChange={(e) => setActiveFilters(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {locationOptions.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* College / University Search */}
                  <div className="filter-section">
                    <button onClick={() => toggleSection('collegeSearch')} className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2"><Building size={14} className="text-indigo-500" /><span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">College / University</span></div>
                      {expandedSections.collegeSearch ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expandedSections.collegeSearch && (
                      <div className="px-4 pb-3">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          placeholder="Search city, area, college, university"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-2">Type a city, area or university name to filter cards.</p>
                      </div>
                    )}
                  </div>

                  {/* Transport */}
                  <div className="filter-section">
                    <button onClick={() => toggleSection('transport')} className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2"><Bus size={14} className="text-indigo-500" /><span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Transport</span></div>
                      {expandedSections.transport ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expandedSections.transport && (
                      <div className="px-4 pb-3 space-y-1">
                        {transportOptions.map(opt => (
                          <label key={opt} className="flex items-center gap-2 py-1 cursor-pointer">
                            <input type="radio" name="transport" checked={activeFilters.transport === opt} onChange={() => setActiveFilters(prev => ({ ...prev, transport: opt }))} className="w-3.5 h-3.5 accent-indigo-600" />
                            <span className={`text-xs ${activeFilters.transport === opt ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="filter-section">
                    <button onClick={() => toggleSection('rating')} className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2"><Star size={14} className="text-indigo-500" /><span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Rating</span></div>
                      {expandedSections.rating ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expandedSections.rating && (
                      <div className="px-4 pb-3 space-y-1">
                        {ratings.map(opt => (
                          <label key={opt} className="flex items-center gap-2 py-1 cursor-pointer">
                            <input type="radio" name="rating" checked={activeFilters.rating === opt} onChange={() => setActiveFilters(prev => ({ ...prev, rating: opt }))} className="w-3.5 h-3.5 accent-indigo-600" />
                            <span className={`text-xs ${activeFilters.rating === opt ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {hasActiveFilters() && (
                  <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Active Filters</p>
                    <div className="flex flex-wrap gap-1">
                      {activeFilters.stream && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">{streamOptions.find(s => s.id === activeFilters.stream)?.name}<button onClick={() => setActiveFilters(prev => ({ ...prev, stream: '', level: '', department: '', course: '' }))}>×</button></span>}
                      {activeFilters.level && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">{levelOptions.find(l => l.id === activeFilters.level)?.name}<button onClick={() => setActiveFilters(prev => ({ ...prev, level: '', course: '' }))}>×</button></span>}
                      {activeFilters.department && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">{activeFilters.department}<button onClick={() => setActiveFilters(prev => ({ ...prev, department: '', course: '' }))}>×</button></span>}
                      {activeFilters.course && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">{activeFilters.course}<button onClick={() => setActiveFilters(prev => ({ ...prev, course: '' }))}>×</button></span>}
                      {activeFilters.location !== 'All Regions' && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">📍 {activeFilters.location}<button onClick={() => setActiveFilters(prev => ({ ...prev, location: 'All Regions' }))}>×</button></span>}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Colleges Grid - Always shows max 6 dynamic cards */}
            <div className="lg:col-span-9">
              {(activeFilters.stream || activeFilters.level || activeFilters.department || activeFilters.course) && (
                <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Heart size={14} className="text-indigo-600" />
                    <span className="text-xs font-medium text-slate-600">Showing results for:</span>
                    {activeFilters.stream && <span className="px-2 py-0.5 bg-white rounded-full text-[10px] font-bold text-indigo-600 shadow-sm">{streamOptions.find(s => s.id === activeFilters.stream)?.name}</span>}
                    {activeFilters.level && <span className="px-2 py-0.5 bg-white rounded-full text-[10px] font-bold text-indigo-600 shadow-sm">{levelOptions.find(l => l.id === activeFilters.level)?.name}</span>}
                    {activeFilters.department && <span className="px-2 py-0.5 bg-white rounded-full text-[10px] font-bold text-indigo-600 shadow-sm">{activeFilters.department}</span>}
                    {activeFilters.course && <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold shadow-sm">{activeFilters.course}</span>}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-16"><div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
              ) : (
                <>
                  {searchQuery && displayColleges.length > 0 && (
                    <div className="mb-3 text-xs text-slate-500">
                      Found {allColleges.length} result{allColleges.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {displayColleges.map((college, i) => (
                      <CollegeCard key={college.id} college={college} index={i} />
                    ))}
                  </div>

                  {displayColleges.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
                      <School size={40} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-slate-400 text-sm font-medium">No colleges found matching your criteria</p>
                      <button onClick={clearAllFilters} className="mt-3 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition">Clear Filters</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Action Cards Section */}
      <section className="relative z-20 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-display font-black text-slate-900 mb-3">Ready to Get Started?</h2>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto">Join thousands of students who have already found their perfect college and shared their experiences</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Write a Review Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0, duration: 0.5 }}
              whileHover={{ y: -4 }}
              onClick={() => handleWriteReviewClick()}
              className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Edit3 size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                    {allColleges.length}+ Universities
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">Write a Review</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">Share your authentic campus journey and help fellow students make informed decisions</p>
                <div className="flex items-center justify-end text-indigo-600 font-semibold text-sm gap-1 group-hover:gap-2 transition-all">
                  Get Started <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>

            {/* Explore Reviews Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate('/reviews')}
              className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <GraduationCap size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                    {allColleges.length}+ Universities
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">Explore Reviews</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">Browse through thousands of genuine student reviews from real colleges across India</p>
                <div className="flex items-center justify-end text-indigo-600 font-semibold text-sm gap-1 group-hover:gap-2 transition-all">
                  Get Started <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>

            {/* Find Community Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate('/community')}
              className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Users size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                    {allColleges.length}+ Universities
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">Find Community</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">Connect with industry experts, alumni, and fellow students to grow your network</p>
                <div className="flex items-center justify-end text-indigo-600 font-semibold text-sm gap-1 group-hover:gap-2 transition-all">
                  Get Started <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
            <div><div className="flex items-center gap-1.5 mb-2"><TrendingUp size={16} className="text-indigo-600" /><span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Trending Now</span></div><h2 className="text-2xl font-display font-black text-slate-900">Most Popular Universities</h2></div>
            <button onClick={() => navigate('/colleges')} className="px-4 py-1.5 bg-white text-slate-700 font-bold rounded-lg flex items-center gap-1.5 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs shadow-sm border border-slate-200">Search <ChevronRight size={12} /></button>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
          ) : trendingColleges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {trendingColleges.slice(0, 3).map((college, i) => (
                <motion.div key={college.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -3 }} onClick={() => navigate(`/university/${college.id}`)} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer border border-slate-100">
                  <div className="relative h-36 overflow-hidden bg-slate-100">
                    {college.image ? (
                      <img src={college.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={college.name} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <School size={40} className="text-indigo-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2"><span className="bg-white/95 backdrop-blur px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-slate-800">#{i + 1}</span></div>
                    {college.rating && <div className="absolute top-2 right-2 bg-amber-500/90 backdrop-blur px-1.5 py-0.5 rounded-md flex items-center gap-0.5"><Star size={8} fill="white" className="text-white" /><span className="text-[9px] font-bold text-white">{college.rating}</span></div>}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-slate-900 text-sm mb-0.5 line-clamp-1">{college.name}</h3>
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] mb-2"><MapPin size={9} /> {college.location || 'India'}</div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100"><div className="flex items-center gap-2 text-[9px] font-bold"><span className="text-slate-500">{college.students}</span><span className="text-indigo-600">{college.netPrice}</span></div><Award size={12} className="text-slate-300 group-hover:text-indigo-500 transition" /></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <School size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm font-medium">No trending universities available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-indigo-700">
        <div className="max-w-7xl mx-auto px-6" ref={statsRef}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {statsData.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center mb-2">
                  <stat.icon size={18} />
                </div>
                <div className="text-2xl font-display font-black mb-0.5">
                  {formatStatValue(statValues[i], stat.format)}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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