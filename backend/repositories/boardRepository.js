const pool = require('../config/db');

const BoardRepository = {
  async getAll() {
    const { rows } = await pool.query(
      'SELECT * FROM boards ORDER BY created_at DESC'
    );
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM boards WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  async getBoardDetails(id) {
    // Fetch board, its lists, and their cards in a single round-trip
    const boardResult = await pool.query(
      'SELECT * FROM boards WHERE id = $1',
      [id]
    );
    const listsResult = await pool.query(
      'SELECT * FROM lists WHERE board_id = $1 ORDER BY position ASC',
      [id]
    );
    const cardsResult = await pool.query(
      `SELECT cards.*,
              COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', l.id, 'name', l.name, 'color', l.color)) FILTER (WHERE l.id IS NOT NULL), '[]') as labels,
              COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', u.id, 'name', u.name)) FILTER (WHERE u.id IS NOT NULL), '[]') as members
       FROM cards
       JOIN lists ON cards.list_id = lists.id
       LEFT JOIN card_labels cl ON cards.id = cl.card_id
       LEFT JOIN labels l ON cl.label_id = l.id
       LEFT JOIN card_members cm ON cards.id = cm.card_id
       LEFT JOIN users u ON cm.user_id = u.id
       WHERE lists.board_id = $1
       GROUP BY cards.id
       ORDER BY cards.list_id, cards.position ASC`,
      [id]
    );
    return {
      board: boardResult.rows[0],
      lists: listsResult.rows,
      cards: cardsResult.rows,
    };
  },

  async create(title, background = 'default') {
    const { rows } = await pool.query(
      'INSERT INTO boards (title, background) VALUES ($1, $2) RETURNING *',
      [title, background]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['title', 'background', 'is_starred'];
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
      `UPDATE boards SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM boards WHERE id = $1', [id]);
  },
};

module.exports = BoardRepository;
