import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import './trending.css';

const Trending = ({ colleges = [], searchQuery = '', activeCategory = 'All Institutions' }) => {
  const navigate = useNavigate();

  const filteredColleges = colleges.filter((college) => {
    const matchesSearch =
      searchQuery === '' ||
      college.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === 'All Institutions' ||
      college.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating) => {
    if (!rating || rating === 0) return null;
    const num = parseFloat(rating);
    return (
      <div className="rating">
        <span>⭐ {num.toFixed(1)}</span>
      </div>
    );
  };

  const showNoResults = searchQuery && filteredColleges.length === 0;

  return (
    <section className="trending-section">
      <div className="trending-container">

        {/* HEADER */}
        <div className="trending-header">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : 'Trending Colleges'}
            </h2>
            <p className="text-slate-500">
              {searchQuery
                ? `${filteredColleges.length} colleges found`
                : 'Popular colleges right now'}
            </p>
          </div>

          {!searchQuery && (
            <Link to="/colleges" className="view-all font-bold hover:underline">
              View All →
            </Link>
          )}
        </div>

        {/* NO RESULTS */}
        {showNoResults ? (
          <div className="no-results text-center py-12">
            <h3 className="text-xl font-bold text-slate-700">No colleges found</h3>
            <p className="text-slate-500">Try different keywords</p>
          </div>
        ) : (
          <div className="trending-grid">
            {filteredColleges.map((college) => (
              <div
                key={college.id}
                className="trending-card"
                onClick={() => navigate(`/university/${college.id}`)}
              >
                {/* IMAGE */}
                <div className="card-image bg-slate-200">
                  {college.image ? (
                    <img 
                      src={college.image} 
                      alt={college.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-400">No Image</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="card-body p-5">

                  <div className="top-row flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{college.name}</h3>
                    {college.badge && (
                      <span className="badge bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[11px] font-bold whitespace-nowrap ml-2">
                        {college.badge}
                      </span>
                    )}
                  </div>

                  {renderStars(college.rating)}

                  {college.description && (
                    <p className="desc text-sm text-slate-500 my-3 line-clamp-2">
                      {college.description}
                    </p>
                  )}

                  {(college.location || college.city) && (
                    <div className="meta text-[13px] text-slate-600 flex items-center gap-1">
                      <MapPin size={14} className="text-indigo-500" />
                      <span>{college.location || college.city}</span>
                    </div>
                  )}

                  <button
                    className="view-btn mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/university/${college.id}`);
                    }}
                  >
                    View Details →
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Trending;