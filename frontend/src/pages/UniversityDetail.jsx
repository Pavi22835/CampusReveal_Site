import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Star, Share2, Heart, ShieldCheck, Users, 
  GraduationCap, Building2, Globe, Sparkles, BookOpen, Clock,
  ArrowRight, ExternalLink, ChevronRight, MessageSquare,
  CheckCircle, XCircle, Plus, Minus, Zap, Wifi, Dumbbell,
  Library, Bus, Utensils, Coffee, Award, TrendingUp, Calendar,
  Mail, Phone, Linkedin, Twitter, Facebook, Computer, Navigation
} from 'lucide-react';
import { api } from '../services/api';
import './UniversityDetail.css';

export default function UniversityDetail() {
  const { id } = useParams();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [averageRatings, setAverageRatings] = useState({
    academicRigor: 0,
    teachingQuality: 0,
    curriculumRelevance: 0,
    facultySupport: 0,
    campusInfrastructure: 0,
    classrooms: 0,
    laboratories: 0,
    library: 0,
    wifiInternet: 0,
    canteenFood: 0,
    hostelFacilities: 0,
    cleanliness: 0,
    safetySecurity: 0,
    transportFacilities: 0,
    busAvailability: 0,
    locationConnectivity: 0,
    placementSupport: 0,
    internshipOpportunities: 0,
    careerGuidance: 0,
    industryExposure: 0,
    socialLife: 0,
    clubsActivities: 0,
    eventsFests: 0,
    campusCulture: 0,
    sportsFacilities: 0,
    gymFacilities: 0,
    extracurricular: 0
  });
  const [overallRating, setOverallRating] = useState(0);
  const currentYear = new Date().getFullYear();

  const getCoordinates = (city) => {
    const coordinates = {
      'Coimbatore': { lat: 11.0168, lng: 76.9558, zoom: 15 },
      'Chennai': { lat: 13.0827, lng: 80.2707, zoom: 15 },
      'Madurai': { lat: 9.9252, lng: 78.1198, zoom: 15 },
      'Tiruchirappalli': { lat: 10.7905, lng: 78.7047, zoom: 15 },
      'Salem': { lat: 11.6643, lng: 78.1460, zoom: 15 },
      'Vellore': { lat: 12.9165, lng: 79.1325, zoom: 15 },
      'Bangalore': { lat: 12.9716, lng: 77.5946, zoom: 15 },
      'Mumbai': { lat: 19.0760, lng: 72.8777, zoom: 15 },
      'Delhi': { lat: 28.7041, lng: 77.1025, zoom: 15 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867, zoom: 15 }
    };
    return coordinates[city] || { lat: 11.0168, lng: 76.9558, zoom: 15 };
  };

  const parseArrayField = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      return value
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  // Use university images only, no fallback images
  const galleryImages = Array.from(new Set([
    ...(university?.images || []),
    university?.imageUrl,
    university?.image
  ].filter(Boolean)));

  // Only show images if they exist, otherwise show a placeholder
  const galleryDisplay = galleryImages.length > 0 ? galleryImages.slice(0, 4) : [];

  const ratingsMetadata = university?.ratings?.metadata || {};

  const courseList = parseArrayField(university?.courses);
  const facilityList = university?.facilities?.length
    ? university.facilities
    : [...parseArrayField(university?.sports), ...parseArrayField(university?.clubs)].slice(0, 8);

  const overviewHighlights = [
    ratingsMetadata.accreditation ? `🏆 ${ratingsMetadata.accreditation}` : null,
    ratingsMetadata.placementRate ? `💼 ${ratingsMetadata.placementRate}` : null,
    ratingsMetadata.facultyCount ? `👨‍🏫 ${ratingsMetadata.facultyCount} faculty` : null,
    university?.established ? `📍 Established ${university.established}` : null,
    university?.category ? `🎓 ${university.category}` : null,
    university?.type ? `🏛️ ${university.type}` : null,
    university?.isFeatured ? '🌟 Featured campus' : null
  ].filter(Boolean);

  const fastFacts = [
    { label: 'Acceptance Rate', value: university?.acceptanceRate || ratingsMetadata.acceptanceRate || 'N/A' },
    { label: 'Student-Faculty Ratio', value: university?.studentCount && university?.facultyCount ? `1:${Math.max(1, Math.round(university.studentCount / university.facultyCount))}` : 'N/A' },
    { label: 'Average Package', value: university?.medianSalary || ratingsMetadata.medianSalary || 'N/A' },
    { label: 'Total Reviews', value: reviews.length > 0 ? `${reviews.length} reviews` : university?._count?.reviews ? `${university._count.reviews} reviews` : '0 reviews' }
  ];

  const addressText = university?.location || [university?.city, university?.state].filter(Boolean).join(', ');
  const locationLink = university?.googleMapsLink || university?.locationLink || '';
  const hasLocationLink = Boolean(locationLink);

  const createEmbedUrl = (link, address) => {
    if (!link) return null;
    if (link.includes('/embed') || link.includes('output=embed') || link.includes('/maps/embed')) {
      return link;
    }
    if (link.includes('maps.google.com') && link.includes('/place/')) {
      return link.replace('/place/', '/embed/v1/place/');
    }
    const query = encodeURIComponent(address || link);
    return `https://maps.google.com/maps?q=${query}&output=embed`;
  };

  const mapEmbedUrl = hasLocationLink ? createEmbedUrl(locationLink, addressText) : null;
  const mapLinkUrl = locationLink || `https://maps.google.com/?q=${encodeURIComponent(addressText)}`;

  useEffect(() => {
    if (id) fetchUniversityData();
  }, [id]);

  const fetchUniversityData = async () => {
    setLoading(true);
    setError(null);
    try {
      const uniResult = await api.getUniversity(id);
      
      if (uniResult.success && uniResult.data) {
        setUniversity(uniResult.data);
      } else {
        setError(uniResult.message || 'University not found');
      }

      try {
        const reviewsResult = await api.getReviews(id);
        
        let reviewsData = [];
        if (reviewsResult && reviewsResult.success && Array.isArray(reviewsResult.data)) {
          reviewsData = reviewsResult.data;
        } else if (reviewsResult && Array.isArray(reviewsResult.data)) {
          reviewsData = reviewsResult.data;
        } else if (reviewsResult && Array.isArray(reviewsResult)) {
          reviewsData = reviewsResult;
        }
        
        setReviews(reviewsData);
        
        if (reviewsData.length > 0) {
          calculateAverageRatings(reviewsData);
        } else {
          const emptyRatings = {};
          Object.keys(averageRatings).forEach(key => {
            emptyRatings[key] = 0;
          });
          setAverageRatings(emptyRatings);
          setOverallRating(university?.rating || 0);
        }
      } catch (reviewErr) {
        console.error('Error fetching reviews:', reviewErr);
        setReviews([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load university details');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRatings = (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) return;
    
    const ratingsSum = {};
    let count = 0;
    let totalRatingSum = 0;

    Object.keys(averageRatings).forEach(key => {
      ratingsSum[key] = 0;
    });

    reviewsData.forEach(review => {
      if (review.ratings && typeof review.ratings === 'object') {
        count++;
        totalRatingSum += review.rating || 0;
        
        Object.keys(ratingsSum).forEach(key => {
          if (review.ratings[key] && typeof review.ratings[key] === 'number') {
            ratingsSum[key] += review.ratings[key];
          }
        });
      } else if (review.rating) {
        count++;
        totalRatingSum += review.rating;
      }
    });

    if (count === 0) return;

    const newAverages = {};
    Object.keys(ratingsSum).forEach(key => {
      newAverages[key] = ratingsSum[key] > 0 ? parseFloat((ratingsSum[key] / count).toFixed(1)) : 0;
    });

    setAverageRatings(newAverages);
    setOverallRating(parseFloat((totalRatingSum / count).toFixed(1)));
  };

  const verdictCategories = [
    { 
      label: "Academics", 
      score: averageRatings.academicRigor || averageRatings.teachingQuality || 4.2,
      color: "bg-indigo-500",
      subCategories: ['Academic Rigor', 'Teaching Quality', 'Curriculum Relevance']
    },
    { 
      label: "Faculty", 
      score: averageRatings.facultySupport || 4.0,
      color: "bg-purple-500",
      subCategories: ['Faculty Support', 'Mentorship']
    },
    { 
      label: "Infrastructure", 
      score: averageRatings.campusInfrastructure || averageRatings.classrooms || 4.1,
      color: "bg-blue-500",
      subCategories: ['Campus Infrastructure', 'Classrooms', 'Laboratories', 'Library', 'Wi-Fi']
    },
    { 
      label: "Campus Life", 
      score: averageRatings.canteenFood || averageRatings.hostelFacilities || 4.0,
      color: "bg-amber-500",
      subCategories: ['Canteen/Food', 'Hostel Facilities', 'Cleanliness', 'Safety']
    },
    { 
      label: "Placements", 
      score: averageRatings.placementSupport || averageRatings.internshipOpportunities || 4.3,
      color: "bg-emerald-500",
      subCategories: ['Placement Support', 'Internships', 'Career Guidance', 'Industry Exposure']
    },
    { 
      label: "Student Life", 
      score: averageRatings.socialLife || averageRatings.clubsActivities || 4.2,
      color: "bg-rose-500",
      subCategories: ['Social Life', 'Clubs', 'Events', 'Campus Culture']
    },
    { 
      label: "Sports", 
      score: averageRatings.sportsFacilities || averageRatings.gymFacilities || 3.9,
      color: "bg-orange-500",
      subCategories: ['Sports Facilities', 'Gym', 'Extracurricular']
    },
    { 
      label: "Transport", 
      score: averageRatings.transportFacilities || averageRatings.busAvailability || 4.0,
      color: "bg-teal-500",
      subCategories: ['Transport', 'Bus Availability', 'Connectivity']
    }
  ];

  const openGoogleMaps = () => {
    window.open(mapLinkUrl, '_blank');
  };

  const openDirections = () => {
    const destination = encodeURIComponent(addressText);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };

  const renderStars = (rating) => {
    const numRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = (numRating - fullStars) >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={14} fill="#f59e0b" className="text-amber-500" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} fill="none" className="text-amber-500" stroke="currentColor" />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} fill="none" className="text-slate-300" />);
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
    if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    if (diffDays >= 7) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    if (diffDays >= 1) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    return 'Today';
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading university details...</p>
      </div>
    </div>
  );

  if (error || !university) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
          <BookOpen size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 mb-8 max-w-sm">{error || 'We couldn\'t find that university in our records.'}</p>
        <Link to="/" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
          Explore Other Colleges
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pb-20">
      <main className="max-w-7xl mx-auto px-6 pt-28">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <Link to="/colleges" className="hover:text-indigo-600 transition-colors">Colleges</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <span className="text-slate-900">{university.name}</span>
        </nav>

        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-slate-900 leading-tight tracking-tight mb-3">
              {university.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-slate-500">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-rose-500" />
                <span className="text-sm font-medium">{addressText || 'Coimbatore, Tamil Nadu'}</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="flex items-center gap-1">
                {renderStars(overallRating)}
                <span className="text-sm font-bold text-slate-800 ml-1">{overallRating.toFixed(1)}</span>
                <span className="text-sm text-slate-400">({reviews.length} reviews)</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="flex items-center gap-1">
                <GraduationCap size={16} className="text-indigo-500" />
                <span className="text-sm font-medium text-slate-600">Est. {university.established || '2003'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Image Gallery - Only shows if images exist */}
        {galleryDisplay.length > 0 && (
          <section className="grid grid-cols-12 gap-4 mb-12">
            <div className="col-span-12 lg:col-span-7 h-80 lg:h-[420px]">
              <img 
                src={galleryDisplay[0]} 
                className="w-full h-full object-cover rounded-2xl shadow-md"
                alt={university.name}
              />
            </div>
            {galleryDisplay.length > 1 && (
              <div className="hidden lg:block lg:col-span-5">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {galleryDisplay.slice(1, 4).map((imgSrc, idx) => (
                    <img
                      key={idx}
                      src={imgSrc}
                      className={`w-full ${idx === 2 ? 'h-[200px] col-span-2' : 'h-[200px]'} object-cover rounded-2xl shadow-md`}
                      alt={`${university.name} campus`}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8">
            
            {/* Quick Stats Cards */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon: Users, label: 'Total Students', value: university?.studentCount ? university.studentCount.toLocaleString() : 'N/A' },
                { icon: GraduationCap, label: 'Faculty', value: university?.facultyCount ? university.facultyCount.toLocaleString() : 'N/A' },
                { icon: Award, label: 'Placement Rate', value: university?.placementRate || ratingsMetadata.placementRate || 'N/A' },
                { icon: Building2, label: 'Category', value: university?.category || university?.type || 'N/A' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm border border-slate-100">
                  <stat.icon size={22} className="text-indigo-600 mx-auto mb-2" />
                  <div className="text-lg font-black text-slate-800">{stat.value}</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </section>

            {/* Student Verdict Section */}
            {reviews.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Student Verdict</h2>
                    <p className="text-sm text-slate-500">Based on {reviews.length} student reviews</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-indigo-600">{overallRating.toFixed(1)}</div>
                    <div className="flex items-center gap-0.5">
                      {renderStars(overallRating)}
                    </div>
                    <span className="text-[11px] text-slate-400">Overall Rating</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {verdictCategories.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-700">{stat.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-indigo-600">{stat.score.toFixed(1)}</span>
                          <span className="text-xs text-slate-400">/5</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                        <div 
                          className={`h-full ${stat.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${(stat.score / 5) * 100}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {stat.subCategories.slice(0, 3).map((sub, idx) => (
                          <span key={idx} className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto pb-0.5">
              {['Overview', 'Courses', 'Facilities', 'Placements', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {activeTab === 'Overview' && (
                  <>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                      <h3 className="text-lg font-black text-slate-800 mb-3">About</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        {university.description || university.about || 'No description available.'}
                      </p>
                    </div>

                    {overviewHighlights.length > 0 && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Key Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {overviewHighlights.map((highlight, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle size={14} className="text-emerald-500" />
                              <span className="text-sm text-slate-600">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'Courses' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 mb-4">Popular Courses</h3>
                    <div className="space-y-3">
                      {courseList.length > 0 ? courseList.map((course, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-colors">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{course}</h4>
                            <div className="flex gap-3 mt-1">
                              <span className="text-xs text-slate-500">Duration varies</span>
                              <span className="text-xs font-bold text-indigo-600">Details on website</span>
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-slate-400" />
                        </div>
                      )) : (
                        <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-sm">No course data available.</div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'Facilities' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 mb-4">Campus Facilities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(facilityList.length > 0 ? facilityList : []).map((facility, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <CheckCircle size={18} className="text-indigo-500" />
                          <span className="text-sm font-medium text-slate-700">{facility}</span>
                        </div>
                      ))}
                      {facilityList.length === 0 && (
                        <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-sm col-span-2 text-center">
                          No facilities data available.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'Placements' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 mb-4">Placement Highlights</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-indigo-50 rounded-lg">
                          <div className="text-2xl font-black text-indigo-600">{university?.placementRate || ratingsMetadata.placementRate || 'N/A'}</div>
                          <div className="text-xs text-slate-500">Placement Rate</div>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg">
                          <div className="text-2xl font-black text-emerald-600">{university?.medianSalary || ratingsMetadata.medianSalary || 'N/A'}</div>
                          <div className="text-xs text-slate-500">Average Package</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Reviews' && (
                  <div className="space-y-5">
                    {reviews.length > 0 ? (
                      <>
                        {displayedReviews.map((review, i) => (
                          <div key={review.id || i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {renderStars(review.rating || 0)}
                                <span className="text-sm font-semibold text-slate-900">{review.title || 'Student Review'}</span>
                              </div>
                              <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="text-slate-500 text-xs mb-2">
                              <span className="font-medium text-slate-700">{review.user?.name || 'Anonymous Student'}</span>
                              {' • '}{review.classYear || review.user?.graduationYear || currentYear}
                              {' • '}{review.major || review.user?.major || 'Student'}
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed mb-3">
                              {review.content || review.tips || 'No review content available.'}
                            </p>
                            {(review.pros?.length > 0 || review.cons?.length > 0) && (
                              <div className="text-slate-700 text-xs mt-3 pt-3 border-t border-slate-100">
                                {review.pros?.length > 0 && (
                                  <div className="mb-1">
                                    <span className="font-semibold text-emerald-600">Pros:</span> {review.pros.join(', ')}
                                  </div>
                                )}
                                {review.cons?.length > 0 && (
                                  <div>
                                    <span className="font-semibold text-rose-600">Cons:</span> {review.cons.join(', ')}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {reviews.length > 3 && (
                          <button
                            onClick={() => setShowAllReviews(!showAllReviews)}
                            className="text-indigo-600 text-sm font-bold hover:text-indigo-700 transition-colors flex items-center gap-1 mt-2"
                          >
                            {showAllReviews ? 'Show less reviews' : `See all ${reviews.length} reviews`}
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-slate-100">
                        <MessageSquare size={48} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No reviews available yet for this university.</p>
                        <Link to={`/write-review/${university.id}`} className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                          Be the first to review
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Sidebar */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Contact Information with Map */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-indigo-600" />
                Contact & Location
              </h3>
              
              {hasLocationLink && mapEmbedUrl ? (
                <div className="mb-4 rounded-xl overflow-hidden border border-slate-200">
                  <iframe
                    title="University Location Map"
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapEmbedUrl}
                  />
                </div>
              ) : (
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500 text-center">
                  🗺️ Map will appear here once a valid location link is added.
                </div>
              )}

              <div className="space-y-3 text-sm mb-4">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-600">{addressText || 'Coimbatore, Tamil Nadu'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-slate-400" />
                  <span className="text-slate-600">{university?.phone || ratingsMetadata.phone || 'Not available'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-slate-600">{university?.email || ratingsMetadata.email || 'Not available'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-slate-400" />
                  <a href={university?.website || ratingsMetadata.website ? `https://${(university?.website || ratingsMetadata.website).replace(/^https?:\/\//, '')}` : '#'} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                    {university?.website || ratingsMetadata.website || 'Not available'}
                  </a>
                </div>
              </div>
              
              <div className="flex gap-3">
                {hasLocationLink ? (
                  <>
                    <button 
                      onClick={openDirections}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Navigation size={14} />
                      Get Directions
                    </button>
                    <button 
                      onClick={openGoogleMaps}
                      className="flex-1 px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} />
                      View Map
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="flex-1 px-4 py-2 bg-slate-200 text-slate-500 rounded-lg text-sm font-bold cursor-not-allowed"
                  >
                    Location link not available
                  </button>
                )}
              </div>
            </div>

            {/* Fast Facts */}
            <div className="bg-slate-800 rounded-xl p-5 text-white">
              <h3 className="text-base font-black mb-4">Fast Facts</h3>
              <div className="space-y-3">
                {fastFacts.map((fact, i) => (
                  <div key={i} className="flex justify-between items-center pb-2 border-b border-slate-700 last:border-0">
                    <span className="text-xs text-slate-300">{fact.label}</span>
                    <span className="text-sm font-bold text-white">{fact.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Write a Review CTA */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
              <h3 className="text-base font-black mb-2">Share Your Experience</h3>
              <p className="text-xs text-indigo-100 mb-4">Help other students make informed decisions</p>
              <Link 
                to={`/write-review/${university.id}`}
                className="block text-center px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-all"
              >
                Write a Review →
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}