const pool = require('../config/db');

/**
 * Compute midpoint between two decimal positions
 */
function computeMidpoint(prev, next) {
  return (parseFloat(prev) + parseFloat(next)) / 2.0;
}

/**
 * Reindex positions for cards in a list to sequential integers starting at 1.0
 * This helps when positions become too close due to many midpoint inserts.
 * Operates within a client transaction if provided.
 */
async function reindexCardsInList(listId, client) {
  const db = client || pool;
  // Retrieve cards ordered by position
  const { rows } = await db.query('SELECT id FROM cards WHERE list_id = $1 ORDER BY position ASC', [listId]);
  // Assign new integer positions 1,2,3,...
  for (let i = 0; i < rows.length; i++) {
    const pos = i + 1;
    await db.query('UPDATE cards SET position = $1 WHERE id = $2', [pos, rows[i].id]);
  }
}

/**
 * Reindex positions for lists in a board to sequential integers starting at 1.0
 */
async function reindexListsInBoard(boardId, client) {
  const db = client || pool;
  const { rows } = await db.query('SELECT id FROM lists WHERE board_id = $1 ORDER BY position ASC', [boardId]);
  for (let i = 0; i < rows.length; i++) {
    const pos = i + 1;
    await db.query('UPDATE lists SET position = $1 WHERE id = $2', [pos, rows[i].id]);
  }
}

module.exports = {
  computeMidpoint,
  reindexCardsInList,
  reindexListsInBoard,
};
