const ListService = require('../services/listService');

const ListController = {
  async create(req, res, next) {
    try {
      const { boardId, title, theme } = req.body;
      const list = await ListService.createList(boardId, title, theme);
      res.status(201).json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const list = await ListService.updateList(req.params.id, req.body.title, req.body.theme);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async reorder(req, res, next) {
    try {
      const { listId, newPosition } = req.body;
      const list = await ListService.reorderList(listId, newPosition);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async archive(req, res, next) {
    try {
      const list = await ListService.archiveList(req.params.id);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async softDelete(req, res, next) {
    try {
      await ListService.softDeleteList(req.params.id);
      res.json({ success: true, message: 'List moved to trash' });
    } catch (err) {
      next(err);
    }
  },

  async restore(req, res, next) {
    try {
      const list = await ListService.restoreList(req.params.id);
      res.json({ success: true, data: list, message: 'List restored' });
    } catch (err) {
      next(err);
    }
  },

  async permanentDelete(req, res, next) {
    try {
      await ListService.permanentDeleteList(req.params.id);
      res.json({ success: true, message: 'List permanently deleted' });
    } catch (err) {
      next(err);
    }
  },

  async toggleCollapse(req, res, next) {
    try {
      const list = await ListService.toggleCollapse(req.params.id);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ListController;
