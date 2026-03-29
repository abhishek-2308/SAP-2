const pool = require('../config/db');

const ListRepository = {
  async getByBoard(boardId) {
    const { rows } = await pool.query(
      'SELECT * FROM lists WHERE board_id = $1 AND is_deleted = false AND is_archived = false ORDER BY position ASC',
      [boardId]
    );
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM lists WHERE id = $1 AND is_deleted = false',
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

  async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return this.getById(id);
    
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const params = [...Object.values(fields), id];
    
    const query = `UPDATE lists SET ${setClause} WHERE id = $${params.length} RETURNING *`;
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
