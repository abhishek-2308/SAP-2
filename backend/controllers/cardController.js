const CardService = require('../services/cardService');

const CardController = {
  async create(req, res, next) {
    try {
      const { listId, title, theme } = req.body;
      const card = await CardService.createCard(listId, title, theme);
      res.status(201).json({ success: true, data: card });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { title, description, due_date, theme } = req.body;
      const card = await CardService.updateCard(req.params.id, { title, description, due_date, theme });
      res.json({ success: true, data: card });
    } catch (err) {
      next(err);
    }
  },

  async move(req, res, next) {
    try {
      const { cardId, sourceListId, targetListId, newPosition } = req.body;
      const card = await CardService.moveCard(cardId, sourceListId, targetListId, newPosition);
      res.json({ success: true, data: card });
    } catch (err) {
      next(err);
    }
  },

  async archive(req, res, next) {
    try {
      const card = await CardService.archiveCard(req.params.id);
      res.json({ success: true, data: card });
    } catch (err) {
      next(err);
    }
  },

  async softDelete(req, res, next) {
    try {
      const card = await CardService.softDeleteCard(req.params.id);
      res.json({ success: true, data: card, message: 'Card moved to trash' });
    } catch (err) {
      next(err);
    }
  },

  async restore(req, res, next) {
    try {
      const card = await CardService.restoreCard(req.params.id);
      res.json({ success: true, data: card, message: 'Card restored' });
    } catch (err) {
      next(err);
    }
  },

  async permanentDelete(req, res, next) {
    try {
      await CardService.permanentDeleteCard(req.params.id);
      res.json({ success: true, message: 'Card permanently deleted' });
    } catch (err) {
      next(err);
    }
  },

  async toggleComplete(req, res, next) {
    try {
      const card = await CardService.toggleComplete(req.params.id);
      res.json({ success: true, data: card });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = CardController;
