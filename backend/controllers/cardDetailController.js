const CardDetailService = require('../services/cardDetailService');

const CardDetailController = {
  // ─── Labels ────────────────────────────────────────────────
  async getLabels(req, res, next) {
    try {
      const labels = await CardDetailService.getLabels(req.params.cardId);
      res.json({ success: true, data: labels });
    } catch (err) { next(err); }
  },

  async getAllLabels(req, res, next) {
    try {
      const labels = await CardDetailService.getAllLabels();
      res.json({ success: true, data: labels });
    } catch (err) { next(err); }
  },

  async addLabel(req, res, next) {
    try {
      const result = await CardDetailService.addLabel(
        parseInt(req.params.cardId), parseInt(req.body.labelId)
      );
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async removeLabel(req, res, next) {
    try {
      await CardDetailService.removeLabel(
        parseInt(req.params.cardId), parseInt(req.params.labelId)
      );
      res.json({ success: true, message: 'Label removed' });
    } catch (err) { next(err); }
  },

  // ─── Members ──────────────────────────────────────────────
  async getMembers(req, res, next) {
    try {
      const members = await CardDetailService.getMembers(req.params.cardId);
      res.json({ success: true, data: members });
    } catch (err) { next(err); }
  },

  async getAllUsers(req, res, next) {
    try {
      const users = await CardDetailService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (err) { next(err); }
  },

  async assignMember(req, res, next) {
    try {
      const result = await CardDetailService.assignMember(
        parseInt(req.params.cardId), parseInt(req.body.userId)
      );
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async removeMember(req, res, next) {
    try {
      await CardDetailService.removeMember(
        parseInt(req.params.cardId), parseInt(req.params.userId)
      );
      res.json({ success: true, message: 'Member removed' });
    } catch (err) { next(err); }
  },

  // ─── Checklists ───────────────────────────────────────────
  async getChecklists(req, res, next) {
    try {
      const data = await CardDetailService.getChecklists(req.params.cardId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async createChecklist(req, res, next) {
    try {
      const checklist = await CardDetailService.createChecklist(
        parseInt(req.params.cardId), req.body.title
      );
      res.status(201).json({ success: true, data: checklist });
    } catch (err) { next(err); }
  },

  async deleteChecklist(req, res, next) {
    try {
      await CardDetailService.deleteChecklist(parseInt(req.params.checklistId));
      res.json({ success: true, message: 'Checklist deleted' });
    } catch (err) { next(err); }
  },

  async addChecklistItem(req, res, next) {
    try {
      const item = await CardDetailService.addChecklistItem(
        parseInt(req.params.checklistId), req.body.content
      );
      res.status(201).json({ success: true, data: item });
    } catch (err) { next(err); }
  },

  async toggleChecklistItem(req, res, next) {
    try {
      const item = await CardDetailService.toggleChecklistItem(parseInt(req.params.itemId));
      res.json({ success: true, data: item });
    } catch (err) { next(err); }
  },

  async deleteChecklistItem(req, res, next) {
    try {
      await CardDetailService.deleteChecklistItem(parseInt(req.params.itemId));
      res.json({ success: true, message: 'Item deleted' });
    } catch (err) { next(err); }
  },

  // ─── Activities ───────────────────────────────────────────
  async getActivities(req, res, next) {
    try {
      const { boardId } = req.params;
      const { cardId } = req.query;
      const data = await CardDetailService.getActivities(
        boardId ? parseInt(boardId) : null,
        cardId ? parseInt(cardId) : null
      );
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // ─── Search ───────────────────────────────────────────────
  async search(req, res, next) {
    try {
      const { boardId } = req.params;
      const { q, labelId, memberId, hasDueDate, overdue } = req.query;
      const results = await CardDetailService.searchCards(
        parseInt(boardId), q, { labelId, memberId, hasDueDate, overdue }
      );
      res.json({ success: true, data: results });
    } catch (err) { next(err); }
  },
};

module.exports = CardDetailController;
