import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import KanbanList from './KanbanList';
import CardModal from './CardModal';
import useBoardStore from '@/store/boardStore';
import { useCreateList, useDeleteList, useUpdateList, useReorderList, useCreateCard, useDeleteCard, useMoveCard, useUpdateCard, useToggleCardComplete, useToggleListCollapse, useArchiveEntity } from '@/hooks/useBoard';

import { calculateNewPosition } from '@/lib/orderUtils';

export default function KanbanBoard({ boardId, highlightCardIds = null }) {
  const { lists, cards, currentBoard } = useBoardStore();
  
  const createListMutation = useCreateList(boardId);
  const deleteListMutation = useDeleteList(boardId);
  const updateListMutation = useUpdateList(boardId);
  const reorderListMutation = useReorderList(boardId);
  
  const createCardMutation = useCreateCard(boardId);
  const deleteCardMutation = useDeleteCard(boardId);
  const moveCardMutation = useMoveCard(boardId);
  const updateCardMutation = useUpdateCard(boardId);
  const toggleCardCompleteMutation = useToggleCardComplete(boardId);
  const toggleListCollapseMutation = useToggleListCollapse(boardId);
  const archiveEntityMutation = useArchiveEntity(boardId);

  const [activeCard, setActiveCard] = useState(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [draggingCard, setDraggingCard] = useState(null);
  const [draggingList, setDraggingList] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event) {
    const { active } = event;
    const type = active.data.current?.type;
    
    if (type === 'card') {
      setDraggingCard(active.data.current.card);
    } else if (type === 'list') {
      setDraggingList(active.data.current.list);
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setDraggingCard(null);
    setDraggingList(null);
    
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // --- 1. Handle List Reordering ---
    if (activeType === 'list') {
      const activeList = active.data.current.list;
      const overList = over.data.current.list;
      
      if (!overList || activeList.id === overList.id) return;

      const overIndex = lists.findIndex(l => l.id === overList.id);
      const prevList = lists[overIndex - 1];
      const nextList = lists[overIndex + 1];

      // Calculate position based on relative neighbors
      let newPosition;
      const activeIdx = lists.findIndex(l => l.id === activeList.id);
      
      if (activeIdx < overIndex) {
        // Dragging forward
        newPosition = calculateNewPosition(lists[overIndex].position, lists[overIndex + 1]?.position);
      } else {
        // Dragging backward
        newPosition = calculateNewPosition(lists[overIndex - 1]?.position, lists[overIndex].position);
      }

      try {
        reorderListMutation.mutate({ listId: activeList.id, newPosition });
        toast.success('List repositioned');
      } catch {
        toast.error('Failed to move list');
      }
      return;
    }

    // --- 2. Handle Card Moving ---
    if (activeType === 'card') {
      const activeId = String(active.id).replace('card-', '');
      const activeCardObj = active.data.current.card;
      let targetListId;
      let newPosition;

      if (overType === 'list') {
        targetListId = over.data.current.listId;
        const targetCards = cards[targetListId] || [];
        newPosition = calculateNewPosition(targetCards[targetCards.length - 1]?.position);
      } else if (overType === 'card') {
        const overCard = over.data.current.card;
        targetListId = overCard.list_id;
        const targetCards = cards[targetListId] || [];
        const overIndex = targetCards.findIndex((c) => c.id === overCard.id);
        
        // If dropping on itself or no change
        if (activeId === String(overCard.id)) return;

        const activeIdx = targetCards.findIndex(c => String(c.id) === activeId);
        if (activeIdx !== -1 && activeIdx < overIndex) {
          // Same list, moving down
          newPosition = calculateNewPosition(targetCards[overIndex].position, targetCards[overIndex + 1]?.position);
        } else {
          // Different list or moving up
          newPosition = calculateNewPosition(targetCards[overIndex - 1]?.position, targetCards[overIndex].position);
        }
      }

      if (!targetListId) return;
      
      try {
        moveCardMutation.mutate({ 
          cardId: parseInt(activeId), 
          sourceListId: activeCardObj.list_id, 
          targetListId, 
          newPosition 
        });
      } catch (err) {
        toast.error('Failed to move card');
      }
    }
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: '0.5' },
      },
    }),
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex p-6 gap-6 items-start h-full overflow-x-auto overflow-y-hidden scroll-smooth pb-10">
        <SortableContext items={lists.map(l => `list-${l.id}`)} strategy={horizontalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {lists.map((list) => (
              <KanbanList
                key={list.id}
                list={list}
                cards={cards[list.id] || []}
                onAddCard={(l, t) => createCardMutation.mutateAsync({ listId: l, title: t })}
                onDeleteList={id => deleteListMutation.mutateAsync(id)}
                onUpdateList={(id, fields) => updateListMutation.mutateAsync({ id, ...fields })}
                onOpenModal={setActiveCard}
                onDeleteCard={id => deleteCardMutation.mutateAsync(id)}
                onUpdateCardTheme={(cardId, theme) => updateCardMutation.mutateAsync({ id: cardId, theme })}
                onToggleComplete={id => toggleCardCompleteMutation.mutateAsync(id)}
                onToggleCollapse={id => toggleListCollapseMutation.mutateAsync(id)}
                onArchive={id => archiveEntityMutation.mutateAsync({ type: 'list', id })}
                highlightCardIds={highlightCardIds}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        <div className="flex-shrink-0 w-72">
          {addingList ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/20 dark:bg-black/30 backdrop-blur-xl p-4 rounded-2xl border border-white/25 space-y-3 shadow-xl">
              <input 
                autoFocus 
                type="text" 
                value={newListTitle} 
                onChange={e => setNewListTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && newListTitle.trim() && (createListMutation.mutateAsync({ title: newListTitle.trim() }), setNewListTitle(''), setAddingList(false))}
                className="w-full bg-white/20 text-white placeholder:text-white/50 px-3 py-2 rounded-lg border border-white/20 focus:border-white/60 outline-none text-sm font-bold shadow-inner" 
                placeholder="List Title..." 
              />
              <div className="flex gap-2">
                <button onClick={() => newListTitle.trim() && (createListMutation.mutateAsync({ title: newListTitle.trim() }), setNewListTitle(''), setAddingList(false))} className="flex-1 bg-white/90 hover:bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] py-2 rounded-lg transition-all">Add List</button>
                <button onClick={() => setAddingList(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"><X size={20}/></button>
              </div>
            </motion.div>
          ) : (
            <button onClick={() => setAddingList(true)} className="w-full h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/80 hover:text-white font-black uppercase tracking-widest px-4 rounded-xl text-[11px] border-2 border-dashed border-white/20 hover:border-white/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <Plus size={18} /> Add another list
            </button>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {draggingCard && (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 text-slate-900 dark:text-white text-[14px] font-black shadow-2xl border-2 border-white w-64 rotate-2 ring-4 ring-white/30">
            {draggingCard.title}
          </div>
        )}
        {draggingList && (
           <div className="flex-shrink-0 w-72 h-32 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-white/40 shadow-2xl flex items-center justify-center text-white font-black uppercase tracking-tighter text-lg rotate-2">
              {draggingList.title}
           </div>
        )}
      </DragOverlay>

      <AnimatePresence>
        {activeCard && (
          <CardModal 
            card={activeCard} 
            onClose={() => setActiveCard(null)} 
            onDelete={async (id) => { await deleteCardMutation.mutateAsync(id); setActiveCard(null); }}
            onSave={async fields => { await updateCardMutation.mutateAsync({ id: activeCard.id, ...fields }); setActiveCard(null); }} 
            onArchive={id => archiveEntityMutation.mutateAsync({ type: 'card', id })}
          />
        )}
      </AnimatePresence>
    </DndContext>
  );
}
