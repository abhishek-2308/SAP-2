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
} from '@/lib/api';

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

export function useReorderList(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, newPosition }) => reorderList(listId, newPosition),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
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
  return useMutation({
    mutationFn: ({ cardId, sourceListId, targetListId, newPosition }) =>
      moveCard(cardId, sourceListId, targetListId, newPosition),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useDeleteCard(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}
