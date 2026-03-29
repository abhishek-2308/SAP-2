'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Trash2, Calendar, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getBoardBackground } from '@/lib/themes';

export default function BoardCard({ board, onDelete, onClick }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const theme = getBoardBackground(board.background || 'default');

  const dateStr = new Date(board.created_at).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative flex flex-col h-28 rounded-[12px] overflow-hidden shadow-sm hover:shadow-lg cursor-pointer border border-white/10"
      onClick={() => onClick(board.id)}
    >
      {/* Gradient Background Banner (top 60%) */}
      <div
        className="relative flex-1 flex items-start justify-between p-3"
        style={{ background: theme.preview }}
      >
        {/* Subtle shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />

        <span className="relative z-10 text-white/80 text-[9px] font-black uppercase tracking-widest bg-white/10 border border-white/20 rounded px-1.5 py-0.5 backdrop-blur-sm">
          WORKSPACE
        </span>

        <button 
          onClick={(e) => { e.stopPropagation(); setIsDeleting(!isDeleting); }} 
          className="relative z-10 p-1 text-white/50 hover:text-white hover:bg-white/20 rounded transition-all opacity-0 group-hover:opacity-100"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {/* Bottom Info Strip */}
      <div className="bg-[var(--bg-card)] border-t border-[var(--border)] px-3 py-2 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight leading-none truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {board.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            <Calendar size={9} />
            {dateStr}
          </div>
        </div>
        <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
      </div>

      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {isDeleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-[var(--bg-card)] flex flex-col items-center justify-center p-4 gap-2 border-2 border-red-200 dark:border-red-900/40 rounded-[12px]"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-red-700 dark:text-red-400 text-center">Delete this board?</p>
            <div className="flex gap-2 w-full pt-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(board.id); }} 
                className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded-lg transition-all"
              >
                Delete
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsDeleting(false); }} 
                className="flex-1 py-1.5 bg-[var(--bg-list)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[10px] font-bold uppercase rounded-lg hover:bg-[var(--border)] transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
