import React from 'react';
import { X } from 'lucide-react';

export default function SelectedFiltersBar({ selectedFilters, removeFilter, clearAllFilters }) {
  return (
    <div className="bg-white border-b border-slate-100 py-3 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">
            Applied Filters:
          </span>
          {selectedFilters.map((filter, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-sm"
            >
              <span className="text-indigo-700 font-medium">{filter.label}</span>
              <button
                onClick={() => removeFilter(filter.type)}
                className="text-indigo-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-500 hover:text-red-600 font-medium ml-2"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
