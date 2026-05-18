import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  BookOpen,
  GraduationCap as GraduationIcon,
  Building2,
  Layers,
  MapPin as MapPinIcon,
  Building,
  Bus,
  Star,
  SlidersHorizontal
} from 'lucide-react';

function FilterSection({ label, Icon, isOpen, onToggle, children }) {
  return (
    <div className="filter-section">
      <button onClick={onToggle} className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-indigo-500" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">{label}</span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {isOpen && children}
    </div>
  );
}

export default function FilterSidebar({
  expandedSections,
  toggleSection,
  activeFilters,
  streamOptions,
  levelOptions,
  availableDepartments,
  availableCourses,
  locationOptions,
  transportOptions,
  ratings,
  handleStreamChange,
  handleLevelChange,
  handleDepartmentChange,
  handleCourseChange,
  handleSearchChange,
  setActiveFilters,
  hasActiveFilters,
  clearAllFilters,
  searchQuery
}) {
  // ✅ Dynamic location options - No hardcoded fallback
  const displayLocationOptions = locationOptions && locationOptions.length > 0 
    ? locationOptions 
    : ['All Regions'];

  // ✅ Dynamic transport options
  const displayTransportOptions = transportOptions && transportOptions.length > 0 
    ? transportOptions 
    : ['All', 'Available', 'Not Available'];

  // ✅ Dynamic rating options
  const displayRatings = ratings && ratings.length > 0 
    ? ratings 
    : ['Any Rating', '4.5+', '4.0+', '3.5+', '3.0+'];

  return (
    <aside className="lg:col-span-3">
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden sticky top-24">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <SlidersHorizontal size={14} />
            <span className="text-[11px] font-bold text-slate-900">Filters</span>
          </div>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700">
              Clear all
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
          {/* Academic Stream Filter */}
          <FilterSection label="Academic Stream" Icon={BookOpen} isOpen={expandedSections.stream} onToggle={() => toggleSection('stream')}>
            <div className="px-4 pb-3 space-y-1">
              {streamOptions && streamOptions.length > 0 ? (
                streamOptions.map(stream => (
                  <label key={stream.id} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="stream" 
                      checked={activeFilters.stream === stream.id} 
                      onChange={() => handleStreamChange(stream.id)} 
                      className="w-3.5 h-3.5 accent-indigo-600" 
                    />
                    <span className={`text-xs ${activeFilters.stream === stream.id ? 'text-indigo-600 font-medium' : 'text-slate-600'} group-hover:text-indigo-600`}>
                      {stream.icon} {stream.name}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 italic">No streams available</p>
              )}
            </div>
          </FilterSection>

          {/* Academic Level Filter */}
          <FilterSection label="Academic Level" Icon={GraduationIcon} isOpen={expandedSections.level} onToggle={() => toggleSection('level')}>
            <div className="px-4 pb-3 space-y-1">
              {levelOptions && levelOptions.length > 0 ? (
                levelOptions.map(level => (
                  <label key={level.id} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="level" 
                      checked={activeFilters.level === level.id} 
                      onChange={() => handleLevelChange(level.id)} 
                      className="w-3.5 h-3.5 accent-indigo-600" 
                    />
                    <span className={`text-xs ${activeFilters.level === level.id ? 'text-indigo-600 font-medium' : 'text-slate-600'} group-hover:text-indigo-600`}>
                      {level.icon} {level.name}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 italic">No levels available</p>
              )}
            </div>
          </FilterSection>

          {/* Department Filter */}
          <FilterSection label="Department" Icon={Building2} isOpen={expandedSections.department} onToggle={() => toggleSection('department')}>
            <div className="px-4 pb-3">
              {availableDepartments && availableDepartments.length > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {availableDepartments.map(dept => (
                    <label key={dept} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="department" 
                        checked={activeFilters.department === dept} 
                        onChange={() => handleDepartmentChange(dept)} 
                        className="w-3.5 h-3.5 accent-indigo-600" 
                      />
                      <span className={`text-xs ${activeFilters.department === dept ? 'text-indigo-600 font-medium' : 'text-slate-600'} group-hover:text-indigo-600`}>
                        {dept}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">No departments available</p>
              )}
            </div>
          </FilterSection>

          {/* Course Filter */}
          <FilterSection label="Course" Icon={Layers} isOpen={expandedSections.course} onToggle={() => toggleSection('course')}>
            <div className="px-4 pb-3">
              {availableCourses && availableCourses.length > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {availableCourses.map(course => (
                    <label key={course} className="flex items-center gap-2 py-1.5 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="course" 
                        checked={activeFilters.course === course} 
                        onChange={() => handleCourseChange(course)} 
                        className="w-3.5 h-3.5 accent-indigo-600" 
                      />
                      <span className={`text-xs ${activeFilters.course === course ? 'text-indigo-600 font-medium' : 'text-slate-600'} group-hover:text-indigo-600`}>
                        {course}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">No courses available</p>
              )}
            </div>
          </FilterSection>

          {/* Location Filter */}
          <FilterSection label="Location" Icon={MapPinIcon} isOpen={expandedSections.location} onToggle={() => toggleSection('location')}>
            <div className="px-4 pb-3">
              <select
                value={activeFilters.location}
                onChange={(e) => setActiveFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {displayLocationOptions.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </FilterSection>

          {/* College Search Filter */}
          <FilterSection label="College / University" Icon={Building} isOpen={expandedSections.collegeSearch} onToggle={() => toggleSection('collegeSearch')}>
            <div className="px-4 pb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, city, or area..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </FilterSection>

          {/* Transport Filter */}
          <FilterSection label="Transport" Icon={Bus} isOpen={expandedSections.transport} onToggle={() => toggleSection('transport')}>
            <div className="px-4 pb-3 space-y-1">
              {displayTransportOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="transport" 
                    checked={activeFilters.transport === opt} 
                    onChange={() => setActiveFilters(prev => ({ ...prev, transport: opt }))} 
                    className="w-3.5 h-3.5 accent-indigo-600" 
                  />
                  <span className={`text-xs ${activeFilters.transport === opt ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Rating Filter */}
          <FilterSection label="Rating" Icon={Star} isOpen={expandedSections.rating} onToggle={() => toggleSection('rating')}>
            <div className="px-4 pb-3 space-y-1">
              {displayRatings.map(opt => (
                <label key={opt} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="rating" 
                    checked={activeFilters.rating === opt} 
                    onChange={() => setActiveFilters(prev => ({ ...prev, rating: opt }))} 
                    className="w-3.5 h-3.5 accent-indigo-600" 
                  />
                  <span className={`text-xs ${activeFilters.rating === opt ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}>
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Active Filters</p>
            <div className="flex flex-wrap gap-1">
              {activeFilters.stream && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">
                  {streamOptions?.find(s => s.id === activeFilters.stream)?.name || activeFilters.stream}
                  <button onClick={() => setActiveFilters(prev => ({ ...prev, stream: '', level: '', department: '', course: '' }))}>×</button>
                </span>
              )}
              {activeFilters.level && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">
                  {levelOptions?.find(l => l.id === activeFilters.level)?.name || activeFilters.level}
                  <button onClick={() => setActiveFilters(prev => ({ ...prev, level: '', course: '' }))}>×</button>
                </span>
              )}
              {activeFilters.department && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">
                  {activeFilters.department}
                  <button onClick={() => setActiveFilters(prev => ({ ...prev, department: '', course: '' }))}>×</button>
                </span>
              )}
              {activeFilters.course && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">
                  {activeFilters.course}
                  <button onClick={() => setActiveFilters(prev => ({ ...prev, course: '' }))}>×</button>
                </span>
              )}
              {activeFilters.location && activeFilters.location !== 'All Regions' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[9px] font-medium">
                  📍 {activeFilters.location}
                  <button onClick={() => setActiveFilters(prev => ({ ...prev, location: 'All Regions' }))}>×</button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}