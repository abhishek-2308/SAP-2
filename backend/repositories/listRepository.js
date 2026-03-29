const pool = require('../config/db');

const ListRepository = {
  async getByBoard(boardId) {
    const { rows } = await pool.query(
      'SELECT * FROM lists WHERE board_id = $1 ORDER BY position ASC',
      [boardId]
    );
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM lists WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  async getMaxPosition(boardId) {
    const { rows } = await pool.query(
      'SELECT COALESCE(MAX(position), 0) AS max_pos FROM lists WHERE board_id = $1',
      [boardId]
    );
    return parseFloat(rows[0].max_pos);
  },

  async create(boardId, title, position, theme = 'default') {
    const { rows } = await pool.query(
      'INSERT INTO lists (board_id, title, position, theme) VALUES ($1, $2, $3, $4) RETURNING *',
      [boardId, title, position, theme]
    );
    return rows[0];
  },

  async update(id, title, theme) {
    let query = 'UPDATE lists SET title = $1';
    const params = [title];
    if (theme !== undefined) {
      query += ', theme = $2';
      params.push(theme);
    }
    query += ` WHERE id = $${params.length + 1} RETURNING *`;
    params.push(id);
    const { rows } = await pool.query(query, params);
    return rows[0];
  },

  async reorder(id, newPosition) {
    const { rows } = await pool.query(
      'UPDATE lists SET position = $1 WHERE id = $2 RETURNING *',
      [newPosition, id]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM lists WHERE id = $1', [id]);
  },
};

module.exports = ListRepository;
