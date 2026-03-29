'use client';

import { Search, X, Loader2 } from 'lucide-react';

export default function SearchBar({ query, onQueryChange, isSearching }) {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-2.5 text-slate-400 pointer-events-none">
        <Search size={14} />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search..."
        className="
          bg-white hover:bg-slate-50 focus:bg-white
          text-slate-900 placeholder-slate-400 font-medium
          text-sm pl-8 pr-8 py-1.5 rounded
          border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600
          outline-none transition-all w-48 focus:w-64 shadow-sm
        "
      />
      {isSearching && (
        <div className="absolute right-2.5 text-blue-600 animate-spin">
          <Loader2 size={14} />
        </div>
      )}
      {query && !isSearching && (
        <button
          onClick={() => onQueryChange('')}
          className="absolute right-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-0.5 rounded transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
