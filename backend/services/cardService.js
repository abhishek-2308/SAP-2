const CardRepository = require('../repositories/cardRepository');
const ListRepository = require('../repositories/listRepository');
const CardAttachmentRepository = require('../repositories/cardAttachmentRepository');
const queueService = require('./queueService');
const pool = require('../config/db');

const CardService = {
  async createCard(listId, title, theme) {
    if (!listId) throw { status: 400, message: 'listId is required' };
    if (!title || title.trim() === '') throw { status: 400, message: 'title is required' };

    const list = await ListRepository.getById(listId);
    if (!list) throw { status: 404, message: 'List not found' };

    const maxPos = await CardRepository.getMaxPosition(listId);
    const position = maxPos + 1;

    return CardRepository.create(listId, title.trim(), position, theme);
  },

  async updateCard(id, fields) {
    const card = await CardRepository.getById(id);
    if (!card) throw { status: 404, message: 'Card not found' };
    const updated = await CardRepository.update(id, fields);
    if (!updated) throw { status: 400, message: 'No valid fields to update' };
    return updated;
  },

  /**
   * Move a card between lists or reorder within the same list.
   * Uses a DB transaction to ensure atomicity.
   *
   * Algorithm (LLD §6):
   *  - Between two cards → newPosition = avg of their positions
   *  - Top of a list     → newPosition = position of current top / 2
   *  - Empty list        → newPosition = 1
   */
  async moveCard(cardId, sourceListId, targetListId, newPosition) {
    if (!cardId || !targetListId || newPosition === undefined) {
      throw { status: 400, message: 'cardId, targetListId, and newPosition are required' };
    }

    const card = await CardRepository.getById(cardId);
    if (!card) throw { status: 404, message: 'Card not found' };

    const targetList = await ListRepository.getById(targetListId);
    if (!targetList) throw { status: 404, message: 'Target list not found' };

    // Wrap in transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const updated = await CardRepository.move(cardId, targetListId, newPosition, client);
      await client.query('COMMIT');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async archiveCard(id) {
    const card = await CardRepository.getById(id);
    if (!card) throw { status: 404, message: 'Card not found' };
    return CardRepository.update(id, { is_archived: !card.is_archived });
  },

  async softDeleteCard(id) {
    const card = await CardRepository.getById(id);
    if (!card) throw { status: 404, message: 'Card not found' };
    return CardRepository.update(id, { is_deleted: true, deleted_at: new Date() });
  },

  async restoreCard(id) {
    // Restore even if it's currently marked as deleted
    const { rows } = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);
    const card = rows[0];
    if (!card) throw { status: 404, message: 'Card not found' };
    return CardRepository.update(id, { is_deleted: false, deleted_at: null });
  },

  async permanentDeleteCard(id) {
    // We check the DB directly because it might be marked as is_deleted = true
    const { rows } = await pool.query('SELECT * FROM cards WHERE id = $1', [id]);
    const card = rows[0];
    if (!card) throw { status: 404, message: 'Card not found' };

    try {
      const attachments = await CardAttachmentRepository.getAttachments(id);
      const filenames = attachments.map((att) => att.filename);
      if (filenames.length > 0) {
        queueService.add('cleanup-files', { filenames });
      }
    } catch (err) {
      console.error(`⚠️ Queue Error for card ${id}:`, err.message);
    }

    await CardRepository.delete(id);
  },

  async toggleComplete(id) {
    const card = await CardRepository.getById(id);
    if (!card) throw { status: 404, message: 'Card not found' };

    return CardRepository.update(id, { is_completed: !card.is_completed });
  },
};

module.exports = CardService;
