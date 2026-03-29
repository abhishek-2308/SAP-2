const ListRepository = require('../repositories/listRepository');
const BoardRepository = require('../repositories/boardRepository');

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
    const list = await ListRepository.update(id, title.trim(), theme);
    if (!list) throw { status: 404, message: 'List not found' };
    return list;
  },

  async reorderList(listId, newPosition) {
    if (newPosition === undefined || newPosition === null) {
      throw { status: 400, message: 'newPosition is required' };
    }
    const list = await ListRepository.reorder(listId, newPosition);
    if (!list) throw { status: 404, message: 'List not found' };
    return list;
  },

  async deleteList(id) {
    const list = await ListRepository.getById(id);
    if (!list) throw { status: 404, message: 'List not found' };
    await ListRepository.delete(id);
  },
};

module.exports = ListService;
