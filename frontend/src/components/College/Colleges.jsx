import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Star, Search, Filter, SlidersHorizontal, 
  Grid3x3, List, School, Users, Building2, GraduationCap,
  ChevronDown, ChevronUp, X, ArrowRight, BookOpen, Award,
  TrendingUp, Heart, Sparkles, CheckCircle
} from 'lucide-react';
import { api } from '../services/api';

const Colleges = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Get search param from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

  // Fetch colleges from API
  useEffect(() => {
    const fetchColleges = async () => {
      setLoading(true);
      try {
        const response = await api.getUniversities({ limit: 100 });
        
        if (response && response.data && response.data.length > 0) {
          const transformedData = response.data.map(college => ({
            id: college.id || college._id,
            name: college.name,
            location: college.location || college.city || 'India',
            city: college.city || college.location?.split(',')[0] || 'India',
            type: college.type || college.category || 'University',
            rating: college.rating || 4.0,
            reviews: college.reviewCount || college.reviews?.length || 0,
            acceptanceRate: college.acceptanceRate ? `${college.acceptanceRate}%` : 'N/A',
            netPrice: college.tuitionFee ? `₹${college.tuitionFee}` : 'N/A',
            description: college.description || college.about || 'A premier institution dedicated to academic excellence.',
            image: college.imageUrl || college.images?.[0] || '',
            students: college.studentCount ? `${college.studentCount.toLocaleString()}+` : 'N/A',
            category: college.category || 'University'
          }));
          
          setColleges(transformedData);
          setFilteredColleges(transformedData);
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  // Filter colleges based on search
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = colleges.filter(college =>
        college.name?.toLowerCase().includes(term) ||
        college.location?.toLowerCase().includes(term) ||
        college.city?.toLowerCase().includes(term)
      );
      setFilteredColleges(filtered);
    } else {
      setFilteredColleges(colleges);
    }
  }, [searchTerm, colleges]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Loading colleges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      
      {/* Hero Section with Centered Search */}
      <div className="relative bg-gradient-to-r from-indigo-700 to-purple-700 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-[11px] font-bold mb-4">
              <Sparkles size={12} /> {filteredColleges.length} Colleges Available
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3">
              Find Your Perfect College
            </h1>
            <p className="text-indigo-100 text-base max-w-2xl mx-auto mb-8">
              Discover top institutions across India based on your preferences
            </p>
            
            {/* Centered Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by college name, location, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-white rounded-2xl text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-300/50 shadow-xl"
              />
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#f8fafc" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <School size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">All Colleges</h2>
              <p className="text-sm text-slate-500">{filteredColleges.length} institutions found</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Grid3x3 size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-6 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-sm text-indigo-700">
              <strong>{filteredColleges.length}</strong> results found for “
              <strong>{searchTerm}</strong>”
            </p>
          </div>
        )}

        {/* Colleges Grid/List View */}
        {filteredColleges.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <School size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No colleges found</h3>
            <p className="text-slate-500 text-sm mb-4">Try adjusting your search term</p>
            <button onClick={() => setSearchTerm('')} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
              Clear Search
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((college, index) => (
              <motion.div
                key={college.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 9) * 0.05 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/university/${college.id}`)}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img 
                    src={college.image} 
                    alt={college.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm">
                      <span className="text-[10px] font-black text-slate-800">#{index + 1}</span>
                    </div>
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-amber-500/95 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <Star size={10} fill="white" className="text-white" />
                      <span className="text-[10px] font-bold text-white">{college.rating}</span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {college.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
                    <MapPin size={12} /> {college.location}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-full text-slate-600 font-medium">{college.type}</span>
                    <span className="text-[10px] px-2 py-1 bg-emerald-50 rounded-full text-emerald-700 font-medium">Acc: {college.acceptanceRate}</span>
                  </div>
                  
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
                    {college.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-indigo-600">{college.netPrice}</span>
                      <span className="text-[10px] text-slate-400">/year</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                      <Users size={12} />
                      <span>{college.students}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredColleges.map((college, index) => (
              <motion.div
                key={college.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ x: 4 }}
                onClick={() => navigate(`/university/${college.id}`)}
                className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex gap-5">
                  <div className="w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <img src={college.image} alt={college.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-lg">{college.name}</h3>
                          <div className="flex items-center gap-0.5">
                            <Star size={14} fill="#f59e0b" className="text-amber-500" />
                            <span className="text-sm font-bold text-slate-700">{college.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} /> {college.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-indigo-600">{college.netPrice}</div>
                        <div className="text-[10px] text-slate-400">per year</div>
                      </div>
                    </div>
                    
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2">{college.description}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-full text-slate-600">{college.type}</span>
                      <span className="text-[10px] text-slate-500">Acceptance: {college.acceptanceRate}</span>
                      <span className="text-[10px] text-slate-500">{college.reviews.toLocaleString()} reviews</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* View All Button to go back home */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Colleges;