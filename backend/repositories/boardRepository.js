const pool = require('../config/db');

const BoardRepository = {
  async getAll() {
    const { rows } = await pool.query(
      'SELECT * FROM boards WHERE is_deleted = false AND is_archived = false ORDER BY position ASC, created_at DESC'
    );
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM boards WHERE id = $1 AND is_deleted = false',
      [id]
    );
    return rows[0];
  },

  async getBoardDetails(id) {
    const boardResult = await pool.query(
      'SELECT * FROM boards WHERE id = $1 AND is_deleted = false',
      [id]
    );
    const listsResult = await pool.query(
      'SELECT * FROM lists WHERE board_id = $1 AND is_deleted = false AND is_archived = false ORDER BY position ASC',
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
       WHERE lists.board_id = $1 AND cards.is_deleted = false AND cards.is_archived = false
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

  async move(id, newPosition) {
    const { rows } = await pool.query(
      'UPDATE boards SET position = $1 WHERE id = $2 RETURNING *',
      [newPosition, id]
    );
    return rows[0];
  },

  async getMaxPosition() {
    const { rows } = await pool.query('SELECT MAX(position) as max_pos FROM boards');
    return parseFloat(rows[0].max_pos) || 0;
  },

  async create(title, background = 'default', position = 1.0) {
    const { rows } = await pool.query(
      'INSERT INTO boards (title, background, position) VALUES ($1, $2, $3) RETURNING *',
      [title, background, position]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['title', 'background', 'is_starred', 'position', 'is_archived', 'is_deleted', 'deleted_at'];
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

  async getAttachmentsForBoard(boardId) {
    const { rows } = await pool.query(
      `SELECT a.filename FROM attachments a
       JOIN cards c ON a.card_id = c.id
       JOIN lists l ON c.list_id = l.id
       WHERE l.board_id = $1`,
      [boardId]
    );
    return rows;
  },

  async delete(id) {
    await pool.query('DELETE FROM boards WHERE id = $1', [id]);
  },

  async getTrash() {
    try {
      const boards = (await pool.query('SELECT * FROM boards WHERE is_deleted = true ORDER BY deleted_at DESC')).rows;
      
      const lists = (await pool.query(`
        SELECT l.*, b.title as parent_title 
        FROM lists l 
        LEFT JOIN boards b ON l.board_id = b.id 
        WHERE l.is_deleted = true 
        ORDER BY l.deleted_at DESC
      `)).rows;
      
      const cards = (await pool.query(`
        SELECT c.*, b.title as parent_title 
        FROM cards c 
        LEFT JOIN lists l ON c.list_id = l.id 
        LEFT JOIN boards b ON l.board_id = b.id 
        WHERE c.is_deleted = true 
        ORDER BY c.deleted_at DESC
      `)).rows;
      
      return { boards, lists, cards };
    } catch (err) {
      console.error('❌ SQL Error in getTrash:', err.message);
      throw err;
    }
  },

  async updateLifecycle(type, id, fields) {
    const table = type === 'board' ? 'boards' : type === 'list' ? 'lists' : 'cards';
    const keys = Object.keys(fields);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = [...Object.values(fields), id];
    
    const { rows } = await pool.query(
      `UPDATE ${table} SET ${sets} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return rows[0];
  },
};

module.exports = BoardRepository;
