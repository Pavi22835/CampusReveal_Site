import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Star, Share2, Heart, ShieldCheck, Users, 
  GraduationCap, Building2, Globe, Sparkles, BookOpen, Clock,
  ArrowRight, ExternalLink, ChevronRight, MessageSquare,
  CheckCircle, XCircle, Plus, Minus, Zap, Wifi, Dumbbell,
  Library, Bus, Utensils, Coffee, Award, TrendingUp, Calendar,
  Mail, Phone, Linkedin, Twitter, Facebook, Computer, Navigation,
  DollarSign, Home, Video, Heart as HeartIcon
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

  // Get gallery images from university data
  const galleryImages = Array.from(new Set([
    ...(university?.images || []),
    university?.imageUrl,
    university?.image
  ].filter(Boolean)));

  const galleryDisplay = galleryImages.length > 0 ? galleryImages.slice(0, 4) : [];

  // Get facilities list
  const facilityList = university?.campusFacilities?.length
    ? university.campusFacilities
    : [];

  // Get academic streams
  const academicStreams = university?.academicStreams || [];
  const academicLevels = university?.academicLevels || [];
  const departments = university?.departments || [];
  const offeredCourses = university?.offeredCourses || [];

  // Get mission and vision
  const mission = university?.mission;
  const vision = university?.vision;

  // Get placement data
  const placementRate = university?.placementRate;
  const averagePackage = university?.averagePackage;
  const highestPackage = university?.highestPackage;
  const topRecruiters = university?.topRecruiters;

  // Get fees data
  const tuitionFee = university?.tuitionFee;
  const hostelFee = university?.hostelFee;
  const scholarshipAvailable = university?.scholarshipAvailable;

  // Get contact info
  const website = university?.website;
  const phone = university?.phone;
  const email = university?.email;
  const instagram = university?.instagram;
  const linkedin = university?.linkedin;
  const facebook = university?.facebook;
  const youtube = university?.youtube;

  // Get location info
  const addressText = university?.location || [university?.city, university?.state].filter(Boolean).join(', ');
  const locationLink = university?.googleMapsLink || '';
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

  // Verdict Categories
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

  // Overview highlights
  const overviewHighlights = [
    university?.naacGrade ? `🏆 NAAC ${university.naacGrade} Grade` : null,
    placementRate ? `💼 Placement Rate: ${placementRate}` : null,
    university?.facultyCount ? `👨‍🏫 ${university.facultyCount} Faculty Members` : null,
    university?.established ? `📍 Established ${university.established}` : null,
    university?.category ? `🎓 Category: ${university.category}` : null,
    university?.type ? `🏛️ Type: ${university.type}` : null,
    academicStreams.length > 0 ? `📚 Streams: ${academicStreams.slice(0, 3).join(', ')}${academicStreams.length > 3 ? '...' : ''}` : null,
    scholarshipAvailable ? '💰 Scholarships Available' : null,
    university?.hostelAvailable ? '🏠 Hostel Available' : null,
    university?.transportAvailable ? '🚌 Transport Available' : null
  ].filter(Boolean);

  // Fast Facts
  const fastFacts = [
    { label: 'Established', value: university?.established || 'N/A' },
    { label: 'Type', value: university?.type || 'N/A' },
    { label: 'NAAC Grade', value: university?.naacGrade || 'N/A' },
    { label: 'Approved By', value: university?.approvedBy || 'N/A' },
    { label: 'Affiliation', value: university?.affiliation || 'N/A' },
    { label: 'Total Students', value: university?.studentCount ? university.studentCount.toLocaleString() : 'N/A' },
    { label: 'Total Faculty', value: university?.facultyCount ? university.facultyCount.toLocaleString() : 'N/A' },
    { label: 'Placement Rate', value: placementRate || 'N/A' },
    { label: 'Average Package', value: averagePackage || 'N/A' },
    { label: 'Highest Package', value: highestPackage || 'N/A' },
    { label: 'Tuition Fee', value: tuitionFee || 'N/A' },
    { label: 'Hostel Fee', value: hostelFee || 'N/A' }
  ];

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
        setOverallRating(uniResult.data.rating || 0);
      } else {
        setError(uniResult.message || 'University not found');
      }

      try {
        const reviewsResult = await api.getReviews(id);
        
        let reviewsData = [];
        if (reviewsResult && reviewsResult.success && Array.isArray(reviewsResult.data)) {
          reviewsData = reviewsResult.data;
        } else if (reviewsResult && Array.isArray(reviewsResult)) {
          reviewsData = reviewsResult;
        }
        
        setReviews(reviewsData);
        
        if (reviewsData.length > 0) {
          calculateAverageRatings(reviewsData);
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

  const openGoogleMaps = () => {
    window.open(mapLinkUrl, '_blank');
  };

  const openDirections = () => {
    const destination = encodeURIComponent(addressText);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  // Helper function to get facility icon
  const getFacilityIcon = (facility) => {
    const icons = {
      library: <Library size={18} />,
      canteen: <Utensils size={18} />,
      wifi: <Wifi size={18} />,
      sports: <Dumbbell size={18} />,
      gym: <HeartIcon size={18} />,
      labs: <Computer size={18} />,
      auditorium: <Video size={18} />,
      parking: <MapPin size={18} />,
      smartClassrooms: <Video size={18} />
    };
    return icons[facility] || <CheckCircle size={18} />;
  };

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
              {university.shortName && <span className="text-lg text-slate-400 ml-2">({university.shortName})</span>}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-slate-500">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-rose-500" />
                <span className="text-sm font-medium">{addressText || 'Location not specified'}</span>
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
                <span className="text-sm font-medium text-slate-600">Est. {university.established || 'N/A'}</span>
              </div>
              {university.naacGrade && (
                <>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <div className="flex items-center gap-1">
                    <Award size={16} className="text-emerald-500" />
                    <span className="text-sm font-medium text-slate-600">NAAC {university.naacGrade}</span>
                  </div>
                </>
              )}
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
                { icon: GraduationCap, label: 'Total Faculty', value: university?.facultyCount ? university.facultyCount.toLocaleString() : 'N/A' },
                { icon: TrendingUp, label: 'Placement Rate', value: placementRate || 'N/A' },
                { icon: Building2, label: 'Category', value: university?.category || university?.type || 'N/A' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm border border-slate-100">
                  <stat.icon size={22} className="text-indigo-600 mx-auto mb-2" />
                  <div className="text-lg font-black text-slate-800">{stat.value}</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </section>

            {/* Student Verdict Section - RESTORED */}
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
              {['Overview', 'Academics', 'Facilities', 'Placements', 'Fees', 'Reviews'].map((tab) => (
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
                    {/* Description */}
                    {university.description && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-3">About</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">{university.description}</p>
                      </div>
                    )}

                    {/* Mission & Vision */}
                    {(mission || vision) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {mission && (
                          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                              <Sparkles size={18} className="text-indigo-500" />
                              Mission
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-sm">{mission}</p>
                          </div>
                        )}
                        {vision && (
                          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                              <Zap size={18} className="text-amber-500" />
                              Vision
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-sm">{vision}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Key Highlights */}
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

                {activeTab === 'Academics' && (
                  <div className="space-y-6">
                    {/* Academic Streams & Levels */}
                    {(academicStreams.length > 0 || academicLevels.length > 0) && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Academic Structure</h3>
                        {academicStreams.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-semibold text-slate-700 block mb-2">Academic Streams:</span>
                            <div className="flex flex-wrap gap-2">
                              {academicStreams.map(stream => (
                                <span key={stream} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                                  {stream}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {academicLevels.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-semibold text-slate-700 block mb-2">Academic Levels:</span>
                            <div className="flex flex-wrap gap-2">
                              {academicLevels.map(level => (
                                <span key={level} className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
                                  {level}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Departments */}
                    {departments.length > 0 && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Departments</h3>
                        <div className="flex flex-wrap gap-2">
                          {departments.map(dept => (
                            <span key={dept} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                              {dept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Courses Offered */}
                    {offeredCourses.length > 0 && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Courses Offered</h3>
                        <div className="flex flex-wrap gap-2">
                          {offeredCourses.map(course => (
                            <span key={course} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specializations */}
                    {university?.specializations && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Specializations</h3>
                        <p className="text-slate-600 text-sm">{university.specializations}</p>
                      </div>
                    )}

                    {/* Approval & Affiliation */}
                    {(university?.affiliation || university?.approvedBy) && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Accreditation Details</h3>
                        {university.affiliation && (
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-slate-700">Affiliation:</span>
                            <p className="text-slate-600 text-sm mt-1">{university.affiliation}</p>
                          </div>
                        )}
                        {university.approvedBy && (
                          <div>
                            <span className="text-sm font-semibold text-slate-700">Approved By:</span>
                            <p className="text-slate-600 text-sm mt-1">{university.approvedBy}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Facilities' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 mb-4">Campus Facilities</h3>
                    
                    {/* Campus Facilities Grid */}
                    {facilityList.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {facilityList.map((facility, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            {getFacilityIcon(facility)}
                            <span className="text-sm font-medium text-slate-700">
                              {facility.charAt(0).toUpperCase() + facility.slice(1).replace(/([A-Z])/g, ' $1')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hostel Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      {university.hostelAvailable && (
                        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                          <Home size={18} className="text-indigo-600" />
                          <div>
                            <div className="text-sm font-bold text-slate-800">Hostel Available</div>
                            {university.hostelType && <div className="text-xs text-slate-500">{university.hostelType}</div>}
                          </div>
                        </div>
                      )}
                      {university.transportAvailable && (
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                          <Bus size={18} className="text-emerald-600" />
                          <div>
                            <div className="text-sm font-bold text-slate-800">Transport Available</div>
                            <div className="text-xs text-slate-500">Campus bus service</div>
                          </div>
                        </div>
                      )}
                      {scholarshipAvailable && (
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                          <Award size={18} className="text-amber-600" />
                          <div>
                            <div className="text-sm font-bold text-slate-800">Scholarships Available</div>
                            <div className="text-xs text-slate-500">Financial aid options</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {facilityList.length === 0 && !university.hostelAvailable && !university.transportAvailable && !scholarshipAvailable && (
                      <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-sm text-center">
                        No facilities data available.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Placements' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                      <h3 className="text-lg font-black text-slate-800 mb-4">Placement Statistics</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {placementRate && (
                          <div className="text-center p-4 bg-indigo-50 rounded-xl">
                            <div className="text-2xl font-black text-indigo-600">{placementRate}</div>
                            <div className="text-xs text-slate-500 mt-1">Placement Rate</div>
                          </div>
                        )}
                        {averagePackage && (
                          <div className="text-center p-4 bg-emerald-50 rounded-xl">
                            <div className="text-2xl font-black text-emerald-600">{averagePackage}</div>
                            <div className="text-xs text-slate-500 mt-1">Average Package</div>
                          </div>
                        )}
                        {highestPackage && (
                          <div className="text-center p-4 bg-amber-50 rounded-xl">
                            <div className="text-2xl font-black text-amber-600">{highestPackage}</div>
                            <div className="text-xs text-slate-500 mt-1">Highest Package</div>
                          </div>
                        )}
                      </div>

                      {topRecruiters && (
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-3">Top Recruiters</h4>
                          <div className="flex flex-wrap gap-2">
                            {topRecruiters.split(',').map((recruiter, i) => (
                              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                {recruiter.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'Fees' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black text-slate-800 mb-4">Fee Structure</h3>
                    <div className="space-y-4">
                      {tuitionFee && (
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm font-semibold text-slate-700">Tuition Fee (per year)</span>
                          <span className="text-lg font-black text-indigo-600">{tuitionFee}</span>
                        </div>
                      )}
                      {hostelFee && (
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm font-semibold text-slate-700">Hostel Fee (per year)</span>
                          <span className="text-lg font-black text-indigo-600">{hostelFee}</span>
                        </div>
                      )}
                      {!tuitionFee && !hostelFee && (
                        <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-sm text-center">
                          Fee information not available.
                        </div>
                      )}
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
                                    <span className="font-semibeld text-emerald-600">Pros:</span> {review.pros.join(', ')}
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
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 sticky top-24">
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-indigo-600" />
                Contact & Location
              </h3>
              
              {hasLocationLink && mapEmbedUrl ? (
                <div className="mb-4 rounded-xl overflow-hidden border border-slate-200">
                  <iframe
                    title="University Location Map"
                    width="100%"
                    height="180"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={mapEmbedUrl}
                  />
                </div>
              ) : (
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 text-center">
                  🗺️ Map will appear here once a valid location link is added.
                </div>
              )}

              <div className="space-y-3 text-sm mb-4">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-600">{addressText || 'Location not specified'}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-slate-400" />
                    <a href={`tel:${phone}`} className="text-slate-600 hover:text-indigo-600">{phone}</a>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-400" />
                    <a href={`mailto:${email}`} className="text-slate-600 hover:text-indigo-600 break-all">{email}</a>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-slate-400" />
                    <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                      {website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
              
              {/* Social Media Links */}
              {(instagram || linkedin || facebook || youtube) && (
                <div className="mb-4 pt-2 border-t border-slate-100">
                  <div className="flex gap-3 justify-center">
                    {instagram && (
                      <a href={instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      </a>
                    )}
                    {linkedin && (
                      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                        <Linkedin size={16} />
                      </a>
                    )}
                    {facebook && (
                      <a href={facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
                        <Facebook size={16} />
                      </a>
                    )}
                    {youtube && (
                      <a href={youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
              
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