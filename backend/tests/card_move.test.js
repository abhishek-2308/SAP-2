const request = require('supertest');
const app = require('../index');
const CardService = require('../services/cardService');
const pool = require('../config/db');

describe('Drag & Drop / Card Move (Integration & Logic)', () => {
  let boardId, listId, targetListId, cardId;

  beforeAll(async () => {
    // Seed real data for the integration test
    const board = await pool.query("INSERT INTO boards (title) VALUES ('DND Test Board') RETURNING id");
    boardId = board.rows[0].id;
    
    const list1 = await pool.query("INSERT INTO lists (board_id, title, position) VALUES ($1, 'Source', 1.0) RETURNING id", [boardId]);
    const list2 = await pool.query("INSERT INTO lists (board_id, title, position) VALUES ($1, 'Target', 2.0) RETURNING id", [boardId]);
    listId = list1.rows[0].id;
    targetListId = list2.rows[0].id;
    
    const card = await pool.query("INSERT INTO cards (list_id, title, position) VALUES ($1, 'Card to move', 1.0) RETURNING id", [listId]);
    cardId = card.rows[0].id;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM boards WHERE id = $1", [boardId]);
  });

  it('1. Throws 400 if required move parameters are missing', async () => {
    await expect(CardService.moveCard(undefined, 1, 2, 1.5)).rejects.toMatchObject({
      status: 400
    });
  });

  it('2. Drag card across lists (Integration Check)', async () => {
    const res = await request(app)
       .post('/cards/move')
       .send({
           cardId,
           sourceListId: listId,
           targetListId,
           newPosition: 1.5
       });
       
    expect(res.statusCode).toBe(200);
    expect(res.body.data.list_id).toBe(targetListId);
    expect(parseFloat(res.body.data.position)).toBe(1.5);
  });

  it('3. Trigger DB Transaction Failure & Verify Rollback Simulation', async () => {
    // Spy on pg pool to ensure ROLLBACK is called
    const mockClient = await pool.connect();
    jest.spyOn(pool, 'connect').mockResolvedValueOnce(mockClient);
    const releaseSpy = jest.spyOn(mockClient, 'release');
    const querySpy = jest.spyOn(mockClient, 'query');

    // Make the repository throw an error to simulate constraint failure
    const CardRepository = require('../repositories/cardRepository');
    jest.spyOn(CardRepository, 'move').mockRejectedValueOnce(new Error('Constraint Violation'));

    try {
      await CardService.moveCard(cardId, listId, targetListId, 2.0);
    } catch (err) {
      expect(err.message).toBe('Constraint Violation');
      expect(querySpy).toHaveBeenCalledWith('BEGIN');
      expect(querySpy).toHaveBeenCalledWith('ROLLBACK');
      expect(releaseSpy).toHaveBeenCalled();
    }
  });
});
