import React from 'react';
import { Search, X, Command, School, ArrowRight, MapPin, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Helper function to get logo URL
const getCollegeLogo = (college) => {
  if (college.logoUrl && college.logoUrl !== '') return college.logoUrl;
  if (college.imageUrl && college.imageUrl !== '') return college.imageUrl;
  if (college.image && college.image !== '') return college.image;
  if (college.images && college.images.length > 0) return college.images[0];
  return null;
};

export default function HomeHeroSection({
  searchQuery,
  suggestions,
  showSuggestions,
  onSearchChange,
  onSearchKeyPress,
  onInputFocus,
  onSuggestionClick,
  onViewAllResults,
  resetSearch,
  closeSuggestions,
  searchRef
}) {
  return (
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
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={onSearchKeyPress}
                onFocus={onInputFocus}
                className="w-full h-12 pl-11 pr-12 bg-gradient-to-r from-indigo-50 via-white to-purple-50 rounded-xl shadow-lg shadow-indigo-200/50 border-2 border-indigo-300 font-bold text-slate-800 placeholder:text-indigo-400 placeholder:font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-400/50 focus:border-indigo-500 transition-all text-sm relative z-10"
                style={{ caretColor: '#4f46e5' }}
              />
              {searchQuery && (
                <button
                  onClick={resetSearch}
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
                    {suggestions.map((college) => {
                      const logoUrl = getCollegeLogo(college);
                      // Get location - only show if exists, no fallback
                      const location = college.location || college.city;
                      
                      return (
                        <button
                          key={college.id}
                          onClick={() => {
                            onSuggestionClick(college);
                          }}
                          className="w-full flex items-start gap-4 px-5 py-4 hover:bg-indigo-50 transition-all border-b border-slate-100 last:border-0 group text-left"
                        >
                          {/* Logo Section - Shows actual college logo */}
                          <div className="item-logo-wrapper">
                            {logoUrl ? (
                              <img 
                                src={logoUrl} 
                                alt={college.name}
                                className="item-logo-img"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="item-logo-fallback">🏛️</div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="item-logo-fallback">🏛️</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors break-words mb-1">
                              {college.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                              {location && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                  <MapPin size={12} /> {location}
                                </span>
                              )}
                              {college.rating && college.rating > 0 && (
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
                      );
                    })}
                  </div>
                  <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        closeSuggestions();
                        onViewAllResults();
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

      {/* Add required styles */}
      <style jsx>{`
        .item-logo-wrapper {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 12px;
          overflow: hidden;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }
        .item-logo-fallback {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          border-radius: 12px;
        }
      `}</style>
    </section>
  );
}