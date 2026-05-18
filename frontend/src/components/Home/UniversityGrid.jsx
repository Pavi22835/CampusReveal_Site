import React from 'react';
import { Heart, School } from 'lucide-react';
import CollegeCard from '../CollegeCard/CollegeCard.jsx';

export default function UniversityGrid({
  loading,
  searchQuery,
  allColleges,
  displayColleges,
  clearAllFilters,
  activeFilters,
  streamOptions,
  levelOptions
}) {
  const hasProfileSelection = activeFilters.stream || activeFilters.level || activeFilters.department || activeFilters.course;

  return (
    <div className="lg:col-span-9">
      {hasProfileSelection && (
        <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-2 flex-wrap">
            <Heart size={14} className="text-indigo-600" />
            <span className="text-xs font-medium text-slate-600">Showing results for:</span>
            {activeFilters.stream && <span className="px-2 py-0.5 bg-white rounded-full text-[10px] font-bold text-indigo-600 shadow-sm">{streamOptions.find(s => s.id === activeFilters.stream)?.name}</span>}
            {activeFilters.level && <span className="px-2 py-0.5 bg-white rounded-full text-[10px] font-bold text-indigo-600 shadow-sm">{levelOptions.find(l => l.id === activeFilters.level)?.name}</span>}
            {activeFilters.department && <span className="px-2 py-0.5 bg-white rounded-full text-[10px] font-bold text-indigo-600 shadow-sm">{activeFilters.department}</span>}
            {activeFilters.course && <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold shadow-sm">{activeFilters.course}</span>}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
      ) : (
        <>
          {searchQuery && displayColleges.length > 0 && (
            <div className="mb-3 text-xs text-slate-500">
              Found {allColleges.length} result{allColleges.length !== 1 ? 's' : ''} for "{searchQuery}"
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayColleges.map((college, i) => (
              <CollegeCard key={college.id} college={college} index={i} />
            ))}
          </div>

          {displayColleges.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <School size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm font-medium">No colleges found matching your criteria</p>
              <button onClick={clearAllFilters} className="mt-3 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition">Clear Filters</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
