const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

describe('Lists API Integration Tests', () => {
  let boardId;
  let listId;

  beforeAll(async () => {
    const res = await pool.query("INSERT INTO boards (title) VALUES ($1) RETURNING id", [`List Test Board ${Date.now()}`]);
    boardId = res.rows[0].id;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM boards WHERE id = $1", [boardId]);
    await pool.end();
  });

  it('POST /lists - Should create a new list', async () => {
    const res = await request(app)
      .post('/lists')
      .send({ boardId, title: 'To Do' });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('To Do');
    listId = res.body.data.id;
  });

  it('PUT /lists/reorder - Should reorder lists', async () => {
    // Create a second list
    const res2 = await request(app).post('/lists').send({ boardId, title: 'Done' });
    const listId2 = res2.body.data.id;

    // Reorder list1 to be after list2
    const reorderRes = await request(app)
      .post('/lists/reorder')
      .send({ listId, newPosition: 2.0 });
    
    expect(reorderRes.statusCode).toBe(200);
  });

  it('DELETE /lists/:id - Should delete list with cards (Cascade check)', async () => {
    // Add a card to the list first
    await pool.query("INSERT INTO cards (list_id, title) VALUES ($1, 'Card in list')", [listId]);
    
    const res = await request(app).delete(`/lists/${listId}`);
    expect(res.statusCode).toBe(200);
    
    // Verify cards are also deleted (Cascade)
    const cardCheck = await pool.query("SELECT * FROM cards WHERE list_id = $1", [listId]);
    expect(cardCheck.rows.length).toBe(0);
  });
});
