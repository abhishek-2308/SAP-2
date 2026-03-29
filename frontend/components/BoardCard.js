import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Trash2, Calendar, ChevronRight, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getBoardBackground } from '@/lib/themes';
import { cn } from '@/lib/utils';

export default function BoardCard({ board, onDelete, onClick }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStarred, setIsStarred] = useState(board.is_starred || false);
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
      className={cn(
        "group relative flex flex-col h-32 rounded-[16px] overflow-hidden shadow-sm hover:shadow-2xl cursor-pointer border transition-all duration-300",
        isStarred ? "border-amber-400 ring-2 ring-amber-400/20 shadow-[0_8px_30px_rgb(251,191,36,0.15)]" : "border-white/10"
      )}
      onClick={() => onClick(board.id)}
    >
      {/* Gradient Background Banner (top 60%) */}
      <div
        className="relative flex-[1.2] flex items-start justify-between p-3"
        style={{ background: theme.preview }}
      >
        {/* Subtle shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />

        <div className="flex items-center gap-1.5 z-10">
          <span className="text-white/80 text-[8px] font-black uppercase tracking-[0.2em] bg-white/10 border border-white/20 rounded-md px-2 py-0.5 backdrop-blur-md">
            Personal
          </span>
          {isStarred && (
            <div className="bg-amber-400 p-1 rounded-md shadow-lg border border-white/20">
              <Star size={10} className="fill-white text-white" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setIsStarred(!isStarred);
              // In a real app, we'd trigger an API call here.
            }} 
            className={cn(
              "p-1.5 rounded-lg backdrop-blur-md border border-white/20 transition-all",
              isStarred ? "bg-amber-400 text-white" : "bg-white/20 text-white/70 hover:text-white"
            )}
          >
            <Star size={14} className={isStarred ? "fill-white" : ""} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setIsDeleting(!isDeleting); }} 
            className="p-1.5 text-white/70 hover:text-white bg-white/20 rounded-lg hover:bg-red-500/40 border border-white/20 transition-all"
          >
            <MoreVertical size={14} />
          </button>
        </div>
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
