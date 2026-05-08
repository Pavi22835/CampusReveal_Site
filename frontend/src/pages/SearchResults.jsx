import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Star,
  ChevronRight,
  Search,
  X,
  Filter,
  LayoutGrid,
  List,
  SlidersHorizontal,
  BookOpen,
  ArrowRight,
  Landmark,
  Compass,
  Target,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';

const FILTER_TYPES = ['4-year', '2-year', 'Private', 'Public', 'Community', 'Trade', 'Other'];
const AREA_OPTIONS = ['Engineering', 'Design', 'Business', 'Arts & Science', 'STEM'];

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('q') || '';
  const initialLocation = params.get('location') || '';

  const [searchText, setSearchText] = useState(initialQuery);
  const [locationText, setLocationText] = useState(initialLocation);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedArea, setSelectedArea] = useState('Any');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const query = [searchText, locationText].filter(Boolean).join(' ');

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (query.length > 0) params.search = query;
        params.limit = 50;

        const response = await api.getUniversities(params);
        if (response.success) {
          setResults(response.data.map((uni) => ({
            ...uni,
            image: uni.imageUrl || uni.images?.[0] || '',
            type: uni.type || uni.ratings?.metadata?.type || 'Unknown',
            category: uni.category || uni.ratings?.metadata?.category || '',
          })));
        } else {
          setError(response.error || 'Unable to load universities.');
        }
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load universities.');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, [query]);

  const visibleResults = useMemo(() => {
    return results.filter((uni) => {
      const matchesType = selectedTypes.length ? selectedTypes.some(t => uni.type?.includes(t)) : true;
      const matchesArea = selectedArea !== 'Any' ? uni.category?.includes(selectedArea) : true;
      return matchesType && matchesArea;
    });
  }, [results, selectedTypes, selectedArea]);

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#fbfcff]">
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header Section */}
        <section className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <span className="bg-slate-950 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-5 inline-block shadow-lg">
                Registry Explorer
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-black text-slate-950 tracking-tighter leading-tight">
                Academic <span className="text-indigo-600">Frontiers</span>
              </h1>
              <p className="text-slate-500 font-bold mt-3 uppercase text-xs tracking-widest">Scanning {visibleResults.length} validated institutions</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-xl border border-slate-100 flex shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  <List size={18} />
                </button>
              </div>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border ${
                  isFilterOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-600 shadow-sm'
                }`}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>
          </motion.div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.aside 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="w-full lg:w-72 space-y-6"
              >
                <div className="bg-white rounded-[3rem] border-[3px] border-slate-950 shadow-2xl shadow-indigo-100/50 overflow-hidden relative">
                  <div className="bg-slate-950 px-10 py-10 relative">
                    <div className="flex items-center justify-between mb-3">
                       <h3 className="font-black text-sm uppercase tracking-[0.25em] text-white flex items-center gap-4">
                         <Filter size={22} className="text-indigo-400 stroke-[4]" /> Registry Filters
                       </h3>
                    </div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Global Database Control</p>
                  </div>
                  
                  <div className="p-10 space-y-12 relative z-10">
                    <div className="space-y-6">
                      <label className="text-[12px] font-black text-slate-950 uppercase tracking-[0.15em] px-1">Institution Search</label>
                      <div className="relative">
                        <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 stroke-[3]" />
                        <input 
                          type="text" 
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          placeholder="Ex: PSG Tech"
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] text-base font-black placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 focus:bg-white transition-all uppercase tracking-tight"
                        />
                      </div>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-6">
                      <label className="text-[12px] font-black text-slate-950 uppercase tracking-[0.15em] px-1">Institutional Sector</label>
                      <div className="flex flex-wrap gap-3">
                        {FILTER_TYPES.map(type => (
                          <button
                            key={type}
                            onClick={() => handleTypeToggle(type)}
                            className={`px-6 py-4 rounded-2xl text-xs font-black border-2 transition-all uppercase tracking-widest ${
                              selectedTypes.includes(type) 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200' 
                                : 'bg-white border-slate-200 text-slate-800 hover:border-slate-950 hover:bg-slate-50'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Area Filter */}
                    <div className="space-y-6">
                      <label className="text-[12px] font-black text-slate-950 uppercase tracking-[0.15em] px-1">Academic Discipline</label>
                      <div className="relative">
                        <select 
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          className="w-full py-5 px-8 bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] text-sm font-black text-slate-950 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 appearance-none cursor-pointer uppercase tracking-widest"
                        >
                          <option value="Any">All Disciplines</option>
                          {AREA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <ChevronDown size={22} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-950 pointer-events-none stroke-[4]" />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setSearchText('');
                        setSelectedTypes([]);
                        setSelectedArea('Any');
                      }}
                      className="w-full py-6 text-xs font-black text-rose-600 uppercase tracking-[0.3em] hover:text-rose-700 transition-all border-2 border-transparent hover:border-rose-100 rounded-2xl underline underline-offset-[12px]"
                    >
                      Reset All Parameters
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white premium-shadow">
                  <BookOpen size={24} className="text-indigo-400 mb-6" />
                  <h3 className="text-xl font-black mb-2">Need Guidance?</h3>
                  <p className="text-white/60 text-sm font-medium mb-6 leading-relaxed">Book a session with our verified academic consultants.</p>
                  <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 group">
                    Find a Mentor <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Results Grid */}
          <motion.div 
            layout
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`flex-1 grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
          >
            {error && (
              <div className="col-span-full py-4 text-center text-rose-600 font-semibold">
                {error}
              </div>
            )}
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-500">
                Loading institutions...
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {visibleResults.map((uni) => (
                <motion.div
                  key={uni.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => navigate(`/university/${uni.id}`)}
                  className={`bg-white group cursor-pointer border border-slate-100 hover:border-indigo-200 transition-all duration-500 ${
                    viewMode === 'grid' ? 'rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50' : 'rounded-3xl flex flex-col md:flex-row p-6'
                  }`}
                >
                  <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-64' : 'h-48 md:w-64 rounded-2xl shrink-0'}`}>
                    <img 
                      src={uni.image} 
                      alt={uni.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 left-4">
                      <span className="glass-dark text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {uni.type}
                      </span>
                    </div>
                  </div>

                  <div className={`p-8 flex flex-col justify-between flex-1 ${viewMode === 'list' ? 'h-full py-0' : ''}`}>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5 text-yellow-500">
                          <Star size={14} className="fill-yellow-500" />
                          <span className="font-black text-sm">{uni.rating}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{uni._count.reviews} Reviews</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
                        {uni.name}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">
                        <MapPin size={14} className="text-indigo-500" />
                        {uni.location}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-8">
                        {uni.category?.split(', ').slice(0, 2).map(cat => (
                          <span key={cat} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tight ring-1 ring-slate-100">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Median</span>
                        <span className="text-emerald-600 font-black">{uni.medianSalary}</span>
                      </div>
                      <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white group-hover:bg-indigo-600 transition-all duration-500 group-hover:translate-x-1">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>)}

            {visibleResults.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Compass size={40} className="text-slate-200 animate-spin-slow" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Expanding Frontiers...</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">We couldn't find matches for your current parameters. Try widening your search or resetting filters.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
