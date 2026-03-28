const CardRepository = require('../repositories/cardRepository');
const ListRepository = require('../repositories/listRepository');
const pool = require('../config/db');

const CardService = {
  async createCard(listId, title) {
    if (!listId) throw { status: 400, message: 'listId is required' };
    if (!title || title.trim() === '') throw { status: 400, message: 'title is required' };

    const list = await ListRepository.getById(listId);
    if (!list) throw { status: 404, message: 'List not found' };

    const maxPos = await CardRepository.getMaxPosition(listId);
    const position = maxPos + 1;

    return CardRepository.create(listId, title.trim(), position);
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

  async deleteCard(id) {
    const card = await CardRepository.getById(id);
    if (!card) throw { status: 404, message: 'Card not found' };
    await CardRepository.delete(id);
  },
};

module.exports = CardService;
