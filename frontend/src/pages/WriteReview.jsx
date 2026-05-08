import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Star, Sparkles, MessageSquare, 
  ArrowRight, ArrowLeft, ShieldCheck, Trophy,
  CheckCircle2, AlertCircle, Search, Clock, Plus,
  Award, BookOpen, Calendar, Users, Heart, Zap, Crown, Lock, Globe, X,
  GraduationCap, Briefcase, Wifi, Coffee, Dumbbell, Library, Bus, Utensils,
  School, Computer, Mic, Flame, Trees, Car, Shield, Music, Bike,
  Footprints, Compass, Cloud, Sun, Moon, Activity, PartyPopper,
  TrendingUp, Smile, Frown, Meh
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './WriteReview.css';

export default function WriteReview() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, openAuthModal } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allUniversities, setAllUniversities] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  
  const [formData, setFormData] = useState({
    universityId: '',
    universityName: '',
    program: '',
    classYear: '',
    projectLink: '',
    ratings: {
      academicRigor: 4.0,
      teachingQuality: 4.0,
      curriculumRelevance: 4.0,
      facultySupport: 4.0,
      campusInfrastructure: 4.0,
      classrooms: 4.0,
      laboratories: 4.0,
      library: 4.0,
      wifiInternet: 4.0,
      canteenFood: 4.0,
      hostelFacilities: 4.0,
      cleanliness: 4.0,
      safetySecurity: 4.0,
      transportFacilities: 4.0,
      busAvailability: 4.0,
      locationConnectivity: 4.0,
      placementSupport: 4.0,
      internshipOpportunities: 4.0,
      careerGuidance: 4.0,
      industryExposure: 4.0,
      socialLife: 4.0,
      clubsActivities: 4.0,
      eventsFests: 4.0,
      campusCulture: 4.0,
      sportsFacilities: 4.0,
      gymFacilities: 4.0,
      extracurricular: 4.0
    },
    title: '',
    pros: '',
    cons: '',
    tips: ''
  });

  useEffect(() => {
    if (!isAuthenticated && !token) {
      openAuthModal();
    }
  }, [isAuthenticated, token, openAuthModal]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const result = await api.getUniversities({ limit: 100 });
        console.log('Fetched universities:', result);
        if (result.success && result.data) {
          setAllUniversities(result.data);
          setUniversities(result.data);
          if (routeId) {
            const selected = result.data.find(u => u.id === routeId || u._id === routeId);
            if (selected) selectUniversity(selected);
          }
        } else {
          console.error('Failed to fetch universities:', result.error);
        }
      } catch (err) {
        console.error('Error fetching universities:', err);
      }
    };
    fetchUniversities();
  }, [routeId]);

  useEffect(() => {
    if (searchTerm && !formData.universityId) {
      const filtered = allUniversities.filter(uni => 
        uni.name && uni.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setUniversities(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchTerm, allUniversities, formData.universityId]);

  const selectUniversity = (uni) => {
    setFormData(prev => ({ ...prev, universityId: uni.id || uni._id, universityName: uni.name }));
    setSearchTerm(uni.name);
    setShowDropdown(false);
  };

  const clearUniversity = () => {
    setFormData(prev => ({ ...prev, universityId: '', universityName: '' }));
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.universityId) {
      setError('Please select a university');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.program) {
      setError('Please enter your program');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.classYear) {
      setError('Please enter your graduation year');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Calculate average rating from all categories
      const ratingValues = Object.values(formData.ratings);
      const avgRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;
      
      const reviewData = {
        universityId: formData.universityId,
        title: formData.title || `Review for ${formData.universityName}`,
        content: formData.tips || formData.pros || 'Insightful feedback shared.',
        rating: parseFloat(avgRating.toFixed(1)),
        ratings: formData.ratings,
        pros: formData.pros ? formData.pros.split(',').map(p => p.trim()).filter(p => p) : [],
        cons: formData.cons ? formData.cons.split(',').map(c => c.trim()).filter(c => c) : [],
        tips: formData.tips || '',
        classYear: formData.classYear.toString(),
        major: formData.program,
        projectLink: formData.projectLink || ''
      };
      
      console.log('Submitting review data:', reviewData);
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const res = await api.createReview(reviewData, token);
      console.log('Create review response:', res);
      
      if (res.success) {
        alert('✓ Review submitted successfully! Thank you for sharing your experience.');
        navigate(`/university/${formData.universityId}`);
      } else {
        setError(res.message || 'Failed to submit review. Please try again.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('A connection error occurred. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'The Institution', icon: Building2 },
    { number: 2, title: 'The Experience', icon: Star },
    { number: 3, title: 'The Insights', icon: MessageSquare },
    { number: 4, title: 'The Legacy', icon: Trophy }
  ];

  const getRatingEmoji = (value) => {
    if (value >= 4.5) return { emoji: '🌟', text: 'Outstanding', color: 'text-emerald-500' };
    if (value >= 4.0) return { emoji: '😊', text: 'Great', color: 'text-green-500' };
    if (value >= 3.0) return { emoji: '🙂', text: 'Good', color: 'text-blue-500' };
    if (value >= 2.0) return { emoji: '😐', text: 'Average', color: 'text-yellow-500' };
    return { emoji: '😞', text: 'Needs Improvement', color: 'text-rose-500' };
  };

  const ratingSections = [
    {
      id: 0,
      title: 'Academics',
      icon: GraduationCap,
      color: 'indigo',
      gradient: 'from-indigo-500 to-purple-500',
      categories: [
        { key: 'academicRigor', label: 'Academic Rigor', icon: Flame, description: 'Challenge level & depth of curriculum' },
        { key: 'teachingQuality', label: 'Teaching Quality', icon: Mic, description: 'Faculty expertise & engagement' },
        { key: 'curriculumRelevance', label: 'Curriculum Relevance', icon: Compass, description: 'Industry alignment & practical value' },
        { key: 'facultySupport', label: 'Faculty Support', icon: Users, description: 'Mentorship & guidance' }
      ]
    },
    {
      id: 1,
      title: 'Infrastructure',
      icon: Building2,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      categories: [
        { key: 'campusInfrastructure', label: 'Campus Infrastructure', icon: School, description: 'Buildings, design, maintenance' },
        { key: 'classrooms', label: 'Classrooms', icon: Computer, description: 'Smart classes, seating, AC' },
        { key: 'laboratories', label: 'Laboratories', icon: Zap, description: 'Equipment, safety, resources' },
        { key: 'library', label: 'Library', icon: Library, description: 'Books, journals, study space' },
        { key: 'wifiInternet', label: 'Wi-Fi & Internet', icon: Wifi, description: 'Speed & campus connectivity' }
      ]
    },
    {
      id: 2,
      title: 'Campus Life',
      icon: Coffee,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
      categories: [
        { key: 'canteenFood', label: 'Canteen & Food', icon: Utensils, description: 'Quality, variety, hygiene' },
        { key: 'hostelFacilities', label: 'Hostel Facilities', icon: Building2, description: 'Rooms, amenities, maintenance' },
        { key: 'cleanliness', label: 'Cleanliness', icon: Sun, description: 'Campus & hostel hygiene' },
        { key: 'safetySecurity', label: 'Safety & Security', icon: Shield, description: 'CCTV, guards, student safety' }
      ]
    },
    {
      id: 3,
      title: 'Transport',
      icon: Bus,
      color: 'teal',
      gradient: 'from-teal-500 to-emerald-500',
      categories: [
        { key: 'transportFacilities', label: 'Transport Facilities', icon: Car, description: 'College bus services' },
        { key: 'busAvailability', label: 'Bus Availability', icon: Bus, description: 'Frequency & routes' },
        { key: 'locationConnectivity', label: 'Connectivity', icon: Compass, description: 'Location access & commute' }
      ]
    },
    {
      id: 4,
      title: 'Placements',
      icon: Briefcase,
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-500',
      categories: [
        { key: 'placementSupport', label: 'Placement Support', icon: Trophy, description: 'Placement cell & assistance' },
        { key: 'internshipOpportunities', label: 'Internships', icon: Calendar, description: 'Opportunities & quality' },
        { key: 'careerGuidance', label: 'Career Guidance', icon: Compass, description: 'Counseling & workshops' },
        { key: 'industryExposure', label: 'Industry Exposure', icon: Globe, description: 'Visits, guest lectures' }
      ]
    },
    {
      id: 5,
      title: 'Student Life',
      icon: Users,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      categories: [
        { key: 'socialLife', label: 'Social Life', icon: Users, description: 'Peer interactions & community' },
        { key: 'clubsActivities', label: 'Clubs & Activities', icon: Music, description: 'Student clubs & events' },
        { key: 'eventsFests', label: 'Events & Fests', icon: Sparkles, description: 'Cultural fests & celebrations' },
        { key: 'campusCulture', label: 'Campus Culture', icon: Heart, description: 'Inclusivity & vibe' }
      ]
    },
    {
      id: 6,
      title: 'Sports',
      icon: Dumbbell,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      categories: [
        { key: 'sportsFacilities', label: 'Sports Facilities', icon: Trophy, description: 'Grounds, courts, equipment' },
        { key: 'gymFacilities', label: 'Gym Facilities', icon: Activity, description: 'Equipment & trainers' },
        { key: 'extracurricular', label: 'Extracurricular', icon: Users, description: 'Sports events & competitions' }
      ]
    }
  ];

  const overallRating = (Object.values(formData.ratings).reduce((a, b) => a + b, 0) / Object.values(formData.ratings).length).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pb-20">
      
      <main className="max-w-7xl mx-auto px-6 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Journey Container */}
          <div className="lg:col-span-8">
            <header className="mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-4">
                  <Sparkles size={12} /> Academic Contribution
                </span>
                <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight">
                  Share Your Story
                </h1>
                <p className="text-slate-500 text-base mt-2">Your insights help 12,000+ students find their path every month.</p>
              </motion.div>
            </header>

            {/* Stepper */}
            <div className="mb-12">
              <div className="flex justify-between relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-5 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
                
                {steps.map((s, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                    <motion.div 
                      animate={{ 
                        backgroundColor: step > i + 1 ? '#4f46e5' : step === i + 1 ? '#4f46e5' : '#ffffff',
                        borderColor: step >= i + 1 ? '#4f46e5' : '#e2e8f0',
                        color: step > i + 1 ? '#ffffff' : step === i + 1 ? '#4f46e5' : '#94a3b8',
                        scale: step === i + 1 ? 1.1 : 1
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 bg-white shadow-md"
                    >
                      {step > i + 1 ? <CheckCircle2 size={16} className="text-white" /> : s.number}
                    </motion.div>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${step === i + 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
                <AlertCircle size={18} className="text-rose-600" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100"
              >
                {/* Step 1: Institution */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Building2 size={28} className="text-indigo-600" />
                      </div>
                      <h2 className="text-xl font-black text-slate-900">Tell us about your institution</h2>
                      <p className="text-sm text-slate-500 mt-1">Help us verify your academic journey</p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                          Which institution? <span className="text-rose-500">*</span>
                        </label>
                        
                        {formData.universityName ? (
                          <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {formData.universityName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{formData.universityName}</div>
                                <div className="text-xs text-slate-500">Selected Institution</div>
                              </div>
                            </div>
                            <button
                              onClick={clearUniversity}
                              className="p-2 hover:bg-indigo-200 rounded-lg transition-colors"
                            >
                              <X size={16} className="text-indigo-600" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onFocus={() => {
                                if (searchTerm && !formData.universityId) {
                                  setShowDropdown(true);
                                }
                              }}
                              placeholder="Search university name..."
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                            <AnimatePresence>
                              {showDropdown && universities.length > 0 && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-64 overflow-y-auto"
                                >
                                  {universities.map(uni => (
                                    <button 
                                      key={uni.id} 
                                      onClick={() => selectUniversity(uni)}
                                      className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 transition-all text-left border-b border-slate-50 last:border-0"
                                    >
                                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm">
                                        {uni.name?.charAt(0) || 'U'}
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-bold text-slate-800 text-sm">{uni.name}</div>
                                        <div className="text-xs text-slate-400">{uni.city || 'India'}</div>
                                      </div>
                                      <ArrowRight size={14} className="text-slate-300" />
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                            Your Program <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="e.g., Computer Science Engineering" 
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={formData.program}
                              onChange={(e) => setFormData({...formData, program: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                            Graduation Year <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                              value={formData.classYear}
                              onChange={(e) => setFormData({...formData, classYear: e.target.value})}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                            >
                              <option value="">Select Year</option>
                              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Experience - With step 0.1 for ratings */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <TrendingUp size={32} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900">How was your experience?</h2>
                      <p className="text-slate-500 text-sm mt-1">Rate different aspects of your college journey</p>
                      
                      <div className="inline-flex items-center gap-3 mt-4 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full">
                        <span className="text-sm font-medium text-slate-600">Overall Rating:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-black text-indigo-600">{overallRating}</span>
                          <span className="text-sm text-slate-400">/5.0</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{getRatingEmoji(parseFloat(overallRating)).emoji}</span>
                          <span className={`text-sm font-bold ${getRatingEmoji(parseFloat(overallRating)).color}`}>
                            {getRatingEmoji(parseFloat(overallRating)).text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Professional Section Tabs with Icons */}
                    <div className="section-tabs-container">
                      <div className="section-tabs-wrapper">
                        {ratingSections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`section-tab-btn ${activeSection === section.id ? 'active' : ''}`}
                          >
                            <div className="tab-icon" style={{ backgroundColor: activeSection === section.id ? `${section.color === 'indigo' ? '#6366f1' : section.color === 'blue' ? '#3b82f6' : section.color === 'amber' ? '#f59e0b' : section.color === 'teal' ? '#14b8a6' : section.color === 'emerald' ? '#10b981' : section.color === 'purple' ? '#a855f7' : '#f97316'}15` : '#f1f5f9' }}>
                              <section.icon size={18} style={{ color: activeSection === section.id ? (section.color === 'indigo' ? '#6366f1' : section.color === 'blue' ? '#3b82f6' : section.color === 'amber' ? '#f59e0b' : section.color === 'teal' ? '#14b8a6' : section.color === 'emerald' ? '#10b981' : section.color === 'purple' ? '#a855f7' : '#f97316') : '#94a3b8' }} />
                            </div>
                            <span className="tab-label">{section.title}</span>
                            {activeSection === section.id && <div className="tab-indicator" style={{ backgroundColor: section.color === 'indigo' ? '#6366f1' : section.color === 'blue' ? '#3b82f6' : section.color === 'amber' ? '#f59e0b' : section.color === 'teal' ? '#14b8a6' : section.color === 'emerald' ? '#10b981' : section.color === 'purple' ? '#a855f7' : '#f97316' }} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Section Content */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {ratingSections[activeSection].categories.map((cat) => {
                          const ratingValue = formData.ratings[cat.key];
                          const ratingInfo = getRatingEmoji(ratingValue);
                          
                          return (
                            <div key={cat.key} className="group">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg bg-${ratingSections[activeSection].color}-100 flex items-center justify-center`}>
                                    <cat.icon size={14} className={`text-${ratingSections[activeSection].color}-600`} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800 text-sm">{cat.label}</p>
                                    <p className="text-[10px] text-slate-400">{cat.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{ratingInfo.emoji}</span>
                                  <span className={`font-black text-lg ${ratingInfo.color}`}>
                                    {ratingValue.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                              
                              <input 
                                type="range" 
                                min="1" 
                                max="5" 
                                step="0.1"
                                value={ratingValue}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  ratings: {...formData.ratings, [cat.key]: parseFloat(e.target.value)}
                                })}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, 
                                    ${ratingSections[activeSection].color === 'indigo' ? '#6366f1' : 
                                      ratingSections[activeSection].color === 'blue' ? '#3b82f6' :
                                      ratingSections[activeSection].color === 'amber' ? '#f59e0b' :
                                      ratingSections[activeSection].color === 'teal' ? '#14b8a6' :
                                      ratingSections[activeSection].color === 'emerald' ? '#10b981' :
                                      ratingSections[activeSection].color === 'purple' ? '#a855f7' : '#f97316'} 
                                    ${((ratingValue - 1) / 4) * 100}%, 
                                    #e2e8f0 ${((ratingValue - 1) / 4) * 100}%)`
                                }}
                              />
                              <div className="flex justify-between mt-2 px-1">
                                {[1, 2, 3, 4, 5].map(val => (
                                  <span 
                                    key={val} 
                                    onClick={() => setFormData({
                                      ...formData, 
                                      ratings: {...formData.ratings, [cat.key]: val}
                                    })}
                                    className={`text-[9px] font-medium cursor-pointer transition-all ${
                                      ratingValue >= val && ratingValue < val + 0.5 ? `text-${ratingSections[activeSection].color}-600 font-bold scale-110` : 'text-slate-400'
                                    } hover:text-${ratingSections[activeSection].color}-500`}
                                  >
                                    {val}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <div className="text-xs text-slate-400">
                        Section {activeSection + 1} of {ratingSections.length}
                      </div>
                      <div className="flex gap-1">
                        {ratingSections.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveSection(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                              idx === activeSection ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Insights */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <MessageSquare size={28} className="text-purple-600" />
                      </div>
                      <h2 className="text-xl font-black text-slate-900">Share Your Insights</h2>
                      <p className="text-sm text-slate-500 mt-1">Tell future students what they should know</p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                          Headline for your story
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., 'Best decision of my life!' or 'Great academics but average placements'"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="flex items-center gap-2 text-xs font-black text-emerald-700 uppercase tracking-wider mb-2">
                            <span>👍</span> What Went Well (Pros)
                          </label>
                          <textarea 
                            className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium min-h-[140px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="e.g., Excellent faculty, Great infrastructure, Strong placements"
                            value={formData.pros}
                            onChange={(e) => setFormData({...formData, pros: e.target.value})}
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Separate multiple points with commas</p>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs font-black text-rose-700 uppercase tracking-wider mb-2">
                            <span>👎</span> What Needs Improvement (Cons)
                          </label>
                          <textarea 
                            className="w-full p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-medium min-h-[140px] focus:outline-none focus:ring-2 focus:ring-rose-500"
                            placeholder="e.g., Poor hostel food, Limited sports facilities"
                            value={formData.cons}
                            onChange={(e) => setFormData({...formData, cons: e.target.value})}
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Separate multiple points with commas</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                          Tips for Future Students
                        </label>
                        <textarea 
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="What advice would you give to incoming students?"
                          value={formData.tips}
                          onChange={(e) => setFormData({...formData, tips: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Legacy */}
                {step === 4 && (
                  <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Sparkles size={36} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Ready to Publish?</h2>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      Your contribution will help thousands of students make informed decisions about their future.
                    </p>
                    
                    <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl text-left max-w-md mx-auto">
                      <div className="flex items-start gap-3">
                        <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-900 font-medium">
                          Please verify that all information is accurate. Reviews are vetted by our community guardians.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mt-4">
                      <div className="bg-slate-50 p-3 rounded-xl text-center">
                        <div className="text-xl font-black text-indigo-600">{overallRating}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Overall Rating</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl text-center">
                        <div className="text-xl font-black text-emerald-600">
                          {formData.universityName ? formData.universityName.split(' ')[0] : 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Institution</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <button 
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
                className="flex items-center gap-2 px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} /> Back
              </button>
              
              <button 
                onClick={() => step === 4 ? handleSubmit() : setStep(s => s + 1)}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {step === 4 ? 'Publish Review' : 'Continue'}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <aside className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Award size={24} className="text-amber-400" />
                </div>
                <h3 className="text-xl font-black mb-2">Community Reward</h3>
                <p className="text-slate-300 text-sm mb-4">Earn 50 Atelier Credits instantly upon publication.</p>
                <div className="space-y-2">
                  {[
                    { icon: Lock, text: 'Portfolio Review Unlocks' },
                    { icon: Users, text: 'Direct Mentor Access' },
                    { icon: Globe, text: 'Premium Resource Library' }
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-indigo-300 font-medium">
                      <benefit.icon size={12} />
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-indigo-600" />
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Integrity Checklist</h3>
              </div>
              <div className="space-y-3">
                {[
                  'Honest, unbiased feedback',
                  'Specific department details',
                  'Professional language',
                  'Actionable advice for juniors'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-indigo-600" />
                <span className="text-xs font-black text-indigo-700 uppercase tracking-wider">Pro Tip</span>
              </div>
              <p className="text-sm text-indigo-800 font-medium">
                The most helpful reviews are specific, balanced, and include actionable advice for future students.
              </p>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}