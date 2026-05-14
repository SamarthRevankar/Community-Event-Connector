import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 3 }) => {
  if (type === 'form') {
    return (
      <div className="animate-pulse space-y-6 bg-white shadow-sm ring-1 ring-slate-200 rounded-xl p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-slate-200 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-slate-200 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-slate-200 rounded w-full"></div>
          </div>
          <div className="md:col-span-2">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-slate-200 rounded w-full"></div>
          </div>
          <div className="md:col-span-2 border-t border-slate-200 pt-6 mt-2">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-slate-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="animate-pulse space-y-8">
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-xl w-full"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  // Default: 'card'
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden flex flex-col h-full">
          <div className="p-5 flex-grow space-y-4">
            <div className="flex justify-between items-start">
              <div className="h-6 bg-slate-200 rounded w-2/3"></div>
              <div className="h-6 bg-slate-200 rounded-full w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
