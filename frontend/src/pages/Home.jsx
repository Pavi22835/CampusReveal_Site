/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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


// ==================== FILTER DATA ====================

// Academic Streams
const academicStreams = [
  { id: 'science_tech', name: 'Science & Technology', icon: '🔬' },
  { id: 'engineering', name: 'Engineering', icon: '🏗️' },
  { id: 'arts_science', name: 'Arts & Science', icon: '🎓' },
  { id: 'commerce', name: 'Commerce & Management', icon: '📊' },
  { id: 'law', name: 'Law', icon: '⚖️' },
  { id: 'design', name: 'Design & Creative', icon: '🎨' },
  { id: 'professional', name: 'Professional Studies', icon: '💼' }
];

// Academic Levels
const academicLevels = [
  { id: 'diploma', name: 'Diploma', icon: '📜' },
  { id: 'ug', name: 'UG (Undergraduate)', icon: '🎓' },
  { id: 'pg', name: 'PG (Postgraduate)', icon: '📚' },
  { id: 'phd', name: 'PhD / Doctorate', icon: '🔬' }
];

// Departments by Stream
const departmentsByStream = {
  science_tech: [
    'Computer Science', 'Information Technology', 'Artificial Intelligence', 
    'Data Science', 'Cyber Security', 'Software Engineering'
  ],
  engineering: [
    'Computer Science Engineering', 'Electronics & Communication Engineering', 'Mechanical Engineering',
    'Civil Engineering', 'Electrical & Electronics Engineering', 'Mechatronics Engineering',
    'Robotics Engineering'
  ],
  arts_science: [
    'Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Biotechnology', 'Environmental Science',
    'English', 'Economics', 'Psychology', 'Political Science', 'Sociology', 'History'
  ],
  commerce: [
    'Commerce', 'Accounting & Finance', 'Business Administration', 'Business Analytics', 'Finance & Banking'
  ],
  law: [
    'Law (LLB)', 'Corporate Law', 'Criminal Law'
  ],
  design: [
    'UI/UX Design', 'Animation & VFX', 'Graphic Design', 'Fashion Design', 'Film & Media Studies'
  ],
  professional: [
    'Hotel Management', 'Tourism & Hospitality', 'Event Management', 'Aviation Management'
  ]
};

// Courses by Department and Level
const coursesByDeptAndLevel = {
  'Computer Science': {
    ug: ['B.Sc Computer Science', 'BCA', 'B.Tech Computer Science Engineering'],
    pg: ['M.Sc Computer Science', 'MCA', 'M.Tech Computer Science'],
    diploma: ['Diploma in Computer Science', 'Advanced Diploma in IT'],
    phd: ['PhD in Computer Science', 'PhD in Information Technology']
  },
  'Information Technology': {
    ug: ['B.Sc IT', 'B.Tech IT', 'BCA'],
    pg: ['M.Sc IT', 'M.Tech IT', 'MCA'],
    diploma: ['Diploma in IT'],
    phd: ['PhD in Information Technology']
  },
  'Artificial Intelligence': {
    ug: ['B.Sc AI', 'B.Tech AI & ML', 'BCA AI'],
    pg: ['M.Sc AI', 'M.Tech AI', 'PG Diploma in AI'],
    phd: ['PhD in Artificial Intelligence']
  },
  'Data Science': {
    ug: ['B.Sc Data Science', 'B.Tech Data Science', 'BCA Data Analytics'],
    pg: ['M.Sc Data Science', 'M.Tech Data Science'],
    phd: ['PhD in Data Science']
  },
  'Cyber Security': {
    ug: ['B.Sc Cyber Security', 'B.Tech Cyber Security', 'BCA Cyber Security'],
    pg: ['M.Sc Cyber Security', 'M.Tech Cyber Security'],
    phd: ['PhD in Cyber Security']
  },
  'Computer Science Engineering': {
    ug: ['B.Tech CSE', 'BE CSE'],
    pg: ['M.Tech CSE', 'ME CSE'],
    phd: ['PhD in CSE']
  },
  'Electronics & Communication Engineering': {
    ug: ['B.Tech ECE', 'BE ECE'],
    pg: ['M.Tech ECE', 'ME ECE'],
    phd: ['PhD in ECE']
  },
  'Mechanical Engineering': {
    ug: ['B.Tech Mechanical', 'BE Mechanical'],
    pg: ['M.Tech Mechanical', 'ME Mechanical'],
    phd: ['PhD in Mechanical Engineering']
  },
  'Civil Engineering': {
    ug: ['B.Tech Civil', 'BE Civil'],
    pg: ['M.Tech Civil', 'ME Civil'],
    phd: ['PhD in Civil Engineering']
  },
  'Electrical & Electronics Engineering': {
    ug: ['B.Tech EEE', 'BE EEE'],
    pg: ['M.Tech EEE', 'ME EEE'],
    phd: ['PhD in EEE']
  },
  'Physics': {
    ug: ['B.Sc Physics'],
    pg: ['M.Sc Physics'],
    phd: ['PhD in Physics']
  },
  'Chemistry': {
    ug: ['B.Sc Chemistry'],
    pg: ['M.Sc Chemistry'],
    phd: ['PhD in Chemistry']
  },
  'Mathematics': {
    ug: ['B.Sc Mathematics'],
    pg: ['M.Sc Mathematics'],
    phd: ['PhD in Mathematics']
  },
  'Biotechnology': {
    ug: ['B.Sc Biotechnology'],
    pg: ['M.Sc Biotechnology'],
    phd: ['PhD in Biotechnology']
  },
  'Commerce': {
    ug: ['B.Com', 'B.Com Accounts', 'B.Com Corporate Secretaryship'],
    pg: ['M.Com', 'M.Com Finance'],
    phd: ['PhD in Commerce']
  },
  'Accounting & Finance': {
    ug: ['B.Com Accounting & Finance', 'BBA Finance'],
    pg: ['M.Com Finance', 'MBA Finance'],
    phd: ['PhD in Finance']
  },
  'Business Administration': {
    ug: ['BBA', 'BBM', 'BMS'],
    pg: ['MBA', 'PGDM'],
    phd: ['PhD in Management']
  },
  'English': {
    ug: ['BA English', 'BA English Literature'],
    pg: ['MA English', 'MA English Literature'],
    phd: ['PhD in English']
  },
  'Economics': {
    ug: ['BA Economics'],
    pg: ['MA Economics'],
    phd: ['PhD in Economics']
  },
  'Psychology': {
    ug: ['BA Psychology', 'B.Sc Psychology'],
    pg: ['MA Psychology', 'M.Sc Psychology'],
    phd: ['PhD in Psychology']
  },
  'Law (LLB)': {
    ug: ['BA LLB', 'BBA LLB', 'B.Com LLB', 'LLB'],
    pg: ['LLM'],
    phd: ['PhD in Law']
  },
  'UI/UX Design': {
    ug: ['B.Des UI/UX', 'B.Sc UI/UX'],
    pg: ['M.Des UI/UX', 'M.Sc UI/UX'],
    phd: ['PhD in Design']
  },
  'Animation & VFX': {
    ug: ['B.Sc Animation', 'B.Des Animation'],
    pg: ['M.Sc Animation', 'M.Des Animation'],
    phd: ['PhD in Animation']
  },
  'Hotel Management': {
    ug: ['BHM', 'B.Sc Hotel Management'],
    pg: ['MHM', 'MBA Hospitality'],
    diploma: ['Diploma in Hotel Management'],
    phd: ['PhD in Hospitality']
  },
  'Aviation Management': {
    ug: ['BBA Aviation', 'B.Sc Aviation'],
    pg: ['MBA Aviation Management'],
    diploma: ['Diploma in Aviation']
  }
};

const getDefaultCourses = (level) => {
  const defaults = {
    ug: ['Bachelor of Arts', 'Bachelor of Science', 'Bachelor of Commerce', 'Bachelor of Business Administration'],
    pg: ['Master of Arts', 'Master of Science', 'Master of Commerce', 'Master of Business Administration'],
    diploma: ['Diploma Program', 'Advanced Diploma'],
    phd: ['Doctor of Philosophy']
  };
  return defaults[level] || defaults.ug;
};

const tamilNaduLocations = [
  'All Regions', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Tirunelveli',
  'Salem', 'Erode', 'Vellore', 'Thoothukkudi', 'Dindigul', 'Thanjavur',
  'Ranipet', 'Sivakasi', 'Karur', 'Udhagamandalam', 'Hosur', 'Nagercoil',
  'Kanchipuram', 'Sriperumbudur', 'Kattankulathur', 'Pudukkottai', 'Nagapattinam',
  'Kumbakonam', 'Tiruvannamalai', 'Villupuram', 'Cuddalore', 'Namakkal'
];

// Fallback college data
const fallbackColleges = [
  { id: 1, name: "IIT Madras", location: "Chennai, India", city: "Chennai", rating: 4.8, category: "IIT", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop" },
  { id: 2, name: "Anna University", location: "Chennai, India", city: "Chennai", rating: 4.5, category: "State University", image: "https://images.unsplash.com/photo-1541339907198-e08759dfc3f0?w=800&h=600&fit=crop" },
  { id: 3, name: "Loyola College", location: "Chennai, India", city: "Chennai", rating: 4.6, category: "Autonomous", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop" },
  { id: 4, name: "PSG Tech", location: "Coimbatore, India", city: "Coimbatore", rating: 4.4, category: "Autonomous", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop" },
  { id: 5, name: "VIT Vellore", location: "Vellore, India", city: "Vellore", rating: 4.5, category: "Deemed", image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop" },
  { id: 6, name: "SRM University", location: "Chennai, India", city: "Chennai", rating: 4.3, category: "Deemed", image: "https://images.unsplash.com/photo-1541339907198-e08759dfc3f0?w=800&h=600&fit=crop" }
];

export default function Home() {
  const { requireAuth } = useAuth();
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
  const navigate = useNavigate();

  const availableDepartments = activeFilters.stream ? (departmentsByStream[activeFilters.stream] || []) : [];
  const availableCourses = (() => {
    if (!activeFilters.department || !activeFilters.level) return [];
    const deptCourses = coursesByDeptAndLevel[activeFilters.department];
    if (deptCourses && deptCourses[activeFilters.level]) {
      return deptCourses[activeFilters.level];
    }
    return getDefaultCourses(activeFilters.level);
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

  const clearAllFilters = () => {
    setActiveFilters({
      stream: '', level: '', department: '', course: '', location: 'All Regions',
      type: 'All', transport: 'All', rating: 'Any Rating'
    });
    setSearchQuery('');
    setSuggestions([]);
  };

  const hasActiveFilters = () => {
    return activeFilters.stream !== '' || activeFilters.level !== '' || activeFilters.department !== '' ||
      activeFilters.course !== '' || activeFilters.location !== 'All Regions' || activeFilters.type !== 'All' ||
      activeFilters.transport !== 'All' || activeFilters.rating !== 'Any Rating';
  };

  // Fetch trending colleges
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const result = await api.getTrendingUniversities();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const formatted = result.data.map((college) => ({
            ...college,
            image: college.imageUrl || college.images?.[0] || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
            badge: college.category || 'PREMIER',
            students: college.studentCount ? `${college.studentCount.toLocaleString()}+` : 'N/A',
            acceptanceRate: college.acceptanceRate || 'N/A',
            netPrice: college.tuitionFee ? `₹${college.tuitionFee}` : 'N/A',
            satRange: 'N/A',
            location: college.location || college.city || 'India'
          }));
          setTrendingColleges(formatted);
          setAllColleges(formatted);
        } else {
          const formatted = fallbackColleges.map((college) => ({
            ...college,
            badge: college.category,
            students: 'N/A',
            acceptanceRate: 'N/A',
            netPrice: 'N/A',
            satRange: 'N/A'
          }));
          setTrendingColleges(formatted);
          setAllColleges(formatted);
        }
      } catch (error) {
        console.error('Error fetching trending colleges:', error);
        const formatted = fallbackColleges.map((college) => ({
          ...college,
          badge: college.category,
          students: 'N/A',
          acceptanceRate: 'N/A',
          netPrice: 'N/A',
          satRange: 'N/A'
        }));
        setTrendingColleges(formatted);
        setAllColleges(formatted);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced search function - searches by name, location, city
  const handleSearchChange = async (query) => {
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const searchTerm = query.trim();
      let searchResults = [];
      let suggestionsResult = [];

      try {
        const searchResult = await api.searchUniversities(searchTerm);
        if (searchResult.success && Array.isArray(searchResult.data)) {
          searchResults = searchResult.data.map(college => ({
            ...college,
            id: college.id,
            name: college.name,
            location: college.location || college.city || 'India',
            city: college.city,
            rating: college.rating,
            category: college.category,
            image: college.imageUrl || college.images?.[0] || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop'
          }));

          suggestionsResult = searchResults.slice(0, 6);
        }
      } catch (err) {
        console.error('API search error:', err);
      }

      setSuggestions(suggestionsResult);
      setShowSuggestions(suggestionsResult.length > 0);
      setAllColleges(searchResults);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setAllColleges(trendingColleges);
    }
  };

  // Handle search submit - navigate to colleges page
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      requireAuth(() => {
        navigate(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
        setShowSuggestions(false);
      });
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
    requireAuth(() => navigate(`/university/${college.id}`));
  };

  const filteredColleges = allColleges.filter(college => {
    const matchesRegion = activeFilters.location === 'All Regions' || 
      (college.city === activeFilters.location || college.location?.includes(activeFilters.location));
    const matchesType = activeFilters.type === 'All' || college.type === activeFilters.type;
    const matchesRating = activeFilters.rating === 'Any Rating' || college.rating >= parseFloat(activeFilters.rating);
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery.trim() || 
      college.name?.toLowerCase().includes(query) || 
      college.location?.toLowerCase().includes(query) ||
      college.city?.toLowerCase().includes(query);
    return matchesRegion && matchesType && matchesRating && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">

      {/* Hero Section with Centered Search Bar */}
      <section className="relative min-h-[65vh] flex items-start justify-center pt-20 pb-16 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-50/80 via-white/90 to-purple-50/80" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center mt-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
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

            {/* Centered Search Bar - UPDATED with BOLD and BLINKING */}
            <div className="relative max-w-2xl mx-auto z-30" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 z-10" size={18} />
                <input 
                  type="text" 
                  placeholder="🔍 Search by college name, location, city..." 
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                  className="w-full h-12 pl-11 pr-4 bg-gradient-to-r from-indigo-50 via-white to-purple-50 rounded-xl shadow-lg shadow-indigo-200/50 border-2 border-indigo-300 font-bold text-slate-800 placeholder:text-indigo-400 placeholder:font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-400/50 focus:border-indigo-500 transition-all text-sm"
                  style={{ caretColor: '#4f46e5' }}
                />
              </div>

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                  >
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                        <Command size={11} /> SUGGESTED INSTITUTIONS ({suggestions.length})
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {suggestions.map((college) => (
                        <button
                          key={college.id}
                          onClick={() => handleSuggestionClick(college)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition-all border-b border-slate-50 last:border-0 group text-left"
                        >
                          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                            {college.image ? (
                              <img src={college.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <School size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {college.name}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                                <MapPin size={9} /> {college.location || college.city || 'India'}
                              </span>
                              {college.rating && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                  <Star size={9} fill="currentColor" /> {college.rating}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Popular Search Tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {['Engineering', 'Medical', 'Management', 'Chennai', 'Coimbatore', 'IIT Madras', 'Anna University'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    requireAuth(() => {
                      setSearchQuery(tag);
                      handleSearchChange(tag);
                      navigate(`/colleges?search=${encodeURIComponent(tag)}`);
                    });
                  }}
                  className="px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-[10px] font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-all border border-slate-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="relative z-20 pb-12 pt-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'Write a Review', desc: 'Share your authentic campus journey', icon: Edit3, color: 'from-indigo-500 to-indigo-600', link: '/write-review', stats: '2,345+ reviews' },
              { title: 'Explore Reviews', desc: 'Browse student reviews from real colleges', icon: GraduationCap, color: 'from-emerald-500 to-emerald-600', link: '/reviews', stats: '2,345+ reviews' },
              { title: 'Find Community', desc: 'Connect with industry experts', icon: Users, color: 'from-amber-500 to-amber-600', link: '/community', stats: '450+ mentors' }
            ].map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(card.link)}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-sm shrink-0`}>
                      <card.icon size={18} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{card.stats}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-3 mb-1">{card.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{card.desc}</p>
                  <div className="flex items-center justify-end text-indigo-600 font-semibold text-xs gap-1 group-hover:gap-2 transition-all">
                    Get Started <ArrowRight size={12} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* University Explorer Section */}
      <section id="university-explorer" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6">
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
                        {academicStreams.map(stream => (
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
                        {academicLevels.map(level => (
                          <label key={level.id} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                            <input type="radio" name="level" checked={activeFilters.level === level.id} onChange={() => handleLevelChange(level.id)} className="w-3.5 h-3.5 accent-indigo-600" disabled={!activeFilters.stream} />
                            <span className={`text-xs ${!activeFilters.stream ? 'text-slate-300' : activeFilters.level === level.id ? 'text-indigo-600 font-medium' : 'text-slate-600'} group-hover:text-indigo-600`}>{level.icon} {level.name}</span>
                          </label>
                        ))}
                        {!activeFilters.stream && <p className="text-[10px] text-slate-400 italic mt-1">Select stream first</p>}
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
                        ) : <p className="text-[10px] text-slate-400 italic">Select stream first</p>}
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
                                <input type="radio" name="course" checked={activeFilters.course === course} onChange={() => setActiveFilters(prev => ({ ...prev, course }))} className="w-3.5 h-3.5 accent-indigo-600" />
                                <span className={`text-xs ${activeFilters.course === course ? 'text-indigo-600 font-medium' : 'text-slate-600'} group-hover:text-indigo-600`}>{course}</span>
                              </label>
                            ))}
                          </div>
                        ) : <p className="text-[10px] text-slate-400 italic">Select department and level first</p>}
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
                        <select value={activeFilters.location} onChange={(e) => setActiveFilters(prev => ({ ...prev, location: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                          {tamilNaduLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
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
                      {activeFilters.stream && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">{academicStreams.find(s => s.id === activeFilters.stream)?.name}<button onClick={() => setActiveFilters(prev => ({ ...prev, stream: '', level: '', department: '', course: '' }))}>×</button></span>}
                      {activeFilters.level && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">{academicLevels.find(l => l.id === activeFilters.level)?.name}<button onClick={() => setActiveFilters(prev => ({ ...prev, level: '', course: '' }))}>×</button></span>}
                      {activeFilters.department && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">{activeFilters.department}<button onClick={() => setActiveFilters(prev => ({ ...prev, department: '', course: '' }))}>×</button></span>}
                      {activeFilters.course && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">{activeFilters.course}<button onClick={() => setActiveFilters(prev => ({ ...prev, course: '' }))}>×</button></span>}
                      {activeFilters.location !== 'All Regions' && <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">📍 {activeFilters.location}<button onClick={() => setActiveFilters(prev => ({ ...prev, location: 'All Regions' }))}>×</button></span>}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Colleges Grid */}
            <div className="lg:col-span-9">
              {(activeFilters.stream || activeFilters.level || activeFilters.department || activeFilters.course) && (
                <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Heart size={14} className="text-indigo-600" />
                    <span className="text-xs font-medium text-slate-600">Showing results for:</span>
                    {activeFilters.stream && <span className="px-2 py-0.5 bg-white rounded-full text-[10px] font-bold text-indigo-600 shadow-sm">{academicStreams.find(s => s.id === activeFilters.stream)?.name}</span>}
                    {activeFilters.level && <span className="px-2 py-0.5 bg-white rounded-full text-[10px] font-bold text-indigo-600 shadow-sm">{academicLevels.find(l => l.id === activeFilters.level)?.name}</span>}
                    {activeFilters.department && <span className="px-2 py-0.5 bg-white rounded-full text-[10px] font-bold text-indigo-600 shadow-sm">{activeFilters.department}</span>}
                    {activeFilters.course && <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold shadow-sm">{activeFilters.course}</span>}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-16"><div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
              ) : (
                <>
                  {searchQuery && <div className="mb-3 text-xs text-slate-500">Found {filteredColleges.length} result{filteredColleges.length !== 1 ? 's' : ''} for "{searchQuery}"</div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredColleges.map((college, i) => (<CollegeCard key={college.id} college={college} index={i} />))}
                  </div>
                  {filteredColleges.length === 0 && (
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

      {/* Trending Universities Section */}
      <section className="py-10 bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
            <div><div className="flex items-center gap-1.5 mb-2"><TrendingUp size={16} className="text-indigo-600" /><span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Trending Now</span></div><h2 className="text-2xl font-display font-black text-slate-900">Most Popular Universities</h2></div>
            <button onClick={() => navigate('/colleges')} className="px-4 py-1.5 bg-white text-slate-700 font-bold rounded-lg flex items-center gap-1.5 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs shadow-sm border border-slate-200">Search <ChevronRight size={12} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {trendingColleges.slice(0, 3).map((college, i) => (
              <motion.div key={college.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -3 }} onClick={() => requireAuth(() => navigate(`/university/${college.id}`))} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer border border-slate-100">
                <div className="relative h-36 overflow-hidden">
                  <img src={college.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={college.name} />
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
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-indigo-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[{ label: 'Universities', val: '2,500+', icon: Building2 }, { label: 'Student Reviews', val: '45k+', icon: MessageSquare }, { label: 'Live Projects', val: '12k+', icon: Globe }, { label: 'Happy Graduates', val: '30k+', icon: ShieldCheck }].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center">
                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center mb-2"><stat.icon size={18} /></div>
                <div className="text-2xl font-display font-black mb-0.5">{stat.val}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}