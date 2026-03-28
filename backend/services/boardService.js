const BoardRepository = require('../repositories/boardRepository');

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

  async createBoard(title) {
    if (!title || title.trim() === '') {
      throw { status: 400, message: 'Title is required' };
    }
    return BoardRepository.create(title.trim());
  },

  async updateBoard(id, title) {
    if (!title || title.trim() === '') {
      throw { status: 400, message: 'Title is required' };
    }
    const board = await BoardRepository.update(id, title.trim());
    if (!board) throw { status: 404, message: 'Board not found' };
    return board;
  },

  async deleteBoard(id) {
    await BoardRepository.getById(id).then((b) => {
      if (!b) throw { status: 404, message: 'Board not found' };
    });
    await BoardRepository.delete(id);
  },
};

module.exports = BoardService;
