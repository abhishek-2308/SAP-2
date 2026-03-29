import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ─── Boards ──────────────────────────────────────────────────
export const getBoards = () => api.get('/boards').then((r) => r.data.data);
export const createBoard = (title, background) => api.post('/boards', { title, background }).then((r) => r.data.data);
export const updateBoard = (id, fields) => api.patch(`/boards/${id}`, fields).then((r) => r.data.data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`); // Soft delete
export const reorderBoard = (id, newPosition) => api.patch(`/boards/${id}/reorder`, { newPosition }).then((r) => r.data.data);
export const getBoardDetails = (id) => api.get(`/boards/${id}/details`).then((r) => r.data.data);
export const getTrash = () => api.get('/boards/trash').then((r) => r.data.data);
export const restoreBoard = (id) => api.patch(`/boards/${id}/restore`).then((r) => r.data.data);
export const permanentDeleteBoard = (id) => api.delete(`/boards/${id}/permanent`);

// ─── Lists ───────────────────────────────────────────────────
export const createList = (boardId, title, theme) =>
  api.post('/lists', { boardId, title, theme }).then((r) => r.data.data);
export const updateList = (id, title, theme) =>
  api.patch(`/lists/${id}`, { title, theme }).then((r) => r.data.data);
export const reorderList = (listId, newPosition) =>
  api.post('/lists/reorder', { listId, newPosition }).then((r) => r.data.data);
export const deleteList = (id) => api.delete(`/lists/${id}`); // Soft delete
export const toggleListCollapse = (id) => api.patch(`/lists/${id}/toggle-collapse`).then((r) => r.data.data);
export const archiveList = (id) => api.patch(`/lists/${id}/archive`).then((r) => r.data.data);
export const restoreList = (id) => api.patch(`/lists/${id}/restore`).then((r) => r.data.data);
export const permanentDeleteList = (id) => api.delete(`/lists/${id}/permanent`);

// ─── Cards ───────────────────────────────────────────────────
export const createCard = (listId, title, theme) =>
  api.post('/cards', { listId, title, theme }).then((r) => r.data.data);
export const updateCard = (id, fields) =>
  api.patch(`/cards/${id}`, fields).then((r) => r.data.data);
export const moveCard = (cardId, sourceListId, targetListId, newPosition) =>
  api.post('/cards/move', { cardId, sourceListId, targetListId, newPosition }).then((r) => r.data.data);
export const deleteCard = (id) => api.delete(`/cards/${id}`); // Soft delete
export const archiveCard = (id) => api.patch(`/cards/${id}/archive`).then((r) => r.data.data);
export const restoreCard = (id) => api.patch(`/cards/${id}/restore`).then((r) => r.data.data);
export const permanentDeleteCard = (id) => api.delete(`/cards/${id}/permanent`);
export const toggleCardComplete = (id) => api.patch(`/cards/${id}/toggle-complete`).then((r) => r.data.data);

// ─── Card Details (Labels, Members, Checklists) ──────────────
export const getAllLabels = () => api.get('/card-details/labels').then((r) => r.data.data);
export const getCardLabels = (cardId) => api.get(`/card-details/${cardId}/labels`).then((r) => r.data.data);
export const addCardLabel = (cardId, labelId) => api.post(`/card-details/${cardId}/add-label`, { labelId }).then((r) => r.data.data);
export const removeCardLabel = (cardId, labelId) => api.delete(`/card-details/${cardId}/labels/${labelId}`);

export const getAllUsers = () => api.get('/card-details/users').then((r) => r.data.data);
export const getCardMembers = (cardId) => api.get(`/card-details/${cardId}/members`).then((r) => r.data.data);
export const assignCardMember = (cardId, userId) => api.post(`/card-details/${cardId}/assign-member`, { userId }).then((r) => r.data.data);
export const removeCardMember = (cardId, userId) => api.delete(`/card-details/${cardId}/members/${userId}`);

export const getCardChecklists = (cardId) => api.get(`/card-details/${cardId}/checklists`).then((r) => r.data.data);
export const createChecklist = (cardId, title) => api.post(`/card-details/${cardId}/checklists`, { title }).then((r) => r.data.data);
export const deleteChecklist = (checklistId) => api.delete(`/card-details/checklists/${checklistId}`);
export const addChecklistItem = (checklistId, content) => api.post(`/card-details/checklists/${checklistId}/items`, { content }).then((r) => r.data.data);
export const toggleChecklistItem = (itemId) => api.patch(`/card-details/checklist-items/${itemId}/toggle`).then((r) => r.data.data);
export const deleteChecklistItem = (itemId) => api.delete(`/card-details/checklist-items/${itemId}`);

export const searchCards = (boardId, q, filters = {}) => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (filters.labelId) params.set('labelId', filters.labelId);
  if (filters.memberId) params.set('memberId', filters.memberId);
  if (filters.hasDueDate) params.set('hasDueDate', 'true');
  if (filters.overdue) params.set('overdue', 'true');
  return api.get(`/card-details/search/${boardId}?${params.toString()}`).then((r) => r.data.data);
};

export const getActivities = (boardId, cardId = null) => {
  const url = boardId ? `/card-details/activities/${boardId}` : '/card-details/activities';
  const params = cardId ? `?cardId=${cardId}` : '';
  return api.get(url + params).then((r) => r.data.data);
};

// ─── Attachments ─────────────────────────────────────────
export const getAttachments = (cardId) => api.get(`/attachments/${cardId}`).then((r) => r.data.data);
export const uploadAttachment = (cardId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/attachments/${cardId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((r) => r.data.data);
};
export const deleteAttachment = (attachmentId) => api.delete(`/attachments/${attachmentId}`).then((r) => r.data.data);

export default api;
