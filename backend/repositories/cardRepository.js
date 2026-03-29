const pool = require('../config/db');

const CardRepository = {
  async getByList(listId) {
    const { rows } = await pool.query(
      'SELECT * FROM cards WHERE list_id = $1 AND is_deleted = false AND is_archived = false ORDER BY position ASC',
      [listId]
    );
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM cards WHERE id = $1 AND is_deleted = false',
      [id]
    );
    return rows[0];
  },

  async getMaxPosition(listId) {
    const { rows } = await pool.query(
      'SELECT COALESCE(MAX(position), 0) AS max_pos FROM cards WHERE list_id = $1',
      [listId]
    );
    return parseFloat(rows[0].max_pos);
  },

  async create(listId, title, position, theme = 'default') {
    const { rows } = await pool.query(
      'INSERT INTO cards (list_id, title, position, theme) VALUES ($1, $2, $3, $4) RETURNING *',
      [listId, title, position, theme]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['title', 'description', 'due_date', 'theme', 'is_completed', 'position', 'is_archived', 'is_deleted', 'deleted_at'];
    const sets = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${idx}`);
        values.push(fields[key]);
        idx++;
      }
    }

    if (sets.length === 0) return null;
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE cards SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  },

  // Move card: update list_id + position atomically in a transaction
  async move(cardId, targetListId, newPosition, client) {
    const db = client || pool;
    const { rows } = await db.query(
      'UPDATE cards SET list_id = $1, position = $2 WHERE id = $3 RETURNING *',
      [targetListId, newPosition, cardId]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM cards WHERE id = $1', [id]);
  },
};

module.exports = CardRepository;
