const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');
const BoardService = require('../services/boardService');

describe('Board API & DB Tests', () => {
  let createdBoardId;

  it('1. POST /boards - Should create a new board (Layer: API + DB Integration)', async () => {
    const res = await request(app)
      .post('/boards')
      .send({ title: 'Test QA Board' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.title).toBe('Test QA Board');

    createdBoardId = res.body.data.id;
  });

  it('2. GET /boards/:id/details - Should fetch board details (Layer: API)', async () => {
    const res = await request(app).get(`/boards/${createdBoardId}/details`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.board.title).toBe('Test QA Board');
    expect(Array.isArray(res.body.data.lists)).toBe(true);
    expect(Array.isArray(res.body.data.cards)).toBe(true);
  });

  it('3. GET /boards/:id - Invalid board ID returns 404/500 (Layer: API Edge Case)', async () => {
    const res = await request(app).get('/boards/-1'); // DB won't match
    expect(res.statusCode).not.toBe(200);
    expect(res.body.success).toBe(false);
  });

  it('4. BoardService.createBoard() throws on empty title (Layer: Unit Service logic)', async () => {
    await expect(BoardService.createBoard('')).rejects.toMatchObject({
      status: 400,
      message: 'Title is required'
    });
  });

  // Cleanup layer
  afterAll(async () => {
    if (createdBoardId) {
       await request(app).delete(`/boards/${createdBoardId}`);
    }
  });
});
