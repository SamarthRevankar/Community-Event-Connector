import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../../utils/eventValidation';

const FilterPanel = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <div className="w-full sm:w-auto flex-1">
        <label htmlFor="category" className="block text-xs font-medium text-slate-500 mb-1">Category</label>
        <select
          id="category"
          value={searchParams.get('category') || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-auto flex-1">
        <label htmlFor="startDate" className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
        <input
          type="date"
          id="startDate"
          value={searchParams.get('startDate') ? searchParams.get('startDate').split('T')[0] : ''}
          onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
          className="block w-full pl-3 pr-3 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
        />
      </div>

      <div className="w-full sm:w-auto flex-1">
        <label htmlFor="endDate" className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
        <input
          type="date"
          id="endDate"
          value={searchParams.get('endDate') ? searchParams.get('endDate').split('T')[0] : ''}
          onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
          className="block w-full pl-3 pr-3 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
        />
      </div>
    </div>
  );
};

export default FilterPanel;
