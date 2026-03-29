const fs = require('fs');
const path = require('path');
const CardAttachmentRepository = require('../repositories/cardAttachmentRepository');
const CardDetailRepository = require('../repositories/cardDetailRepository');

const CardAttachmentService = {
  async list(cardId) {
    return CardAttachmentRepository.getAttachments(cardId);
  },

  async add(cardId, file) {
    if (!file) throw { status: 400, message: 'File is required' };
    const attachment = await CardAttachmentRepository.addAttachment(cardId, file);
    await CardDetailRepository.logActivity(null, cardId, 'attachment_added', { 
        attachmentId: attachment.id,
        filename: attachment.original_name
    });
    return attachment;
  },

  async delete(attachmentId) {
    const attachment = await CardAttachmentRepository.getById(attachmentId);
    if (!attachment) throw { status: 404, message: 'Attachment not found' };

    // Delete physically
    const filePath = path.join(__dirname, '..', 'uploads', attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await CardAttachmentRepository.deleteAttachment(attachmentId);
    await CardDetailRepository.logActivity(null, attachment.card_id, 'attachment_deleted', { 
        filename: attachment.original_name 
    });
  },
};

module.exports = CardAttachmentService;
