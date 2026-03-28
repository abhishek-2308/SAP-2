const pool = require('../config/db');

describe('Performance Stress Test (Large datasets)', () => {
  let boardId;

  beforeAll(async () => {
    // Large dataset: 10 lists, 100 cards for local stress check
    const board = await pool.query("INSERT INTO boards (title) VALUES ('Stress Board') RETURNING id");
    boardId = board.rows[0].id;

    for (let i = 0; i < 10; i++) {
      const list = await pool.query("INSERT INTO lists (board_id, title) VALUES ($1, $2) RETURNING id", [boardId, `List ${i}`]);
      const listId = list.rows[0].id;
      
      const cardValues = [];
      for (let j = 0; j < 100; j++) {
        cardValues.push(`(${listId}, 'Card ${i}-${j}', ${j * 100})`);
      }
      await pool.query(`INSERT INTO cards (list_id, title, position) VALUES ${cardValues.join(',')}`);
    }
  });

  afterAll(async () => {
     await pool.query("DELETE FROM boards WHERE title = 'Stress Board'");
  });

  it('GET /boards/:id/details - Load time benchmark', async () => {
    const start = Date.now();
    const res = await pool.query(`
      SELECT b.*, 
        (SELECT json_agg(l.*) FROM lists l WHERE l.board_id = b.id) as lists,
        (SELECT json_agg(c.*) FROM cards c JOIN lists l ON c.list_id = l.id WHERE l.board_id = b.id) as cards
      FROM boards b WHERE b.id = $1`, [boardId]);
    const end = Date.now();
    
    const duration = end - start;
    console.log(`Board details (1000 cards) fetched in: ${duration}ms`);
    
    // SLA threshold check - allowing for cloud DB network jitter & Render potential slowness
    expect(duration).toBeLessThan(8000); // Should respond in <8s 
    expect(res.rows[0].id).toBe(boardId);
  });
});
