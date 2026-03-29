import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBoards,
  getBoardDetails,
  createBoard,
  deleteBoard,
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
    mutationFn: ({ title }) => createBoard(title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteBoard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });
}

// ─── Lists ───────────────────────────────────────────────────
export function useCreateList(boardId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title }) => createList(boardId, title),
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
    mutationFn: ({ id, title }) => updateList(id, title),
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
    mutationFn: ({ listId, title }) => createCard(listId, title),
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
