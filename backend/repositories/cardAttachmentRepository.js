const pool = require('../config/db');

const CardAttachmentRepository = {
  async getAttachments(cardId) {
    const { rows } = await pool.query(
      'SELECT * FROM attachments WHERE card_id = $1 ORDER BY created_at DESC',
      [cardId]
    );
    return rows;
  },

  async addAttachment(cardId, attachment) {
    const { rows } = await pool.query(
      `INSERT INTO attachments (card_id, filename, original_name, mime_type, size) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [cardId, attachment.filename, attachment.originalname, attachment.mimetype, attachment.size]
    );
    return rows[0];
  },

  async deleteAttachment(attachmentId) {
    const { rows } = await pool.query(
      'DELETE FROM attachments WHERE id = $1 RETURNING *',
      [attachmentId]
    );
    return rows[0];
  },

  async getById(id) {
    const { rows } = await pool.query('SELECT * FROM attachments WHERE id = $1', [id]);
    return rows[0];
  },
};

module.exports = CardAttachmentRepository;
