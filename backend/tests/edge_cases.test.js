const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

describe('Edge Case & Failure Handling Simulation', () => {

  it('GET /boards/:id - Should return 404 for non-existent board', async () => {
    const res = await request(app).get('/boards/999999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('GET /boards/:id/details - Should handle empty board correctly (no lists/cards)', async () => {
    const board = await pool.query("INSERT INTO boards (title) VALUES ('Empty Board') RETURNING id");
    const boardId = board.rows[0].id;

    const res = await request(app).get(`/boards/${boardId}/details`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.data.lists).toHaveLength(0);
    expect(res.body.data.cards).toHaveLength(0);
    
    await pool.query("DELETE FROM boards WHERE id = $1", [boardId]);
  });

  it('Duplicate Actions - Should handle idempotent list/card movement if possible, or graceful error', async () => {
    const board = await pool.query("INSERT INTO boards (title) VALUES ('Dup Board') RETURNING id");
    const boardId = board.rows[0].id;
    const list = await pool.query("INSERT INTO lists (board_id, title) VALUES ($1, 'L1') RETURNING id", [boardId]);
    const card = await pool.query("INSERT INTO cards (list_id, title) VALUES ($1, 'C1') RETURNING id", [list.rows[0].id]);
    const cardId = card.rows[0].id;

    // Simulate same move twice
    const res1 = await request(app).post('/cards/move').send({ cardId, sourceListId: list.rows[0].id, targetListId: list.rows[0].id, newPosition: 10 });
    const res2 = await request(app).post('/cards/move').send({ cardId, sourceListId: list.rows[0].id, targetListId: list.rows[0].id, newPosition: 10 });

    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200); // Idempotent check

    await pool.query("DELETE FROM boards WHERE id = $1", [boardId]);
  });
});
