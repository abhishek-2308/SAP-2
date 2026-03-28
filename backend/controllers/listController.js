const ListService = require('../services/listService');

const ListController = {
  async create(req, res, next) {
    try {
      const { boardId, title } = req.body;
      const list = await ListService.createList(boardId, title);
      res.status(201).json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const list = await ListService.updateList(req.params.id, req.body.title);
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

  async delete(req, res, next) {
    try {
      await ListService.deleteList(req.params.id);
      res.json({ success: true, message: 'List deleted' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ListController;
