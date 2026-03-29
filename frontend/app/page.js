'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Plus, X, Search, MoreHorizontal } from 'lucide-react';
import { useBoards, useCreateBoard, useDeleteBoard } from '@/hooks/useBoard';
import BoardCard from '@/components/BoardCard';

export default function Home() {
  const router = useRouter();
  const { data: boards, isLoading, error } = useBoards();
  const createBoardMutation = useCreateBoard();
  const deleteBoardMutation = useDeleteBoard();

  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [boardSearchQuery, setBoardSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSort, setFilterSort] = useState('newest'); // 'newest', 'oldest', 'a-z'

  // Filter then Sort
  const filteredBoards = boards?.filter(b => b.title.toLowerCase().includes(boardSearchQuery.toLowerCase())).sort((a, b) => {
    if (filterSort === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (filterSort === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    if (filterSort === 'a-z') return a.title.localeCompare(b.title);
    return 0;
  });

  const handleCreate = () => {
    if (!newBoardTitle.trim()) return;
    createBoardMutation.mutate({ title: newBoardTitle.trim() }, {
      onSuccess: () => {
        setNewBoardTitle('');
        setIsCreating(false);
      }
    });
  };


  return (
    <div className="min-h-screen bg-[#f1f2f4] overflow-auto">
      {/* Simple Clean Header */}
      <header className="bg-white border-b border-slate-200 h-14 flex items-center px-6 sticky top-0 z-50">
        {/* Left */}
        <div className="flex items-center gap-2 group cursor-pointer w-1/3">
           <div className="p-1 bg-blue-600 rounded text-white shadow-sm"><Layout size={18}/></div>
           <h1 className="text-xl font-black text-slate-800 tracking-tight">Trello Cello</h1>
        </div>
        
        {/* Center */}
        <div className="flex-1 flex justify-center items-center">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 border border-slate-200 p-1 px-2 rounded-md shadow-sm">
            <div className="flex items-center gap-2 px-2 py-0.5 rounded text-slate-600 bg-white border border-slate-300 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
              <Search size={14} className="text-slate-400"/>
              <input 
                type="text" 
                placeholder="Search boards..." 
                value={boardSearchQuery}
                onChange={(e) => setBoardSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm placeholder:text-slate-400 w-48 focus:w-96 transition-all py-1 font-medium" 
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className={`text-[13px] px-3 py-1.5 rounded flex items-center gap-1.5 transition-all font-bold border shadow-sm ${filterSort !== 'newest' ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                Sort {filterSort !== 'newest' && '●'}
              </button>

              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                  <div className="absolute top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 right-0">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 pb-1 border-b border-slate-200 mb-1">Sort Boards</div>
                    <button onClick={() => { setFilterSort('newest'); setFilterOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded text-sm font-medium hover:bg-slate-100 ${filterSort === 'newest' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}>Newest First</button>
                    <button onClick={() => { setFilterSort('oldest'); setFilterOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded text-sm font-medium hover:bg-slate-100 ${filterSort === 'oldest' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}>Oldest First</button>
                    <button onClick={() => { setFilterSort('a-z'); setFilterOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded text-sm font-medium hover:bg-slate-100 ${filterSort === 'a-z' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}>Alphabetical (A-Z)</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="w-1/3 flex items-center justify-end gap-4">
           <button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700 font-bold text-xs">S</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-slate-800">
             <Layout size={20} className="text-slate-500" />
             <h2 className="text-lg font-black tracking-tight uppercase text-slate-600 text-[13px] tracking-widest">Personal Boards</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Simple Add Board Card */}
            <div className="rounded-[12px] bg-slate-200/50 hover:bg-slate-200 border-2 border-dashed border-slate-300 transition-all h-28 flex items-center justify-center group cursor-pointer p-4 overflow-hidden">
              {isCreating ? (
                <div className="w-full flex flex-col gap-2">
                   <input
                     autoFocus
                     type="text"
                     value={newBoardTitle}
                     onChange={(e) => setNewBoardTitle(e.target.value)}
                     onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setIsCreating(false); }}
                     placeholder="New board title..."
                     className="w-full px-2 py-1.5 text-xs rounded border-none outline-none focus:ring-1 focus:ring-blue-600"
                   />
                   <div className="flex gap-2">
                     <button onClick={handleCreate} className="btn btn-primary px-3 py-1 text-[11px] font-bold">Create</button>
                     <button onClick={() => setIsCreating(false)} className="btn btn-ghost px-2 py-1 text-[11px] font-bold">Cancel</button>
                   </div>
                </div>
              ) : (
                 <button onClick={() => setIsCreating(true)} className="w-full h-full text-slate-600 hover:text-slate-900 font-bold text-sm tracking-tight">
                   + Create new board
                 </button>
              )}
            </div>

            {/* Render existing boards */}
            {filteredBoards?.map((board) => (
               <BoardCard
                 key={board.id}
                 board={board}
                 onDelete={(id) => deleteBoardMutation.mutate(id)}
                 onClick={(id) => router.push(`/board/${id}`)}
               />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
