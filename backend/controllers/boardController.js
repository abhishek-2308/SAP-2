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
      const board = await BoardService.createBoard(req.body.title);
      res.status(201).json({ success: true, data: board });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const board = await BoardService.updateBoard(req.params.id, req.body.title);
      res.json({ success: true, data: board });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await BoardService.deleteBoard(req.params.id);
      res.json({ success: true, message: 'Board deleted' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = BoardController;
