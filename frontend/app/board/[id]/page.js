'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, MoreHorizontal, Palette } from 'lucide-react';
import { useBoardDetails } from '@/hooks/useBoard';
import { searchCards, updateBoardBackground } from '@/lib/api';
import useBoardStore from '@/store/boardStore';
import KanbanBoard from '@/components/KanbanBoard';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import ThemeToggle from '@/components/ThemeToggle';
import { getBoardBackground, BOARD_BACKGROUNDS } from '@/lib/themes';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

export default function BoardPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const { data, error } = useBoardDetails(id);
  const setBoardData = useBoardStore((s) => s.setBoardData);
  const currentBoard = useBoardStore((s) => s.currentBoard);
  const queryClient = useQueryClient();

  // Board background
  const [bgId, setBgId] = useState('default');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const boardTheme = getBoardBackground(bgId);

  // --- Search & Filter State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (data) {
      setBoardData(data);
      setBgId(data.background || 'default');
    }
  }, [data, setBoardData]);

  const handleBgChange = async (newBgId) => {
    setBgId(newBgId);
    setShowBgPicker(false);
    await updateBoardBackground(id, newBgId);
    queryClient.invalidateQueries({ queryKey: ['board', id] });
  };

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
    <div className="h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-8 text-center text-[var(--danger)]">
       <h2 className="text-xl font-black uppercase tracking-tighter">Connection Failed</h2>
       <Link href="/" className="mt-8 btn btn-primary px-8 font-bold text-sm">Return Home</Link>
    </div>
  );

  return (
    <div
      className="h-screen flex flex-col transition-all duration-700 overflow-hidden"
      style={{ background: boardTheme.preview }}
    >
      {/* Board Nav */}
      <nav className="h-12 bg-black/20 backdrop-blur-md flex items-center justify-between px-4 border-b border-white/10 shrink-0 z-50">
        <div className="flex items-center gap-4 w-1/3">
          <Link href="/">
            <button className="p-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-md transition-all border border-white/10">
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div className="flex flex-col mt-1">
            <h1 className="font-black text-white text-lg tracking-tight leading-none truncate max-w-xs drop-shadow">{currentBoard?.title || 'Loading...'}</h1>
            <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">{boardTheme.label}</span>
          </div>
        </div>

        {/* Center */}
        <div className="flex-1 flex justify-center items-center">
          <div className="flex items-center gap-2 p-1 px-2 bg-black/20 rounded-md border border-white/10 shadow-sm backdrop-blur-sm">
            <SearchBar query={searchQuery} onQueryChange={setSearchQuery} isSearching={isSearching} />
            <FilterPanel activeFilters={activeFilters} onFilterChange={setActiveFilters} />
          </div>
        </div>

        {/* Right */}
        <div className="w-1/3 flex items-center justify-end gap-2">
          {/* Background Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowBgPicker(!showBgPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-md border border-white/10 text-[11px] font-bold uppercase tracking-wider transition-all"
            >
              <Palette size={13} /> Background
            </button>

            <AnimatePresence>
              {showBgPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowBgPicker(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute top-full mt-2 right-0 w-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 p-3"
                  >
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 px-1">Board Background</p>
                    <div className="grid grid-cols-3 gap-2">
                      {BOARD_BACKGROUNDS.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => handleBgChange(bg.id)}
                          className="relative h-12 rounded-xl overflow-hidden border-2 transition-all"
                          style={{
                            background: bg.preview,
                            borderColor: bgId === bg.id ? '#3b82f6' : 'transparent',
                            boxShadow: bgId === bg.id ? '0 0 0 3px rgba(59,130,246,0.35)' : undefined,
                          }}
                          title={bg.label}
                        >
                          {bgId === bg.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow">
                                <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-[var(--text-muted)] mt-2 px-1 font-medium">Selected: <span className="font-bold">{boardTheme.label}</span></p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle />
          <button className="p-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-md border border-white/10 transition-all">
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
