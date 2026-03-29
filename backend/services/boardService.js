const BoardRepository = require('../repositories/boardRepository');
const queueService = require('./queueService');
const pool = require('../config/db');

const BoardService = {
  async getAllBoards() {
    return BoardRepository.getAll();
  },

  async getBoardById(id) {
    const board = await BoardRepository.getById(id);
    if (!board) throw { status: 404, message: 'Board not found' };
    return board;
  },

  async getBoardDetails(id) {
    const data = await BoardRepository.getBoardDetails(id);
    if (!data.board) throw { status: 404, message: 'Board not found' };
    return data;
  },

  async createBoard(title, background) {
    if (!title || title.trim() === '') {
      throw { status: 400, message: 'Title is required' };
    }
    const maxPos = await BoardRepository.getMaxPosition();
    return BoardRepository.create(title.trim(), background, maxPos + 100);
  },

  async reorderBoard(id, newPosition) {
    const updated = await BoardRepository.move(id, newPosition);
    if (!updated) throw { status: 404, message: 'Board not found' };
    return updated;
  },

  async updateBoard(id, fields) {
    if (fields.title && fields.title.trim() === '') {
      throw { status: 400, message: 'Title cannot be empty' };
    }
    const board = await BoardRepository.update(id, fields);
    if (!board) throw { status: 404, message: 'Board not found' };
    return board;
  },

  async getTrash() {
    return BoardRepository.getTrash();
  },

  async softDeleteBoard(id) {
    const board = await BoardRepository.getById(id);
    if (!board) throw { status: 404, message: 'Board not found' };

    const deleteDate = new Date();
    await BoardRepository.updateLifecycle('board', id, { is_deleted: true, deleted_at: deleteDate });
    
    // Cascade to lists and cards
    await pool.query('UPDATE lists SET is_deleted = true, deleted_at = $1 WHERE board_id = $2', [deleteDate, id]);
    await pool.query(`
      UPDATE cards SET is_deleted = true, deleted_at = $1 
      WHERE list_id IN (SELECT id FROM lists WHERE board_id = $2)
    `, [deleteDate, id]);
    
    return { id, is_deleted: true };
  },

  async restoreBoard(id) {
    // Check if board exists (even if is_deleted = true)
    const { rows } = await pool.query('SELECT * FROM boards WHERE id = $1', [id]);
    const board = rows[0];
    if (!board) throw { status: 404, message: 'Board not found' };

    await BoardRepository.updateLifecycle('board', id, { is_deleted: false, deleted_at: null });
    
    // Cascade restore
    await pool.query('UPDATE lists SET is_deleted = false, deleted_at = null WHERE board_id = $1', [id]);
    await pool.query(`
      UPDATE cards SET is_deleted = false, deleted_at = null 
      WHERE list_id IN (SELECT id FROM lists WHERE board_id = $1)
    `, [id]);

    return { id, is_deleted: false };
  },

  async permanentDeleteBoard(id) {
    const { rows } = await pool.query('SELECT * FROM boards WHERE id = $1', [id]);
    const board = rows[0];
    if (!board) throw { status: 404, message: 'Board not found' };

    try {
      const attachments = await BoardRepository.getAttachmentsForBoard(id);
      const filenames = attachments.map((att) => att.filename);
      if (filenames.length > 0) {
        queueService.add('cleanup-files', { filenames });
      }
    } catch (err) {
      console.error(`⚠️ Queue Error for board ${id}:`, err.message);
    }

    await BoardRepository.delete(id);
  },
};

module.exports = BoardService;
