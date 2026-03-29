const CardAttachmentService = require('../services/cardAttachmentService');

const CardAttachmentController = {
  async list(req, res, next) {
    try {
      const { cardId } = req.params;
      const data = await CardAttachmentService.list(parseInt(cardId));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async add(req, res, next) {
    try {
      const { cardId } = req.params;
      const file = req.file;
      const data = await CardAttachmentService.add(parseInt(cardId), file);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      const { attachmentId } = req.params;
      await CardAttachmentService.delete(parseInt(attachmentId));
      res.json({ success: true, message: 'Attachment deleted' });
    } catch (err) { next(err); }
  },
};

module.exports = CardAttachmentController;
