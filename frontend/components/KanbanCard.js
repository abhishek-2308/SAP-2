'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Calendar, AlignLeft, CheckSquare, Trash2, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KanbanCard({ card, onOpenModal, onDeleteCard, highlight = false }) {
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
        "group relative select-none rounded-[8px] outline-none",
        isDragging && "z-50 cursor-grabbing"
      )}
    >
      <div
        className={cn(
          "bg-white p-3 rounded-[8px] border border-slate-300 shadow-sm cursor-grab active:cursor-grabbing",
          "transition-all duration-150 hover:bg-slate-50 hover:border-slate-400",
          highlight && "ring-2 ring-blue-600 bg-blue-50 border-blue-600",
          isDragging ? "opacity-0" : "opacity-100"
        )}
        onClick={() => onOpenModal(card)}
        {...attributes}
        {...listeners}
      >
        {/* Quick Labels Preview */}
        {card.labels?.length > 0 && (
          <div className="flex gap-1 mb-1.5 overflow-hidden items-center whitespace-nowrap">
            {card.labels.map((l) => (
              <div key={l.id} className="h-1.5 w-8 rounded-full shadow-sm" style={{ backgroundColor: l.color }} />
            ))}
          </div>
        )}

        {/* Card Title — Standard Trello Typography */}
        <p className="text-[14px] leading-snug font-medium text-slate-800 break-words mb-2">
          {card.title}
        </p>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
          {card.description && <AlignLeft size={13} />}

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
            <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 shadow-sm", isOverdue ? "bg-red-700 text-white border-red-800" : "bg-slate-100")}>
              <Calendar size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">{dateFormatted}</span>
            </div>
          )}
        </div>

        {/* Floating Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onPointerDown={(e) => { e.stopPropagation(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteCard(card.id); }}
            className="p-1 px-1.5 bg-slate-200 hover:bg-red-100 text-slate-500 hover:text-red-700 rounded transition-all shadow-sm"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
