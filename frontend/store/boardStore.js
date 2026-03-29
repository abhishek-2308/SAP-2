import { create } from 'zustand';

const useBoardStore = create((set, get) => ({
  // ─── State ────────────────────────────────────────────────
  boards: [],
  currentBoard: null,
  lists: [],
  cards: {},        // keyed by listId: { [listId]: Card[] }
  isLoading: false,
  error: null,

  // ─── Board Actions ────────────────────────────────────────
  setBoards: (boards) => set({ boards }),
  addBoard: (board) => set((s) => ({ boards: [board, ...s.boards] })),
  removeBoard: (id) => set((s) => ({ boards: s.boards.filter((b) => b.id !== id) })),

  // ─── Current Board ────────────────────────────────────────
  setBoardData: ({ board, lists, cards }) => {
    // Group cards by list_id for O(1) lookup
    const grouped = {};
    lists.forEach((l) => { grouped[l.id] = []; });
    cards.forEach((c) => {
      if (!grouped[c.list_id]) grouped[c.list_id] = [];
      grouped[c.list_id].push(c);
    });
    set({ currentBoard: board, lists, cards: grouped });
  },

  // ─── List Actions ─────────────────────────────────────────
  addList: (list) => {
    set((s) => ({
      lists: [...s.lists, list],
      cards: { ...s.cards, [list.id]: [] },
    }));
  },
  removeList: (id) => {
    set((s) => {
      const newCards = { ...s.cards };
      delete newCards[id];
      return { lists: s.lists.filter((l) => l.id !== id), cards: newCards };
    });
  },

  // ─── Card Actions ─────────────────────────────────────────
  addCard: (card) => {
    set((s) => ({
      cards: {
        ...s.cards,
        [card.list_id]: [...(s.cards[card.list_id] || []), card],
      },
    }));
  },
  updateCard: (updatedCard) => {
    set((s) => ({
      cards: {
        ...s.cards,
        [updatedCard.list_id]: s.cards[updatedCard.list_id]?.map((c) =>
          c.id === updatedCard.id ? updatedCard : c
        ) || [],
      },
    }));
  },
  removeCard: (cardId, listId) => {
    set((s) => ({
      cards: {
        ...s.cards,
        [listId]: (s.cards[listId] || []).filter((c) => c.id !== cardId),
      },
    }));
  },

  // ─── Optimistic Move (DND) ────────────────────────────────
  moveCardOptimistic: (cardId, sourceListId, targetListId, newPosition) => {
    set((s) => {
      const sourceCards = [...(s.cards[sourceListId] || [])];
      const card = sourceCards.find((c) => c.id === cardId);
      if (!card) return s;

      const updatedCard = { ...card, list_id: targetListId, position: newPosition };
      const newSourceCards = sourceCards.filter((c) => c.id !== cardId);
      const newTargetCards = [...(s.cards[targetListId] || []), updatedCard].sort(
        (a, b) => a.position - b.position
      );

      return {
        cards: {
          ...s.cards,
          [sourceListId]: newSourceCards,
          [targetListId]: newTargetCards,
        },
      };
    });
  },

  // ─── Rollback (on API failure) ────────────────────────────
  rollbackCardMove: (originalCards) => set({ cards: originalCards }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

export default useBoardStore;
