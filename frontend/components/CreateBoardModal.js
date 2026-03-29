'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Layout } from 'lucide-react';
import { BOARD_BACKGROUNDS } from '@/lib/themes';

export default function CreateBoardModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [selectedBg, setSelectedBg] = useState(BOARD_BACKGROUNDS[0].id);
  const [isCreating, setIsCreating] = useState(false);

  const chosen = BOARD_BACKGROUNDS.find((b) => b.id === selectedBg);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setIsCreating(true);
    try {
      await onCreate(title.trim(), selectedBg);
      onClose();
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Preview Banner */}
        <div
          className="h-28 w-full flex items-center justify-center relative overflow-hidden transition-all duration-500"
          style={{ background: chosen.preview }}
        >
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)'
            }}
          />
          <div className="text-white/80 font-black text-2xl tracking-tighter drop-shadow z-10">
            {title || 'New Board'}
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layout size={16} className="text-[var(--text-muted)]" />
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
                Create Workspace
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-list)] rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 block">
              Board Title
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              placeholder="e.g. Product Roadmap, Sprint #4..."
              className="w-full bg-[var(--bg-list)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Background Picker */}
          <div>
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2.5 block">
              Background
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {BOARD_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setSelectedBg(bg.id)}
                  className="relative h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 group"
                  style={{
                    background: bg.preview,
                    borderColor: selectedBg === bg.id ? '#3b82f6' : 'transparent',
                    boxShadow: selectedBg === bg.id ? '0 0 0 3px rgba(59,130,246,0.3)' : undefined,
                  }}
                  title={bg.label}
                >
                  {/* Shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Check mark */}
                  <AnimatePresence>
                    {selectedBg === bg.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Label on hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-[9px] font-bold text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                    {bg.label}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium">
              Selected: <span className="font-bold text-[var(--text-secondary)]">{chosen.label}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] rounded-xl transition-all hover:bg-[var(--bg-list)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || isCreating}
              className="flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest text-white rounded-xl transition-all disabled:opacity-40 shadow-lg"
              style={{
                background: chosen.preview,
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              }}
            >
              {isCreating ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
