import React from 'react';
import { useSearchParams } from 'react-router-dom';

const FilterChips = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const hasFilters = search || category || startDate || endDate;

  if (!hasFilters) return null;

  const handleRemoveFilter = (key) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-sm text-slate-500 font-medium">Active filters:</span>
      
      {search && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">
          Search: {search}
          <button type="button" onClick={() => handleRemoveFilter('search')} className="text-blue-500 hover:text-blue-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </span>
      )}
      
      {category && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">
          Category: {category}
          <button type="button" onClick={() => handleRemoveFilter('category')} className="text-blue-500 hover:text-blue-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </span>
      )}
      
      {startDate && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">
          From: {new Date(startDate).toLocaleDateString()}
          <button type="button" onClick={() => handleRemoveFilter('startDate')} className="text-blue-500 hover:text-blue-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </span>
      )}
      
      {endDate && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">
          To: {new Date(endDate).toLocaleDateString()}
          <button type="button" onClick={() => handleRemoveFilter('endDate')} className="text-blue-500 hover:text-blue-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </span>
      )}
      
      <button 
        onClick={handleClearAll}
        className="text-sm font-medium text-slate-500 hover:text-slate-700 hover:underline ml-2"
      >
        Clear all
      </button>
    </div>
  );
};

export default FilterChips;
