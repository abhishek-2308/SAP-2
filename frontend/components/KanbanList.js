import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, X, Palette, Check, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import KanbanCard from './KanbanCard';
import { cn } from '@/lib/utils';
import { LIST_THEMES, getListTheme } from '@/lib/themes';

function ListThemePicker({ currentTheme, onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      className="absolute top-full left-0 mt-1 z-50 p-3 rounded-xl border border-[var(--border)] shadow-2xl"
      style={{ background: 'var(--bg-card)', minWidth: '200px' }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">List Color</p>
      <div className="grid grid-cols-3 gap-1.5">
        {LIST_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => { onSelect(t.id); onClose(); }}
            className="relative h-9 rounded-lg flex items-center justify-center transition-all border-2 hover:scale-105"
            style={{
              background: t.header,
              borderColor: currentTheme === t.id ? t.dot : 'transparent',
              boxShadow: currentTheme === t.id ? `0 0 0 2px ${t.dot}40` : undefined,
            }}
            title={t.label}
          >
            <div className="w-3 h-3 rounded-full shadow" style={{ backgroundColor: t.dot }} />
            {currentTheme === t.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check size={14} className="text-white drop-shadow" strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="text-[9px] text-[var(--text-muted)] mt-2 text-center">
        {LIST_THEMES.find((t) => t.id === currentTheme)?.label ?? 'Default'}
      </p>
    </motion.div>
  );
}

export default function KanbanList({ 
  list, 
  cards, 
  onAddCard, 
  onDeleteList, 
  onUpdateList, 
  onOpenModal, 
  onDeleteCard,
  onUpdateCardTheme,
  onToggleComplete,
  onToggleCollapse,
  onArchive,
  highlightCardIds = null 
}) {
  const isCollapsed = list.is_collapsed;

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
    zIndex: isDragging ? 50 : 0,
  };

  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.title);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const titleInputRef = useRef(null);
  const theme = getListTheme(list.theme || 'default');

  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.focus();
  }, [isEditingTitle]);

  useEffect(() => {
    if (!showThemePicker) return;
    const handle = (e) => {
      if (!e.target.closest('[data-theme-picker]')) setShowThemePicker(false);
    };
    window.addEventListener('pointerdown', handle);
    return () => window.removeEventListener('pointerdown', handle);
  }, [showThemePicker]);

  const handleAdd = () => {
    if (!newCardTitle.trim()) return;
    onAddCard(list.id, newCardTitle.trim());
    setNewCardTitle('');
    setIsAdding(false);
  };

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== list.title) {
      onUpdateList(list.id, { title: editedTitle.trim(), theme: list.theme });
    } else {
      setEditedTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  const handleThemeChange = (newTheme) => {
    onUpdateList(list.id, { title: list.title, theme: newTheme });
  };

  return (
    <motion.div 
      layout
      ref={setNodeRef} 
      style={style} 
      initial={false}
      animate={{ width: isCollapsed ? 48 : 288 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "flex-shrink-0 max-h-full flex flex-col rounded-[14px] shadow-xl overflow-hidden",
        "bg-white/15 dark:bg-black/25 backdrop-blur-xl border border-white/20",
        isDragging && "shadow-2xl ring-2 ring-blue-500/50"
      )}
    >
      {/* Header */}
      <div
        className={cn("shrink-0 relative z-20", isCollapsed ? "h-full flex flex-col items-center" : "px-3.5 pt-3 pb-2")}
        style={{
          background: theme.header,
          borderBottom: isCollapsed ? 'none' : `1px solid ${theme.border}`,
        }}
      >
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "flex group/header cursor-grab active:cursor-grabbing",
            isCollapsed ? "flex-col items-center py-4 h-full" : "items-center justify-between"
          )}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center h-full relative">
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onToggleCollapse(list.id); }}
                    className="mb-4 p-1 rounded-md hover:bg-black/20 transition-all"
                    style={{ color: theme.headerText }}
                >
                    <ChevronRight size={18} />
                </button>
                
                <h3 
                    className="whitespace-nowrap font-black uppercase text-[12px] origin-center rotate-90 mt-12 mb-auto flex items-center gap-2"
                    style={{ color: theme.headerText }}
                >
                    <span className="truncate max-w-[120px]">{list.title}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/15" style={{ color: theme.headerText }}>
                        {cards.length}
                    </span>
                </h3>

                <div className="mt-4 opacity-0 group-hover/header:opacity-100 transition-opacity">
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onDeleteList(list.id); }}
                        className="p-1 rounded hover:bg-red-500/20"
                        style={{ color: theme.headerText }}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0 pr-2">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                    className="w-full bg-black/20 border border-white/20 rounded px-2 py-0.5 outline-none text-[14px] font-black uppercase"
                    style={{ color: theme.headerText }}
                  />
                ) : (
                  <h3
                    onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
                    className="px-1 text-[14px] font-black tracking-tight uppercase flex items-center gap-2 truncate hover:bg-black/10 rounded cursor-text transition-colors"
                    style={{ color: theme.headerText }}
                  >
                    {list.title}
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.15)', color: theme.headerText }}
                    >
                      {cards.length}
                    </span>
                  </h3>
                )}
              </div>

              <div className="flex items-center gap-0.5 opacity-0 group-hover/header:opacity-100 transition-all">
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onToggleCollapse(list.id); }}
                    className="p-1.5 rounded-lg hover:bg-black/20 transition-all"
                    style={{ color: theme.headerText }}
                    title="Collapse list"
                >
                    <ChevronLeft size={13} />
                </button>

                <div className="relative" data-theme-picker>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setShowThemePicker((v) => !v); }}
                    className="p-1.5 rounded-lg hover:bg-black/20 transition-all"
                    style={{ color: theme.headerText }}
                    title="Change list color"
                  >
                    <Palette size={13} />
                  </button>
                  <AnimatePresence>
                    {showThemePicker && (
                      <ListThemePicker
                        currentTheme={list.theme || 'default'}
                        onSelect={handleThemeChange}
                        onClose={() => setShowThemePicker(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>

                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onArchive(list.id); }}
                    className="p-1.5 rounded-lg hover:bg-black/20 transition-all opacity-60 hover:opacity-100"
                    style={{ color: theme.headerText }}
                    title="Archive list"
                >
                    <Maximize2 size={13} className="rotate-45" /> 
                </button>

                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); onDeleteList(list.id); }}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                  style={{ color: theme.headerText }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards Area */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <div
                ref={setDroppableRef}
                className="flex-1 overflow-y-auto px-2 py-2 min-h-[60px] space-y-2.5"
                style={{ background: 'rgba(0,0,0,0.05)' }}
            >
                <SortableContext items={cards.map(c => `card-${c.id}`)} strategy={verticalListSortingStrategy}>
                    <AnimatePresence mode="popLayout">
                        {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <KanbanCard
                            card={card}
                            onOpenModal={onOpenModal}
                            onDeleteCard={onDeleteCard}
                            onUpdateTheme={onUpdateCardTheme}
                            onToggleComplete={onToggleComplete}
                            highlight={highlightCardIds instanceof Set ? highlightCardIds.has(card.id) : highlightCardIds?.includes?.(card.id)}
                            />
                        </motion.div>
                        ))}
                    </AnimatePresence>
                </SortableContext>
            </div>

            {/* Add Card Footer */}
            <div
                className="p-2 shrink-0"
                style={{ background: 'rgba(0,0,0,0.05)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
                {isAdding ? (
                <div
                    className="p-2.5 rounded-xl shadow-sm space-y-2"
                    style={{ background: 'var(--bg-card)', border: `1px solid ${theme.border}` }}
                >
                    <textarea
                    autoFocus
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                    placeholder="What needs to be done?"
                    className="w-full bg-[var(--bg-list)] text-[13px] text-[var(--text-primary)] p-2.5 rounded-lg border border-[var(--border)] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none min-h-[70px] transition-all"
                    />
                    <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleAdd}
                        className="btn btn-primary px-4 py-1.5 font-bold text-[11px] uppercase tracking-widest"
                    >
                        Add Card
                    </button>
                    <button
                        onClick={() => setIsAdding(false)}
                        className="p-1.5 hover:bg-[var(--bg-list)] text-[var(--text-secondary)] rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                    </div>
                </div>
                ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-2.5 px-3 flex items-center gap-2 rounded-xl transition-all font-bold text-[13px] text-white/70 hover:text-white hover:bg-white/10"
                >
                    <Plus size={16} /> Add a card
                </button>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Collapsed Drop Zone Placeholder (Hidden but droppable) */}
      {isCollapsed && <div ref={setDroppableRef} className="absolute inset-0 z-10" />}
    </motion.div>
  );
}
