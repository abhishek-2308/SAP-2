'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useBoardDetails } from '@/hooks/useBoard';
import { searchCards } from '@/lib/api';
import useBoardStore from '@/store/boardStore';
import KanbanBoard from '@/components/KanbanBoard';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';

export default function BoardPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const { data, error } = useBoardDetails(id);
  const setBoardData = useBoardStore((s) => s.setBoardData);
  const currentBoard = useBoardStore((s) => s.currentBoard);

  // --- Search & Filter State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (data) setBoardData(data);
  }, [data, setBoardData]);

  // Execute Search/Filter API Request
  useEffect(() => {
    const hasFilters = Object.keys(activeFilters).length > 0;
    
    if (!searchQuery.trim() && !hasFilters) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchCards(id, searchQuery.trim(), activeFilters);
        setSearchResults(new Set(results.map((c) => c.id)));
      } catch {
        /* silent search error */
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [id, searchQuery, activeFilters]);

  const handleClearAll = useCallback(() => {
    setSearchQuery('');
    setActiveFilters({});
    setSearchResults(null);
  }, []);

  if (error) return (
    <div className="h-screen bg-[#f1f2f4] flex flex-col items-center justify-center p-8 text-center text-red-500">
       <h2 className="text-xl font-black uppercase tracking-tighter">Connection Failed</h2>
       <Link href="/" className="mt-8 btn btn-primary px-8 font-bold text-sm">Return Home</Link>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#f1f2f4] overflow-hidden">
      {/* Light Board Nav — Standard Trello Header */}
      <nav className="h-12 bg-white/70 backdrop-blur-sm flex items-center justify-between px-4 border-b border-slate-200 shrink-0 z-50">
        <div className="flex items-center gap-4 w-1/3">
          <Link href="/">
            <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-md transition-all">
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div className="flex flex-col mt-1">
            <h1 className="font-black text-slate-800 text-lg tracking-tight leading-none truncate max-w-xs">{currentBoard?.title || 'Loading...'}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1 rounded border border-slate-200">⭐ STARRED</span>
            </div>
          </div>
        </div>

        {/* Center - Search & Filter */}
        <div className="flex-1 flex justify-center items-center">
          <div className="flex items-center gap-2 p-1 px-2 bg-slate-100 rounded-md border border-slate-200 shadow-sm">
            <SearchBar 
              query={searchQuery} 
              onQueryChange={setSearchQuery} 
              isSearching={isSearching} 
            />
            <FilterPanel 
              activeFilters={activeFilters} 
              onFilterChange={setActiveFilters} 
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="w-1/3 flex items-center justify-end gap-3">
          <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-md hover:text-slate-900 border border-transparent hover:border-slate-300">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </nav>

      {/* Standard Search Indicator */}
      {searchResults && (
        <div className="bg-blue-600 border-b border-blue-700 px-6 py-1.5 flex items-center justify-between relative z-40 text-white shadow-md">
          <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
            <Search size={12}/> Showing {searchResults.size} Matching Results
          </span>
          <button onClick={handleClearAll} className="text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all bg-blue-700 px-2 rounded py-0.5">
            Clear Search
          </button>
        </div>
      )}

      {/* Kanban Canvas — Visible Scroll Logic */}
      <main className="flex-1 relative overflow-auto momentum-scroll">
        <KanbanBoard boardId={id} highlightCardIds={searchResults} />
      </main>
    </div>
  );
}
