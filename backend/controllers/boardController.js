const BoardService = require('../services/boardService');

const BoardController = {
  async getAll(req, res, next) {
    try {
      const boards = await BoardService.getAllBoards();
      res.json({ success: true, data: boards });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const board = await BoardService.getBoardById(req.params.id);
      res.json({ success: true, data: board });
    } catch (err) {
      next(err);
    }
  },

  async getDetails(req, res, next) {
    try {
      const data = await BoardService.getBoardDetails(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const board = await BoardService.createBoard(req.body.title, req.body.background);
      res.status(201).json({ success: true, data: board });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const board = await BoardService.updateBoard(req.params.id, req.body);
      res.json({ success: true, data: board });
    } catch (err) {
      next(err);
    }
  },

  async softDelete(req, res, next) {
    try {
      await BoardService.softDeleteBoard(req.params.id);
      res.json({ success: true, message: 'Board moved to trash' });
    } catch (err) {
      next(err);
    }
  },

  async restore(req, res, next) {
    try {
      const board = await BoardService.restoreBoard(req.params.id);
      res.json({ success: true, data: board, message: 'Board restored' });
    } catch (err) {
      next(err);
    }
  },

  async permanentDelete(req, res, next) {
    try {
      await BoardService.permanentDeleteBoard(req.params.id);
      res.json({ success: true, message: 'Board permanently deleted' });
    } catch (err) {
      next(err);
    }
  },

  async getTrash(req, res, next) {
    try {
      const trash = await BoardService.getTrash();
      res.json({ success: true, data: trash });
    } catch (err) {
      next(err);
    }
  },

  async reorder(req, res, next) {
    try {
      const { newPosition } = req.body;
      const board = await BoardService.reorderBoard(req.params.id, newPosition);
      res.json({ success: true, data: board });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = BoardController;
