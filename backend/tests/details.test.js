const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

describe('Card Details API Integration (Labels, Members, Checklists)', () => {
  let cardId;
  let labelId;
  let userId;
  let checklistId;

  beforeAll(async () => {
    // Setup: Create a board, list, card, label, and user for testing
    const board = await pool.query("INSERT INTO boards (title) VALUES ('QA Board') RETURNING id");
    const list = await pool.query("INSERT INTO lists (board_id, title) VALUES ($1, 'QA List') RETURNING id", [board.rows[0].id]);
    const card = await pool.query("INSERT INTO cards (list_id, title) VALUES ($1, 'QA Card') RETURNING id", [list.rows[0].id]);
    const label = await pool.query("INSERT INTO labels (name, color) VALUES ('QA Label', '#FF0000') RETURNING id");
    const user = await pool.query("INSERT INTO users (name, email) VALUES ('QA User', 'qa@example.com') RETURNING id");

    cardId = card.rows[0].id;
    labelId = label.rows[0].id;
    userId = user.rows[0].id;
  });

  afterAll(async () => {
    // Teardown: Cascade deletes will handle most, but we clean up labels/users manually if needed
    await pool.query("DELETE FROM boards WHERE title = 'QA Board'");
    await pool.query("DELETE FROM labels WHERE name = 'QA Label'");
    await pool.query("DELETE FROM users WHERE email = 'qa@example.com'");
  });

  // ─── Labels ────────────────────────────────────────────────
  it('POST /card-details/:id/add-label - Should assign label to card', async () => {
    const res = await request(app)
      .post(`/card-details/${cardId}/add-label`)
      .send({ labelId });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /card-details/:id/labels - Should fetch card labels', async () => {
    const res = await request(app).get(`/card-details/${cardId}/labels`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.some(l => l.id === labelId)).toBe(true);
  });

  // ─── Members ──────────────────────────────────────────────
  it('POST /card-details/:id/assign-member - Should assign user to card', async () => {
    const res = await request(app)
      .post(`/card-details/${cardId}/assign-member`)
      .send({ userId });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // ─── Checklists ───────────────────────────────────────────
  it('POST /card-details/:id/checklists - Should create a checklist', async () => {
    const res = await request(app)
      .post(`/card-details/${cardId}/checklists`)
      .send({ title: 'QA Checklist' });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('QA Checklist');
    checklistId = res.body.data.id;
  });

  it('POST /card-details/checklists/:id/items - Should add item to checklist', async () => {
    const res = await request(app)
      .post(`/card-details/checklists/${checklistId}/items`)
      .send({ content: 'QA Item' });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.data.content).toBe('QA Item');
    expect(res.body.data.is_completed).toBe(false);
  });

  // ─── Search ───────────────────────────────────────────────
  it('GET /card-details/search/:boardId - Should filter by label', async () => {
    const board = await pool.query("SELECT id FROM boards WHERE title = 'QA Board'");
    const res = await request(app).get(`/card-details/search/${board.rows[0].id}?labelId=${labelId}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].id).toBe(cardId);
  });
});
