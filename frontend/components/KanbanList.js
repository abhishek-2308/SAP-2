import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import KanbanCard from './KanbanCard';
import { cn } from '@/lib/utils';

export default function KanbanList({ 
  list, 
  cards, 
  onAddCard, 
  onDeleteList, 
  onUpdateList, 
  onOpenModal, 
  onDeleteCard, 
  highlightCardIds = null 
}) {
  const { 
    setNodeRef, 
    attributes, 
    listeners, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ 
    id: `list-${list.id}`, 
    data: { type: 'list', list } 
  });
  
  const { setNodeRef: setDroppableRef } = useDroppable({ 
    id: list.id, 
    data: { type: 'list', listId: list.id } 
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.focus();
  }, [isEditingTitle]);

  const handleAdd = () => {
    if (!newCardTitle.trim()) return;
    onAddCard(list.id, newCardTitle.trim());
    setNewCardTitle('');
    setIsAdding(false);
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== list.title) {
      onUpdateList(list.id, { title: editedTitle.trim() });
    } else {
      setEditedTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "flex-shrink-0 w-72 max-h-full flex flex-col rounded-[14px] bg-[#ebedf0]/90 backdrop-blur-sm shadow-lg border border-slate-300 overflow-hidden transition-shadow",
        isDragging && "shadow-2xl ring-2 ring-blue-500/50"
      )}
    >
      {/* Header — Click area for dragging the whole list */}
      <div 
        {...attributes} 
        {...listeners} 
        className="flex items-center justify-between p-3.5 pb-2 shrink-0 group/header cursor-grab active:cursor-grabbing"
      >
        <div className="flex-1 min-w-0 pr-2">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              className="w-full bg-white px-2 py-0.5 rounded border border-blue-600 outline-none text-[14px] font-black uppercase text-slate-800"
            />
          ) : (
            <h3 
              onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
              className="px-1 text-[14px] font-black text-slate-800 tracking-tight uppercase flex items-center gap-2 truncate hover:bg-black/5 rounded cursor-text transition-colors"
            >
              {list.title}
              <span className="text-[10px] font-bold text-slate-500 bg-black/10 px-2 py-0.5 rounded-full">{cards.length}</span>
            </h3>
          )}
        </div>
        <button 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={(e) => { e.stopPropagation(); onDeleteList(list.id); }} 
          className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg group-hover/header:opacity-100 opacity-0 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Cards Area */}
      <div ref={setDroppableRef} className="flex-1 overflow-y-auto px-2 py-2 min-h-[60px] space-y-2.5">
        <SortableContext items={cards.map(c => `card-${c.id}`)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {cards.map((card) => (
              <KanbanCard 
                key={card.id} 
                card={card} 
                onOpenModal={onOpenModal} 
                onDeleteCard={onDeleteCard} 
                highlight={highlightCardIds instanceof Set ? highlightCardIds.has(card.id) : highlightCardIds?.includes?.(card.id)} 
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </div>

      <div className="p-2 shrink-0">
        {isAdding ? (
          <div className="bg-white p-2.5 rounded-xl border border-slate-300 shadow-sm space-y-2">
            <textarea 
              autoFocus 
              value={newCardTitle} 
              onChange={(e) => setNewCardTitle(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())} 
              placeholder="What needs to be done?" 
              className="w-full bg-slate-50 text-[13px] text-slate-900 p-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none min-h-[70px] transition-all" 
            />
            <div className="flex items-center gap-1.5">
              <button onClick={handleAdd} className="btn btn-primary px-4 py-1.5 font-bold text-[11px] uppercase tracking-widest">Add Card</button>
              <button onClick={() => setIsAdding(false)} className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"><X size={18}/></button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)} className="w-full py-2.5 px-3 flex items-center gap-2 text-slate-600 hover:bg-black/5 hover:text-slate-900 rounded-xl transition-all font-bold text-[13px]">
            <Plus size={16}/> Add a card
          </button>
        )}
      </div>
    </div>
  );
}
