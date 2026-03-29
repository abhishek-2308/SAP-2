const ListRepository = require('../repositories/listRepository');
const BoardRepository = require('../repositories/boardRepository');
const pool = require('../config/db');

const ListService = {
  async createList(boardId, title, theme) {
    if (!boardId) throw { status: 400, message: 'boardId is required' };
    if (!title || title.trim() === '') throw { status: 400, message: 'title is required' };

    const board = await BoardRepository.getById(boardId);
    if (!board) throw { status: 404, message: 'Board not found' };

    const maxPos = await ListRepository.getMaxPosition(boardId);
    const position = maxPos + 1;

    return ListRepository.create(boardId, title.trim(), position, theme);
  },

  async updateList(id, title, theme) {
    if (!title || title.trim() === '') throw { status: 400, message: 'title is required' };
    const list = await ListRepository.update(id, { title: title.trim(), theme });
    if (!list) throw { status: 404, message: 'List not found' };
    return list;
  },

  async toggleCollapse(id) {
    const list = await ListRepository.getById(id);
    if (!list) throw { status: 404, message: 'List not found' };
    
    return ListRepository.update(id, { is_collapsed: !list.is_collapsed });
  },

  async reorderList(listId, newPosition) {
    if (newPosition === undefined || newPosition === null) {
      throw { status: 400, message: 'newPosition is required' };
    }
    const list = await ListRepository.reorder(listId, newPosition);
    if (!list) throw { status: 404, message: 'List not found' };
    return list;
  },

  async archiveList(id) {
    const list = await ListRepository.getById(id);
    if (!list) throw { status: 404, message: 'List not found' };
    return ListRepository.update(id, { is_archived: !list.is_archived });
  },

  async softDeleteList(id) {
    const list = await ListRepository.getById(id);
    if (!list) throw { status: 404, message: 'List not found' };
    
    const deleteDate = new Date();
    await BoardRepository.updateLifecycle('list', id, { is_deleted: true, deleted_at: deleteDate });
    
    // Cascade to cards
    await pool.query('UPDATE cards SET is_deleted = true, deleted_at = $1 WHERE list_id = $2', [deleteDate, id]);
    
    return { id, is_deleted: true };
  },

  async restoreList(id) {
    const { rows } = await pool.query('SELECT * FROM lists WHERE id = $1', [id]);
    const list = rows[0];
    if (!list) throw { status: 404, message: 'List not found' };

    await BoardRepository.updateLifecycle('list', id, { is_deleted: false, deleted_at: null });
    await pool.query('UPDATE cards SET is_deleted = false, deleted_at = null WHERE list_id = $1', [id]);

    return { id, is_deleted: false };
  },

  async permanentDeleteList(id) {
    const { rows } = await pool.query('SELECT * FROM lists WHERE id = $1', [id]);
    const list = rows[0];
    if (!list) throw { status: 404, message: 'List not found' };

    await ListRepository.delete(id);
  },
};

module.exports = ListService;
