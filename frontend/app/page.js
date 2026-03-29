'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Plus, Search, Star, Trash2 } from 'lucide-react';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useBoards, useCreateBoard, useDeleteBoard, useReorderBoard } from '@/hooks/useBoard';
import BoardCard from '@/components/BoardCard';
import ThemeToggle from '@/components/ThemeToggle';
import CreateBoardModal from '@/components/CreateBoardModal';
import { AnimatePresence } from 'framer-motion';
import { calculateNewPosition } from '@/lib/orderUtils';

export default function Home() {
  const router = useRouter();
  const { data: boards, isLoading, error } = useBoards();
  const createBoardMutation = useCreateBoard();
  const deleteBoardMutation = useDeleteBoard();
  const reorderBoardMutation = useReorderBoard();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [boardSearchQuery, setBoardSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSort, setFilterSort] = useState('position'); // Default to our positional order

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Filter then Sort
  const filteredBoards = boards?.filter(b => b.title.toLowerCase().includes(boardSearchQuery.toLowerCase())).sort((a, b) => {
    if (filterSort === 'position') return (a.position || 0) - (b.position || 0);
    if (filterSort === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (filterSort === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    if (filterSort === 'a-z') return a.title.localeCompare(b.title);
    return 0;
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Only allow manual reorder if we are in "position" sort mode and no search
    if (filterSort !== 'position' || boardSearchQuery) return;

    const boardId = parseInt(active.id.replace('board-', ''));
    const overId = parseInt(over.id.replace('board-', ''));
    
    const overIndex = boards.findIndex(b => b.id === overId);
    const activeIndex = boards.findIndex(b => b.id === boardId);

    let newPosition;
    if (activeIndex < overIndex) {
        newPosition = calculateNewPosition(boards[overIndex].position, boards[overIndex + 1]?.position);
    } else {
        newPosition = calculateNewPosition(boards[overIndex - 1]?.position, boards[overIndex].position);
    }

    reorderBoardMutation.mutate({ id: boardId, newPosition });
  };

  const handleCreate = (title, background) => {
// ... same ...
    return new Promise((resolve, reject) => {
      createBoardMutation.mutate({ title, background }, {
        onSuccess: resolve,
        onError: reject,
      });
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] overflow-auto text-[var(--text-primary)] transition-colors duration-300">
      {/* Header */}
      <header className="bg-[var(--bg-card)] border-b border-[var(--border)] h-14 flex items-center px-6 sticky top-0 z-50">
        {/* Left */}
        <div className="flex items-center gap-2 group cursor-pointer w-1/3">
           <div className="p-1 bg-blue-600 rounded text-white shadow-sm"><Layout size={18}/></div>
           <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Trello Cello</h1>
        </div>
        
        {/* Center - Responsive Search/Filter */}
        <div className="flex-1 flex justify-center items-center h-full">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[var(--bg-list)] border border-[var(--border)] p-1 sm:p-1.5 px-2 rounded-lg shadow-sm w-full max-w-[160px] xs:max-w-xs sm:max-w-md transition-all">
            <div className="flex items-center gap-2 px-1.5 sm:px-2 py-0.5 rounded text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border)] focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all flex-1 min-w-0">
              <Search size={14} className="text-[var(--text-muted)] shrink-0"/>
              <input 
                type="text" 
                placeholder="Search..." 
                value={boardSearchQuery}
                onChange={(e) => setBoardSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs sm:text-sm placeholder:text-[var(--text-muted)] w-full transition-all py-0.5 font-medium text-[var(--text-primary)]" 
              />
            </div>
            
            <div className="relative shrink-0">
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className={`text-[11px] sm:text-[13px] px-2 sm:px-3 py-1 sm:py-1.5 rounded flex items-center gap-1.5 transition-all font-bold border shadow-sm ${filterSort !== 'newest' ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700' : 'bg-[var(--bg-card)] hover:bg-[var(--bg-list)] text-[var(--text-primary)] border-[var(--border)]'}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-[14px] sm:h-[14px]"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                <span className="hidden xs:inline">Sort</span> {filterSort !== 'newest' && '●'}
              </button>

              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                  <div className="absolute top-full mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-xl z-50 p-2 right-0 origin-top-right">
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 pb-1 border-b border-[var(--border)] mb-1">Sort Boards</div>
                    <button onClick={() => { setFilterSort('position'); setFilterOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded text-sm font-medium hover:bg-[var(--bg-list)] ${filterSort === 'position' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-[var(--text-primary)]'}`}>Custom Order (Default)</button>
                    <button onClick={() => { setFilterSort('newest'); setFilterOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded text-sm font-medium hover:bg-[var(--bg-list)] ${filterSort === 'newest' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-[var(--text-primary)]'}`}>Newest First</button>
                    <button onClick={() => { setFilterSort('oldest'); setFilterOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded text-sm font-medium hover:bg-[var(--bg-list)] ${filterSort === 'oldest' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-[var(--text-primary)]'}`}>Oldest First</button>
                    <button onClick={() => { setFilterSort('a-z'); setFilterOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded text-sm font-medium hover:bg-[var(--bg-list)] ${filterSort === 'a-z' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-[var(--text-primary)]'}`}>Alphabetical (A-Z)</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="w-1/3 flex items-center justify-end gap-3">
           <button 
             onClick={() => router.push('/trash')}
             className="p-2 rounded-lg hover:bg-[var(--bg-list)] text-[var(--text-muted)] hover:text-red-500 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
             title="View Trash"
           >
             <Trash2 size={18} />
             <span className="hidden md:inline">Trash</span>
           </button>
           <ThemeToggle />
           <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-list)] hover:bg-[var(--border)] transition-colors text-[var(--text-primary)] font-bold text-xs ring-1 ring-[var(--border)] shadow-sm">S</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Starred Boards Section */}
        {boards?.some(b => b.is_starred) && !boardSearchQuery && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
               <Star size={20} className="text-amber-400 fill-amber-400" />
               <h2 className="text-[13px] font-black tracking-widest uppercase text-[var(--text-secondary)]">Starred Boards</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.filter(b => b.is_starred).map((board) => (
                 <BoardCard
                   key={`starred-${board.id}`}
                   board={board}
                   onDelete={(id) => deleteBoardMutation.mutate(id)}
                   onClick={(id) => router.push(`/board/${id}`)}
                 />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
               <Layout size={20} className="text-[var(--text-muted)]" />
               <h2 className="text-[13px] font-black tracking-widest uppercase text-[var(--text-secondary)]">All Boards</h2>
            </div>
            {isLoading && <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest animate-pulse">Loading...</span>}
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Create New Board Card */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="group relative flex flex-col items-center justify-center h-28 rounded-[12px] bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer overflow-hidden gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                  <Plus size={18} className="text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white font-bold text-sm tracking-tight transition-colors">
                  Create new board
                </span>
              </button>

              {/* Existing Boards */}
              <SortableContext items={filteredBoards?.map(b => `board-${b.id}`) || []} strategy={rectSortingStrategy}>
                {filteredBoards?.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onDelete={(id) => deleteBoardMutation.mutate(id)}
                    onClick={(id) => router.push(`/board/${id}`)}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>

          {/* Empty state */}
          {!isLoading && filteredBoards?.length === 0 && boardSearchQuery && (
            <div className="text-center py-16">
              <p className="text-[var(--text-muted)] text-sm font-medium">No boards match &ldquo;<span className="font-bold text-[var(--text-secondary)]">{boardSearchQuery}</span>&rdquo;</p>
            </div>
          )}
        </section>
      </div>

      {/* Create Board Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateBoardModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
