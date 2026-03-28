const CardDetailRepository = require('../repositories/cardDetailRepository');
const CardRepository = require('../repositories/cardRepository');

const CardDetailService = {
  // ─── Labels ────────────────────────────────────────────────
  async getLabels(cardId) {
    return CardDetailRepository.getLabels(cardId);
  },

  async getAllLabels() {
    return CardDetailRepository.getAllLabels();
  },

  async addLabel(cardId, labelId) {
    const card = await CardRepository.getById(cardId);
    if (!card) throw { status: 404, message: 'Card not found' };
    const result = await CardDetailRepository.addLabel(cardId, labelId);
    // Log activity
    await CardDetailRepository.logActivity(null, cardId, 'label_added', { labelId });
    return result;
  },

  async removeLabel(cardId, labelId) {
    await CardDetailRepository.removeLabel(cardId, labelId);
    await CardDetailRepository.logActivity(null, cardId, 'label_removed', { labelId });
  },

  // ─── Members ──────────────────────────────────────────────
  async getMembers(cardId) {
    return CardDetailRepository.getMembers(cardId);
  },

  async getAllUsers() {
    return CardDetailRepository.getAllUsers();
  },

  async assignMember(cardId, userId) {
    const card = await CardRepository.getById(cardId);
    if (!card) throw { status: 404, message: 'Card not found' };
    if (!userId) throw { status: 400, message: 'userId is required' };
    const result = await CardDetailRepository.assignMember(cardId, userId);
    await CardDetailRepository.logActivity(null, cardId, 'member_assigned', { userId });
    return result;
  },

  async removeMember(cardId, userId) {
    await CardDetailRepository.removeMember(cardId, userId);
    await CardDetailRepository.logActivity(null, cardId, 'member_removed', { userId });
  },

  // ─── Checklists ───────────────────────────────────────────
  async getChecklists(cardId) {
    return CardDetailRepository.getChecklists(cardId);
  },

  async createChecklist(cardId, title) {
    const card = await CardRepository.getById(cardId);
    if (!card) throw { status: 404, message: 'Card not found' };
    if (!title || !title.trim()) throw { status: 400, message: 'title is required' };
    const checklist = await CardDetailRepository.createChecklist(cardId, title.trim());
    await CardDetailRepository.logActivity(null, cardId, 'checklist_created', { title });
    return checklist;
  },

  async deleteChecklist(checklistId) {
    await CardDetailRepository.deleteChecklist(checklistId);
  },

  async addChecklistItem(checklistId, content) {
    if (!content || !content.trim()) throw { status: 400, message: 'content is required' };
    return CardDetailRepository.addChecklistItem(checklistId, content.trim());
  },

  async toggleChecklistItem(itemId) {
    const item = await CardDetailRepository.toggleChecklistItem(itemId);
    if (!item) throw { status: 404, message: 'Checklist item not found' };
    return item;
  },

  async deleteChecklistItem(itemId) {
    await CardDetailRepository.deleteChecklistItem(itemId);
  },

  // ─── Activities ───────────────────────────────────────────
  async getActivities(boardId) {
    return CardDetailRepository.getActivities(boardId);
  },

  // ─── Search & Filter ─────────────────────────────────────
  async searchCards(boardId, query, filters) {
    if (!boardId) throw { status: 400, message: 'boardId is required' };
    return CardDetailRepository.searchCards(boardId, query, filters);
  },
};

module.exports = CardDetailService;
