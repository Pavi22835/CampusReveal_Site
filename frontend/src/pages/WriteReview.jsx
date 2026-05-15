import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Star, Sparkles, MessageSquare, 
  ArrowRight, ArrowLeft, ShieldCheck, Trophy,
  CheckCircle2, AlertCircle, Search, Calendar,
  Award, BookOpen, Users, Heart, Zap, Crown, Lock, Globe, X,
  GraduationCap, Briefcase, Wifi, Coffee, Dumbbell, Library, Bus, Utensils,
  School, Computer, Mic, Flame, Trees, Car, Shield, Music,
  Compass, Sun, Activity, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './WriteReview.css';

export default function WriteReview() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, openAuthModal, user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
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
    const loadData = async () => {
      try {
        // Get stored data from localStorage
        const storedUniId = localStorage.getItem('reviewUniversityId');
        const storedUniName = localStorage.getItem('reviewUniversityName');
        const storedDepartment = localStorage.getItem('userDepartment');
        const storedYear = localStorage.getItem('userGraduationYear');
        const storedCollegeName = localStorage.getItem('userCollegeName');
        
        console.log('Stored data:', {
          storedUniId,
          storedUniName,
          storedDepartment,
          storedYear,
          storedCollegeName
        });
        
        // Set university data
        if (storedUniId && storedUniName) {
          setFormData(prev => ({ 
            ...prev, 
            universityId: storedUniId, 
            universityName: storedUniName 
          }));
          setIsVerified(true);
        } else if (storedCollegeName) {
          setFormData(prev => ({ 
            ...prev, 
            universityName: storedCollegeName 
          }));
          setIsVerified(true);
        }
        
        // Set department and year
        if (storedDepartment) {
          setFormData(prev => ({ ...prev, program: storedDepartment }));
          setIsVerified(true);
        }
        
        if (storedYear) {
          setFormData(prev => ({ ...prev, classYear: storedYear }));
          setIsVerified(true);
        }
        
        // Also check routeId for university detail page
        if (routeId && !storedUniId) {
          try {
            const uniResult = await api.getUniversity(routeId);
            if (uniResult.success && uniResult.data) {
              setFormData(prev => ({ 
                ...prev, 
                universityId: routeId, 
                universityName: uniResult.data.name 
              }));
              setIsVerified(true);
            }
          } catch (err) {
            console.error('Error fetching university by routeId:', err);
          }
        }
        
        setIsDataLoaded(true);
      } catch (err) {
        console.error('Error loading data:', err);
        setIsDataLoaded(true);
      }
    };
    
    loadData();
  }, [routeId]);

  const handleSubmit = async () => {
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
      const ratingValues = Object.values(formData.ratings);
      const avgRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;
      
      const prosList = formData.pros ? formData.pros.split(',').map(p => p.trim()).filter(p => p) : [];
      const consList = formData.cons ? formData.cons.split(',').map(c => c.trim()).filter(c => c) : [];
      
      const reviewData = {
        universityId: formData.universityId,
        title: formData.title || `Review for ${formData.universityName}`,
        content: formData.tips || formData.pros || 'Insightful feedback shared.',
        rating: parseFloat(avgRating.toFixed(1)),
        ratings: formData.ratings,
        pros: prosList,
        cons: consList,
        tips: formData.tips || '',
        classYear: formData.classYear.toString(),
        major: formData.program,
        projectLink: formData.projectLink || ''
      };
      
      const res = await api.createReview(reviewData, token);
      
      if (res.success) {
        // Clear stored data after successful submission
        localStorage.removeItem('userDepartment');
        localStorage.removeItem('userGraduationYear');
        localStorage.removeItem('userCollegeName');
        localStorage.removeItem('reviewUniversityId');
        localStorage.removeItem('reviewUniversityName');
        
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
      id: 0, title: 'Academics', icon: GraduationCap, color: 'indigo',
      categories: [
        { key: 'academicRigor', label: 'Academic Rigor', icon: Flame },
        { key: 'teachingQuality', label: 'Teaching Quality', icon: Mic },
        { key: 'curriculumRelevance', label: 'Curriculum Relevance', icon: Compass },
        { key: 'facultySupport', label: 'Faculty Support', icon: Users }
      ]
    },
    {
      id: 1, title: 'Infrastructure', icon: Building2, color: 'blue',
      categories: [
        { key: 'campusInfrastructure', label: 'Campus Infrastructure', icon: School },
        { key: 'classrooms', label: 'Classrooms', icon: Computer },
        { key: 'laboratories', label: 'Laboratories', icon: Zap },
        { key: 'library', label: 'Library', icon: Library },
        { key: 'wifiInternet', label: 'Wi-Fi & Internet', icon: Wifi }
      ]
    },
    {
      id: 2, title: 'Campus Life', icon: Coffee, color: 'amber',
      categories: [
        { key: 'canteenFood', label: 'Canteen & Food', icon: Utensils },
        { key: 'hostelFacilities', label: 'Hostel Facilities', icon: Building2 },
        { key: 'cleanliness', label: 'Cleanliness', icon: Sun },
        { key: 'safetySecurity', label: 'Safety & Security', icon: Shield }
      ]
    },
    {
      id: 3, title: 'Transport', icon: Bus, color: 'teal',
      categories: [
        { key: 'transportFacilities', label: 'Transport Facilities', icon: Car },
        { key: 'busAvailability', label: 'Bus Availability', icon: Bus },
        { key: 'locationConnectivity', label: 'Connectivity', icon: Compass }
      ]
    },
    {
      id: 4, title: 'Placements', icon: Briefcase, color: 'emerald',
      categories: [
        { key: 'placementSupport', label: 'Placement Support', icon: Trophy },
        { key: 'internshipOpportunities', label: 'Internships', icon: Calendar },
        { key: 'careerGuidance', label: 'Career Guidance', icon: Compass },
        { key: 'industryExposure', label: 'Industry Exposure', icon: Globe }
      ]
    },
    {
      id: 5, title: 'Student Life', icon: Users, color: 'purple',
      categories: [
        { key: 'socialLife', label: 'Social Life', icon: Users },
        { key: 'clubsActivities', label: 'Clubs & Activities', icon: Music },
        { key: 'eventsFests', label: 'Events & Fests', icon: Sparkles },
        { key: 'campusCulture', label: 'Campus Culture', icon: Heart }
      ]
    },
    {
      id: 6, title: 'Sports', icon: Dumbbell, color: 'orange',
      categories: [
        { key: 'sportsFacilities', label: 'Sports Facilities', icon: Trophy },
        { key: 'gymFacilities', label: 'Gym Facilities', icon: Activity },
        { key: 'extracurricular', label: 'Extracurricular', icon: Users }
      ]
    }
  ];

  const overallRating = (Object.values(formData.ratings).reduce((a, b) => a + b, 0) / Object.values(formData.ratings).length).toFixed(1);
  const availableYears = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).sort((a, b) => b - a);

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pb-20">
      <main className="max-w-4xl mx-auto px-6 pt-28">
        <div className="grid grid-cols-1 gap-8">
          <div>
            <header className="mb-8 text-center">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-4">
                  <Sparkles size={12} /> Academic Contribution
                </span>
                <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight">
                  Share Your Story
                </h1>
                <p className="text-slate-500 text-sm mt-2">Your insights help 12,000+ students find their path every month.</p>
              </motion.div>
            </header>

            {/* Stepper */}
            <div className="mb-8 max-w-md mx-auto">
              <div className="flex justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-4 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
                
                {steps.map((s, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-1">
                    <motion.div 
                      animate={{ 
                        backgroundColor: step > i + 1 ? '#4f46e5' : step === i + 1 ? '#4f46e5' : '#ffffff',
                        borderColor: step >= i + 1 ? '#4f46e5' : '#e2e8f0',
                        color: step > i + 1 ? '#ffffff' : step === i + 1 ? '#4f46e5' : '#94a3b8',
                        scale: step === i + 1 ? 1.05 : 1
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 bg-white shadow-sm"
                    >
                      {step > i + 1 ? <CheckCircle2 size={12} className="text-white" /> : s.number}
                    </motion.div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${step === i + 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
                <AlertCircle size={16} className="text-rose-600" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl p-6 shadow-md border border-slate-100"
              >
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="text-center mb-3">
                      <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Building2 size={24} className="text-indigo-600" />
                      </div>
                      <h2 className="text-lg font-black text-slate-900">Tell us about your institution</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {isVerified ? "✓ Verified Information (Cannot be edited)" : "Help us verify your academic journey"}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* University Selection - LOCKED */}
                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                          Which institution? <span className="text-rose-500">*</span>
                        </label>
                        
                        {formData.universityName ? (
                          <div className="flex items-center justify-between p-3 rounded-xl border bg-green-50 border-green-200">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-base">
                                {formData.universityName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 text-sm">{formData.universityName}</div>
                                <div className="text-xs text-green-600 flex items-center gap-1">
                                  <Lock size={10} /> Verified Institution - Cannot be changed
                                </div>
                              </div>
                            </div>
                            <div className="text-green-600">
                              <CheckCircle2 size={16} />
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Search university name..."
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={formData.universityName}
                              onChange={(e) => {
                                if (!isVerified) {
                                  setFormData(prev => ({ ...prev, universityName: e.target.value }));
                                }
                              }}
                              disabled={isVerified}
                            />
                          </div>
                        )}
                      </div>

                      {/* Program / Department - LOCKED */}
                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                          Your Program / Department <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="e.g., Computer Science Engineering" 
                            className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isVerified ? 'bg-green-50 border border-green-200 text-slate-700' : 'bg-slate-50 border border-slate-200'}`}
                            value={formData.program}
                            onChange={(e) => setFormData({...formData, program: e.target.value})}
                            disabled={isVerified}
                            readOnly={isVerified}
                          />
                        </div>
                        {isVerified && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <Lock size={10} /> Verified from your profile - Cannot be changed
                          </p>
                        )}
                      </div>

                      {/* Passed Out Year - LOCKED */}
                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                          Passed Out Year <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <select
                            value={formData.classYear}
                            onChange={(e) => setFormData({...formData, classYear: e.target.value})}
                            disabled={isVerified}
                            className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none ${isVerified ? 'bg-green-50 border border-green-200 text-slate-700' : 'bg-slate-50 border border-slate-200'}`}
                          >
                            <option value="">Select Year</option>
                            {availableYears.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        {isVerified && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <Lock size={10} /> Verified from your profile - Cannot be changed
                          </p>
                        )}
                      </div>
                    </div>

                    {!formData.universityName && !isVerified && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={16} className="text-amber-600" />
                          <p className="text-xs text-amber-700">
                            Please search and select your college to continue.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2, 3, 4 remain the same as before */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                        <TrendingUp size={28} className="text-white" />
                      </div>
                      <h2 className="text-xl font-black text-slate-900">How was your experience?</h2>
                      <p className="text-xs text-slate-500 mt-1">Rate different aspects of your college journey</p>
                      
                      <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full">
                        <span className="text-xs font-medium text-slate-600">Overall:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-black text-indigo-600">{overallRating}</span>
                          <span className="text-xs text-slate-400">/5.0</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{getRatingEmoji(parseFloat(overallRating)).emoji}</span>
                          <span className={`text-xs font-bold ${getRatingEmoji(parseFloat(overallRating)).color}`}>
                            {getRatingEmoji(parseFloat(overallRating)).text}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 justify-center">
                      {ratingSections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            activeSection === section.id 
                              ? `bg-${section.color}-600 text-white shadow-sm` 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {section.title}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-3 max-h-96 overflow-y-auto pr-2"
                      >
                        {ratingSections[activeSection].categories.map((cat) => {
                          const ratingValue = formData.ratings[cat.key];
                          const ratingInfo = getRatingEmoji(ratingValue);
                          
                          return (
                            <div key={cat.key} className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <cat.icon size={14} className={`text-${ratingSections[activeSection].color}-600`} />
                                  <span className="font-semibold text-slate-800 text-sm">{cat.label}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm">{ratingInfo.emoji}</span>
                                  <span className={`font-bold text-sm ${ratingInfo.color}`}>
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
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
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
                            </div>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div className="text-xs text-slate-400">
                        {activeSection + 1} of {ratingSections.length}
                      </div>
                      <div className="flex gap-1">
                        {ratingSections.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveSection(idx)}
                            className={`h-1 rounded-full transition-all ${
                              idx === activeSection ? 'w-4 bg-indigo-600' : 'w-1.5 bg-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="text-center mb-2">
                      <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <MessageSquare size={24} className="text-purple-600" />
                      </div>
                      <h2 className="text-lg font-black text-slate-900">Share Your Insights</h2>
                      <p className="text-xs text-slate-500 mt-1">Tell future students what they should know</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                          Headline for your story
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., 'Best decision of my life!'"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-2 text-xs font-black text-emerald-700 uppercase tracking-wider mb-2">
                            <span>👍</span> Pros
                          </label>
                          <textarea 
                            className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="e.g., Excellent faculty, Great infrastructure"
                            value={formData.pros}
                            onChange={(e) => setFormData({...formData, pros: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs font-black text-rose-700 uppercase tracking-wider mb-2">
                            <span>👎</span> Cons
                          </label>
                          <textarea 
                            className="w-full p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-rose-500"
                            placeholder="e.g., Poor hostel food"
                            value={formData.cons}
                            onChange={(e) => setFormData({...formData, cons: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                          Tips for Future Students
                        </label>
                        <textarea 
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="What advice would you give?"
                          value={formData.tips}
                          onChange={(e) => setFormData({...formData, tips: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto shadow-md">
                      <Sparkles size={28} className="text-white" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Ready to Publish?</h2>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Your contribution will help thousands of students make informed decisions.
                    </p>
                    
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-left max-w-md mx-auto">
                      <div className="flex items-start gap-2">
                        <ShieldCheck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-indigo-900 font-medium">
                          Please verify that all information is accurate.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mt-2">
                      <div className="bg-slate-50 p-2 rounded-lg text-center">
                        <div className="text-lg font-black text-indigo-600">{overallRating}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Rating</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg text-center">
                        <div className="text-lg font-black text-emerald-600 truncate">
                          {formData.universityName ? formData.universityName.split(' ')[0] : 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Institution</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6">
              <button 
                onClick={() => setStep(s => s - 1)}
                disabled={step === 1}
                className="flex items-center gap-1 px-5 py-2 font-semibold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
              >
                <ArrowLeft size={14} /> Back
              </button>
              
              <button 
                onClick={() => step === 4 ? handleSubmit() : setStep(s => s + 1)}
                disabled={loading || (!formData.universityName && step === 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {step === 4 ? 'Publish Review' : 'Continue'}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}