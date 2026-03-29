'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, AlignLeft, CheckSquare, Trash2, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARD_THEMES, getCardTheme } from '@/lib/themes';

function CardThemePicker({ currentTheme, onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.95 }}
      className="absolute top-full right-0 mt-1 z-50 p-2.5 rounded-xl border border-[var(--border)] shadow-2xl"
      style={{ background: 'var(--bg-card)', minWidth: '168px' }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Card Color</p>
      <div className="grid grid-cols-3 gap-1.5">
        {CARD_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={(e) => { e.stopPropagation(); onSelect(t.id); onClose(); }}
            className="relative h-8 rounded-lg flex items-center justify-center transition-all border-2 hover:scale-105"
            style={{
              background: t.bg,
              borderColor: currentTheme === t.id ? t.dot : 'var(--border)',
              boxShadow: currentTheme === t.id ? `0 0 0 2px ${t.dot}40` : undefined,
            }}
            title={t.label}
          >
            <div className="w-2.5 h-2.5 rounded-full shadow" style={{ backgroundColor: t.dot }} />
            {currentTheme === t.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check size={12} strokeWidth={3} style={{ color: t.dot }} />
              </div>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function KanbanCard({ card, onOpenModal, onDeleteCard, onToggleComplete, onUpdateTheme, highlight = false }) {
  const [showThemePicker, setShowThemePicker] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ 
      id: `card-${card.id}`, 
      data: { type: 'card', card } 
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const cardTheme = getCardTheme(card.theme || 'default');
  const hasDueDate = !!card.due_date;
  const isOverdue = hasDueDate && new Date(card.due_date) < new Date();
  const dateFormatted = hasDueDate
    ? new Date(card.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative select-none rounded-[10px] outline-none",
        isDragging && "z-50 cursor-grabbing"
      )}
    >
      <div
        className={cn(
          "rounded-[10px] shadow-sm cursor-grab active:cursor-grabbing transition-all duration-150 overflow-hidden",
          isDragging ? "opacity-0" : "opacity-100"
        )}
        style={{
          background: 'rgba(255,255,255,0.92)',
          border: highlight
            ? '2px solid #2563eb'
            : '1px solid rgba(255,255,255,0.4)',
          backdropFilter: 'blur(8px)',
          ...(highlight ? { background: 'rgba(37,99,235,0.12)' } : {}),
        }}
        onClick={() => onOpenModal(card)}
        {...attributes}
        {...listeners}
      >
        {/* Card Cover — Colored top strip for non-default themes */}
        {cardTheme.accent && (
          <div
            className="h-8 w-full"
            style={{ background: `linear-gradient(135deg, ${cardTheme.accent}dd, ${cardTheme.accent}88)` }}
          />
        )}

        <div className="p-3">
          {/* Quick Labels Preview */}
          {card.labels?.length > 0 && (
            <div className="flex gap-1 mb-1.5 overflow-hidden items-center whitespace-nowrap">
              {card.labels.map((l) => (
                <div key={l.id} className="h-1.5 w-8 rounded-full shadow-sm" style={{ backgroundColor: l.color }} />
              ))}
            </div>
          )}

          {/* Card Title & Checkbox */}
          <div className="flex items-start gap-2 mb-2">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(card.id);
              }}
              className={cn(
                "mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-all flex items-center justify-center",
                card.is_completed 
                  ? "bg-green-600 border-green-600 text-white" 
                  : "border-slate-300 hover:border-slate-400 bg-white"
              )}
            >
              {card.is_completed && <Check size={10} strokeWidth={4} />}
            </button>
            <p className={cn(
              "text-[13px] leading-snug font-semibold transition-all break-words",
              card.is_completed ? "text-slate-400 line-through" : "text-slate-800"
            )}>
              {card.title}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
            {card.description && <AlignLeft size={13} className="text-slate-400" />}

            {card.checklists?.length > 0 && (
              <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                <CheckSquare size={12} />
                <span>
                  {card.checklists.reduce((a, c) => a + c.items.filter(i => i.is_completed).length, 0)}/
                  {card.checklists.reduce((a, c) => a + c.items.length, 0)}
                </span>
              </div>
            )}

            {hasDueDate && (
              <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border shadow-sm", isOverdue ? "bg-red-600 text-white border-red-700" : "bg-slate-100 border-slate-200")}>
                <Calendar size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">{dateFormatted}</span>
              </div>
            )}

            {/* Member avatars */}
            {card.members?.length > 0 && (
              <div className="flex items-center gap-0.5 ml-auto">
                {card.members.slice(0, 3).map((m) => (
                  <div key={m.id} className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-black border border-white shadow-sm" title={m.name}>
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                ))}
                {card.members.length > 3 && (
                  <div className="w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center text-white text-[8px] font-black border border-white">+{card.members.length - 3}</div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {/* Card theme picker */}
          <div className="relative" data-card-theme-picker>
            <button
              onPointerDown={(e) => { e.stopPropagation(); }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowThemePicker((v) => !v); }}
              className="p-1 px-1.5 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 rounded transition-all shadow-sm border border-white/40"
              title="Card color"
            >
              <Palette size={11} />
            </button>
            <AnimatePresence>
              {showThemePicker && (
                <CardThemePicker
                  currentTheme={card.theme || 'default'}
                  onSelect={(newTheme) => onUpdateTheme && onUpdateTheme(card.id, newTheme)}
                  onClose={() => setShowThemePicker(false)}
                />
              )}
            </AnimatePresence>
          </div>

          <button
            onPointerDown={(e) => { e.stopPropagation(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteCard(card.id); }}
            className="p-1 px-1.5 bg-white/80 hover:bg-red-100 text-slate-500 hover:text-red-700 rounded transition-all shadow-sm border border-white/40"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
