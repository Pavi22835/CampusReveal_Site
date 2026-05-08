import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Plus, ExternalLink, ArrowRight, 
  ChevronRight, BarChart3, Scale, Info,
  Trophy, Globe, Users, GraduationCap
} from 'lucide-react';
import { api } from '../services/api';

export default function Compare() {
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableColleges, setAvailableColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const result = await api.getUniversities();
      if (result.success && result.data) setAvailableColleges(result.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCollege = (college) => {
    if (selectedColleges.length < 3 && !selectedColleges.find(c => c.id === college.id)) {
      setSelectedColleges([...selectedColleges, college]);
      setShowSearch(false);
    }
  };

  const removeCollege = (id) => setSelectedColleges(selectedColleges.filter(c => c.id !== id));

  const filteredColleges = availableColleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const metrics = [
    { label: 'Overall Prestige', key: 'rating', icon: Trophy, format: (v) => `★ ${v || 4.5}` },
    { label: 'Global Acceptance', key: 'acceptanceRate', icon: Globe, format: (v) => `${v || 15}%` },
    { label: 'Annual Investment', key: 'tuitionFee', icon: BarChart3, format: (v) => `$${(v || 45000).toLocaleString()}` },
    { label: 'Total Enrollment', key: 'studentCount', icon: Users, format: (v) => (v || 8500).toLocaleString() },
  ];

  return (
    <div className="min-h-screen bg-[#fbfcff] pb-32">
      
      <main className="max-w-7xl mx-auto px-6 pt-32">
        <header className="mb-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ring-1 ring-indigo-100"
          >
            <Scale size={14} /> Decision Matrix
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 tracking-tight leading-[0.85] mb-6">
            Institutional <span className="text-gradient">Versus.</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            A surgical side-by-side analysis of academic rigor, investment requirements, and cultural impact.
          </p>
        </header>

        {/* Selected View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 relative">
          <AnimatePresence mode="popLayout">
            {selectedColleges.map((college, i) => (
              <motion.div
                key={college.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative group"
              >
                <button 
                  onClick={() => removeCollege(college.id)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 font-black text-3xl mb-8 shadow-xl shadow-indigo-100/20 group-hover:scale-110 transition-transform">
                    {college.name.charAt(0)}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 line-clamp-1">{college.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">{college.city || 'Primary Campus'}</p>
                  
                  <div className="w-full space-y-6 pt-8 border-t border-slate-50">
                    {metrics.map(metric => (
                      <div key={metric.key} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                            <metric.icon size={14} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{metric.label}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900">{metric.format(college[metric.key])}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => navigate(`/university/${college.id}`)}
                    className="w-full mt-10 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                  >
                    Deep Dive <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}

            {selectedColleges.length < 3 && (
              <motion.button
                layout
                onClick={() => setShowSearch(true)}
                className="bg-[#fbfcff] border-2 border-dashed border-slate-200 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 hover:border-indigo-400 hover:bg-white transition-all group min-h-[500px]"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:scale-110 transition-all border border-slate-50">
                  <Plus size={32} />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Add Comparison</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Global Search Overlay */}
        <AnimatePresence>
          {showSearch && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSearch(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-70 overflow-hidden"
              >
                <header className="p-10 pb-0 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Institutional Database</h2>
                    <p className="text-slate-500 font-medium text-sm">Select a verified institution to add to matrix.</p>
                  </div>
                  <button onClick={() => setShowSearch(false)} className="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={20} />
                  </button>
                </header>
                
                <div className="p-10 space-y-8">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Search names, cities, or academic domains..." 
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[1.5rem] text-lg font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-600 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                    {filteredColleges.map(college => (
                      <button
                        key={college.id}
                        onClick={() => addCollege(college)}
                        className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-indigo-600 rounded-2xl transition-all group group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100">
                            {college.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600">{college.name}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{college.city || 'Tamil Nadu'}</div>
                          </div>
                        </div>
                        <Plus size={20} className="text-slate-300 group-hover:text-indigo-600" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
