import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import KanbanList from './KanbanList';
import CardModal from './CardModal';
import useBoardStore from '@/store/boardStore';
import { useCreateList, useDeleteList, useUpdateList, useReorderList, useCreateCard, useDeleteCard, useMoveCard, useUpdateCard } from '@/hooks/useBoard';

export default function KanbanBoard({ boardId, highlightCardIds = null }) {
  const { lists, cards, currentBoard, moveCardOptimistic, rollbackCardMove } = useBoardStore();
  
  const createListMutation = useCreateList(boardId);
  const deleteListMutation = useDeleteList(boardId);
  const updateListMutation = useUpdateList(boardId);
  const reorderListMutation = useReorderList(boardId);
  
  const createCardMutation = useCreateCard(boardId);
  const deleteCardMutation = useDeleteCard(boardId);
  const moveCardMutation = useMoveCard(boardId);
  const updateCardMutation = useUpdateCard(boardId);

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
      let newPosition;

      if (overIndex === 0) {
        newPosition = lists[0].position / 2;
      } else if (overIndex === lists.length - 1) {
        newPosition = lists[lists.length - 1].position + 1;
      } else {
        const activeIdx = lists.findIndex(l => l.id === activeList.id);
        if (activeIdx < overIndex) {
          // Dragging forward
          newPosition = (lists[overIndex].position + (lists[overIndex + 1]?.position || lists[overIndex].position + 1)) / 2;
        } else {
          // Dragging backward
          newPosition = (lists[overIndex - 1].position + lists[overIndex].position) / 2;
        }
      }

      try {
        await reorderListMutation.mutateAsync({ listId: activeList.id, newPosition });
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
      let newPosition = 1.0;

      if (overType === 'list') {
        targetListId = over.data.current.listId;
        const targetCards = cards[targetListId] || [];
        newPosition = targetCards.length > 0 ? targetCards[targetCards.length - 1].position + 1 : 1.0;
      } else if (overType === 'card') {
        const overCard = over.data.current.card;
        targetListId = overCard.list_id;
        const targetCards = cards[targetListId] || [];
        const overIndex = targetCards.findIndex((c) => c.id === overCard.id);
        
        if (overIndex === 0) newPosition = targetCards[0].position / 2;
        else if (overIndex === targetCards.length - 1) newPosition = targetCards[targetCards.length - 1].position + 1;
        else newPosition = (targetCards[overIndex - 1].position + targetCards[overIndex].position) / 2;
      }

      if (!targetListId) return;
      if (activeCardObj.list_id === targetListId && activeCardObj.position === newPosition) return;

      const originalCards = { ...cards };
      moveCardOptimistic(activeId, activeCardObj.list_id, targetListId, newPosition);
      
      try {
        await moveCardMutation.mutateAsync({ cardId: activeId, sourceListId: activeCardObj.list_id, targetListId, newPosition });
      } catch {
        rollbackCardMove(originalCards);
        toast.error('Sync failed.');
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
                highlightCardIds={highlightCardIds}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        <div className="flex-shrink-0 w-72">
          {addingList ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#ebedf0] p-4 rounded-2xl border border-slate-300 space-y-3 shadow-xl">
              <input 
                autoFocus 
                type="text" 
                value={newListTitle} 
                onChange={e => setNewListTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && newListTitle.trim() && (createListMutation.mutateAsync({ title: newListTitle.trim() }), setNewListTitle(''), setAddingList(false))}
                className="w-full bg-white px-3 py-2 rounded-lg border-2 border-transparent focus:border-blue-600 outline-none text-sm font-bold shadow-inner" 
                placeholder="List Title..." 
              />
              <div className="flex gap-2">
                <button onClick={() => newListTitle.trim() && (createListMutation.mutateAsync({ title: newListTitle.trim() }), setNewListTitle(''), setAddingList(false))} className="btn btn-primary flex-1 font-black uppercase tracking-widest text-[10px]">Add List</button>
                <button onClick={() => setAddingList(false)} className="btn btn-ghost px-2 text-slate-500 hover:text-slate-900"><X size={20}/></button>
              </div>
            </motion.div>
          ) : (
            <button onClick={() => setAddingList(true)} className="w-full h-12 bg-black/5 hover:bg-black/10 text-slate-700 font-black uppercase tracking-widest px-4 rounded-xl text-[11px] border-2 border-dashed border-slate-300 flex items-center justify-center gap-2 transition-all hover:border-slate-400 active:scale-[0.98]">
              <Plus size={18} /> Add another list
            </button>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {draggingCard && (
          <div className="bg-white rounded-xl p-4 text-slate-800 text-[14px] font-black shadow-2xl border-2 border-blue-600 w-64 rotate-3 ring-4 ring-blue-600/20">
            {draggingCard.title}
          </div>
        )}
        {draggingList && (
           <div className="flex-shrink-0 w-72 h-32 rounded-2xl bg-white/80 backdrop-blur-md border-2 border-blue-600 shadow-2xl flex items-center justify-center text-blue-700 font-black uppercase tracking-tighter text-lg rotate-2">
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
          />
        )}
      </AnimatePresence>
    </DndContext>
  );
}
