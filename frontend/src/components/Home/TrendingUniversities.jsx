import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ChevronRight, Award, MapPin, Star, School } from 'lucide-react';

export default function TrendingUniversities({ loading, trendingColleges, onNavigate }) {
  return (
    <section className="py-10 bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={16} className="text-indigo-600" />
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Trending Now</span>
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900">Most Popular Universities</h2>
          </div>
          <button
            onClick={() => onNavigate('/colleges')}
            className="px-4 py-1.5 bg-white text-slate-700 font-bold rounded-lg flex items-center gap-1.5 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs shadow-sm border border-slate-200"
          >
            Search <ChevronRight size={12} />
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
        ) : trendingColleges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {trendingColleges.slice(0, 3).map((college, i) => (
              <motion.div
                key={college.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                onClick={() => onNavigate(`/university/${college.id}`)}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer border border-slate-100"
              >
                <div className="relative h-36 overflow-hidden bg-slate-100">
                  {college.image ? (
                    <img src={college.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={college.name} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <School size={40} className="text-indigo-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="bg-white/95 backdrop-blur px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-slate-800">#{i + 1}</span>
                  </div>
                  {college.rating && (
                    <div className="absolute top-2 right-2 bg-amber-500/90 backdrop-blur px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Star size={8} fill="white" className="text-white" />
                      <span className="text-[9px] font-bold text-white">{college.rating}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-slate-900 text-sm mb-0.5 line-clamp-1">{college.name}</h3>
                  <div className="flex items-center gap-1 text-slate-500 text-[10px] mb-2"><MapPin size={9} /> {college.location || 'India'}</div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[9px] font-bold">
                      <span className="text-slate-500">{college.students}</span>
                      <span className="text-indigo-600">{college.netPrice}</span>
                    </div>
                    <Award size={12} className="text-slate-300 group-hover:text-indigo-500 transition" />
                  </div>
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
  );
}
