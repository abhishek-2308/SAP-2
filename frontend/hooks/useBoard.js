import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBoards,
  getBoardDetails,
  createBoard,
  deleteBoard,
  updateBoard,
  createList,
  updateList,
  deleteList,
  reorderList,
  createCard,
  updateCard,
  moveCard,
  deleteCard,
  reorderBoard,
  toggleCardComplete,
  toggleListCollapse,
  getTrash,
  restoreBoard,
  restoreList,
  restoreCard,
  permanentDeleteBoard,
  permanentDeleteList,
  permanentDeleteCard,
  archiveCard,
  archiveList,
} from '@/lib/api';

// ─── Lifecycle & Trash ───────────────────────────────────────
export function useTrash() {
  return useQuery({
    queryKey: ['trash'],
    queryFn: getTrash,
  });
}

export function useRestoreEntity(boardId = null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }) => {
      if (type === 'board') return restoreBoard(id);
      if (type === 'list') return restoreList(id);
      return restoreCard(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      if (boardId) queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });
}

export function usePermanentDelete(boardId = null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }) => {
      if (type === 'board') return permanentDeleteBoard(id);
      if (type === 'list') return permanentDeleteList(id);
      return permanentDeleteCard(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
    },
  });
}

export function useArchiveEntity(boardId = null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }) => {
      if (type === 'list') return archiveList(id);
      return archiveCard(id);
    },
    onSuccess: () => {
       if (boardId) queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });
}

// ─── Boards ──────────────────────────────────────────────────
export function useBoards() {
  return useQuery({
    queryKey: ['boards'],
    queryFn: getBoards,
  });
}

export function useBoardDetails(boardId) {
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: () => getBoardDetails(boardId),
    enabled: !!boardId,
  });
}

export function useReorderBoard() {
  const queryClient = useQueryClient();
  const queryKey = ['boards'];

  return useMutation({
    mutationFn: ({ id, newPosition }) => reorderBoard(id, newPosition),
    onMutate: async ({ id, newPosition }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        const newBoards = [...old].map(b => b.id === id ? { ...b, position: newPosition } : b);
        return newBoards.sort((a, b) => a.position - b.position);
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, background }) => createBoard(title, background),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });
}

export function useDeleteBoard(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      if (boardId) queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });
}

export function useUpdateBoard(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fields) => updateBoard(boardId, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });
}

// ─── Lists ───────────────────────────────────────────────────
export function useCreateList(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, theme }) => createList(boardId, title, theme),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useDeleteList(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteList(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useUpdateList(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title, theme }) => updateList(id, title, theme),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useToggleListCollapse(boardId) {
  const queryClient = useQueryClient();
  const queryKey = ['board', boardId];

  return useMutation({
    mutationFn: (id) => toggleListCollapse(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          lists: old.lists.map(l => l.id === id ? { ...l, is_collapsed: !l.is_collapsed } : l)
        };
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

export function useReorderList(boardId) {
  const queryClient = useQueryClient();
  const queryKey = ['board', boardId];

  return useMutation({
    mutationFn: ({ listId, newPosition }) => reorderList(listId, newPosition),
    
    onMutate: async ({ listId, newPosition }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        const newLists = [...old.lists];
        const listIndex = newLists.findIndex((l) => l.id === listId);
        if (listIndex !== -1) {
          newLists[listIndex] = { ...newLists[listIndex], position: newPosition };
          newLists.sort((a, b) => a.position - b.position);
          return { ...old, lists: newLists };
        }
        return old;
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

// ─── Cards ───────────────────────────────────────────────────
export function useCreateCard(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, title, theme }) => createCard(listId, title, theme),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useUpdateCard(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...fields }) => updateCard(id, fields),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useMoveCard(boardId) {
  const queryClient = useQueryClient();
  const queryKey = ['board', boardId];

  return useMutation({
    mutationFn: ({ cardId, sourceListId, targetListId, newPosition }) =>
      moveCard(cardId, sourceListId, targetListId, newPosition),
    
    // 🔀 Step 1: Optimistic UI OnMutate
    onMutate: async ({ cardId, sourceListId, targetListId, newPosition }) => {
      // Cancel refetches to avoid overwriting our update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the data
      const previousData = queryClient.getQueryData(queryKey);

      // Perform local update
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        const newCards = [...old.cards];
        const cardIndex = newCards.findIndex((c) => c.id === cardId);
        
        if (cardIndex !== -1) {
          // Update the card locally
          newCards[cardIndex] = { 
            ...newCards[cardIndex], 
            list_id: targetListId, 
            position: newPosition 
          };
          // Re-sort them by position
          newCards.sort((a, b) => a.position - b.position);
          return { ...old, cards: newCards };
        }
        return old;
      });

      return { previousData };
    },

    // ⏪ Step 2: Rollback On Failure
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    // 🔄 Step 3: Always Sync On Settled
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDeleteCard(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useToggleCardComplete(boardId) {
  const queryClient = useQueryClient();
  const queryKey = ['board', boardId];

  return useMutation({
    mutationFn: (id) => toggleCardComplete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards.map(c => c.id === id ? { ...c, is_completed: !c.is_completed } : c)
        };
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
