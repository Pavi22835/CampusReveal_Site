import React from 'react';
import './categoryTabs.css';

const CategoryTabs = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="category-tabs-container">
      <div className="category-tabs-wrapper">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
