'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Trash2, Layout, Calendar, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function BoardCard({ board, onDelete, onClick }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const dateStr = new Date(board.created_at).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="group relative flex flex-col h-28 bg-white border border-slate-200 rounded-[8px] p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer overflow-hidden"
      onClick={() => onClick(board.id)}
    >
      {/* Simple Header */}
      <div className="flex items-start justify-between">
        <div className="p-1 px-1.5 bg-blue-600/10 rounded text-blue-700 font-bold text-[10px] tracking-widest border border-blue-600/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
          WORKSPACE
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsDeleting(!isDeleting); }} 
          className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-all opacity-0 group-hover:opacity-100"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {/* Title */}
      <h3 className="mt-3 text-base font-bold text-slate-800 tracking-tight leading-none group-hover:text-blue-700 transition-colors truncate">
        {board.title}
      </h3>

      {/* Footer Meta */}
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <Calendar size={12} className="text-slate-400" />
          {dateStr}
        </div>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-700 transition-colors" />
      </div>

      {/* Delete Popup Overlay (Clean Style) */}
      <AnimatePresence>
        {isDeleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-4 gap-2 border-2 border-red-100"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-red-700 text-center">Terminate workspace?</p>
            <div className="flex gap-2 w-full pt-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(board.id); }} 
                className="flex-1 py-1 bg-red-700 hover:bg-red-800 text-white text-[10px] font-bold uppercase rounded transition-all"
              >
                Delete
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsDeleting(false); }} 
                className="flex-1 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded hover:bg-slate-200 transition-all"
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
