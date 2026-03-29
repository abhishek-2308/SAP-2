const pool = require('../config/db');

const CardDetailRepository = {
  // ─── Labels ────────────────────────────────────────────────
  async getLabels(cardId) {
    const { rows } = await pool.query(
      `SELECT l.* FROM labels l
       JOIN card_labels cl ON l.id = cl.label_id
       WHERE cl.card_id = $1`,
      [cardId]
    );
    return rows;
  },

  async getAllLabels() {
    const { rows } = await pool.query('SELECT * FROM labels ORDER BY id');
    return rows;
  },

  async addLabel(cardId, labelId) {
    const { rows } = await pool.query(
      `INSERT INTO card_labels (card_id, label_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING RETURNING *`,
      [cardId, labelId]
    );
    return rows[0];
  },

  async removeLabel(cardId, labelId) {
    await pool.query(
      'DELETE FROM card_labels WHERE card_id = $1 AND label_id = $2',
      [cardId, labelId]
    );
  },

  // ─── Members ──────────────────────────────────────────────
  async getMembers(cardId) {
    const { rows } = await pool.query(
      `SELECT u.* FROM users u
       JOIN card_members cm ON u.id = cm.user_id
       WHERE cm.card_id = $1`,
      [cardId]
    );
    return rows;
  },

  async getAllUsers() {
    const { rows } = await pool.query('SELECT id, name, email FROM users ORDER BY id');
    return rows;
  },

  async assignMember(cardId, userId) {
    const { rows } = await pool.query(
      `INSERT INTO card_members (card_id, user_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING RETURNING *`,
      [cardId, userId]
    );
    return rows[0];
  },

  async removeMember(cardId, userId) {
    await pool.query(
      'DELETE FROM card_members WHERE card_id = $1 AND user_id = $2',
      [cardId, userId]
    );
  },

  // ─── Checklists ───────────────────────────────────────────
  async getChecklists(cardId) {
    const checklists = await pool.query(
      'SELECT * FROM checklists WHERE card_id = $1 ORDER BY created_at',
      [cardId]
    );
    const items = await pool.query(
      `SELECT ci.* FROM checklist_items ci
       JOIN checklists c ON ci.checklist_id = c.id
       WHERE c.card_id = $1
       ORDER BY ci.id`,
      [cardId]
    );
    // Group items by checklist
    const grouped = {};
    checklists.rows.forEach((cl) => { grouped[cl.id] = { ...cl, items: [] }; });
    items.rows.forEach((item) => {
      if (grouped[item.checklist_id]) grouped[item.checklist_id].items.push(item);
    });
    return Object.values(grouped);
  },

  async createChecklist(cardId, title) {
    const { rows } = await pool.query(
      'INSERT INTO checklists (card_id, title) VALUES ($1, $2) RETURNING *',
      [cardId, title]
    );
    return { ...rows[0], items: [] };
  },

  async deleteChecklist(checklistId) {
    await pool.query('DELETE FROM checklists WHERE id = $1', [checklistId]);
  },

  async addChecklistItem(checklistId, content) {
    const { rows } = await pool.query(
      'INSERT INTO checklist_items (checklist_id, content) VALUES ($1, $2) RETURNING *',
      [checklistId, content]
    );
    return rows[0];
  },

  async toggleChecklistItem(itemId) {
    const { rows } = await pool.query(
      'UPDATE checklist_items SET is_completed = NOT is_completed WHERE id = $1 RETURNING *',
      [itemId]
    );
    return rows[0];
  },

  async deleteChecklistItem(itemId) {
    await pool.query('DELETE FROM checklist_items WHERE id = $1', [itemId]);
  },

  // ─── Activities ───────────────────────────────────────────
  async logActivity(boardId, cardId, action, details) {
    let finalBoardId = boardId;
    if (!finalBoardId && cardId) {
      const res = await pool.query('SELECT board_id FROM lists JOIN cards ON lists.id = cards.list_id WHERE cards.id = $1', [cardId]);
      if (res.rows[0]) finalBoardId = res.rows[0].board_id;
    }
    const { rows } = await pool.query(
      'INSERT INTO activities (board_id, card_id, action, details) VALUES ($1, $2, $3, $4) RETURNING *',
      [finalBoardId, cardId, action, details ? JSON.stringify(details) : null]
    );
    return rows[0];
  },

  async getActivities(boardId, cardId = null, limit = 50) {
    let query = 'SELECT * FROM activities WHERE ';
    const params = [];
    if (cardId) {
      query += 'card_id = $1 ';
      params.push(cardId);
    } else if (boardId) {
      query += 'board_id = $1 ';
      params.push(boardId);
    } else {
      return [];
    }
    query += 'ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);
    const { rows } = await pool.query(query, params);
    return rows;
  },

  // ─── Search ───────────────────────────────────────────────
  async searchCards(boardId, query, filters = {}) {
    let sql = `
      SELECT DISTINCT cards.* FROM cards
      JOIN lists ON cards.list_id = lists.id
      WHERE lists.board_id = $1
    `;
    const params = [boardId];
    let idx = 2;

    if (query) {
      sql += ` AND (cards.title ILIKE $${idx} OR cards.description ILIKE $${idx})`;
      params.push(`%${query}%`);
      idx++;
    }

    if (filters.labelId) {
      sql += ` AND cards.id IN (SELECT card_id FROM card_labels WHERE label_id = $${idx})`;
      params.push(filters.labelId);
      idx++;
    }

    if (filters.memberId) {
      sql += ` AND cards.id IN (SELECT card_id FROM card_members WHERE user_id = $${idx})`;
      params.push(filters.memberId);
      idx++;
    }

    if (filters.hasDueDate === 'true') {
      sql += ' AND cards.due_date IS NOT NULL';
    }
    if (filters.overdue === 'true') {
      sql += ' AND cards.due_date < NOW()';
    }

    sql += ' ORDER BY cards.list_id, cards.position';

    const { rows } = await pool.query(sql, params);
    return rows;
  },
};

module.exports = CardDetailRepository;
