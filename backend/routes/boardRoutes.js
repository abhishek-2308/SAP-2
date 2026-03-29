const express = require('express');
const router = express.Router();
const BoardController = require('../controllers/boardController');

/**
 * @swagger
 * tags:
 *   name: Boards
 *   description: Board management endpoints
 */

/**
 * @swagger
 * /boards:
 *   get:
 *     summary: List all boards
 *     tags: [Boards]
 *     responses:
 *       200:
 *         description: Array of boards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Board' }
 */
router.get('/', BoardController.getAll);

// Trash route MUST come before /:id routes to avoid being captured as a parameter
/**
 * @swagger
 * /boards/trash:
 *   get:
 *     summary: Get all soft-deleted items across boards, lists, and cards
 *     tags: [Boards]
 *     responses:
 *       200:
 *         description: Trash collection
 */
router.get('/trash', BoardController.getTrash);

/**
 * @swagger
 * /boards/{id}:
 *   get:
 *     summary: Get board by ID
 *     tags: [Boards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Board object
 *       404:
 *         description: Board not found
 */
router.get('/:id', BoardController.getById);

/**
 * @swagger
 * /boards/{id}/details:
 *   get:
 *     summary: Get full board with lists and cards (aggregated)
 *     tags: [Boards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Board with nested lists and cards
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 board: { id: 1, title: "Product Roadmap" }
 *                 lists: [{ id: 1, title: "Backlog", position: 1.0 }]
 *                 cards: [{ id: 1, list_id: 1, title: "Task A", position: 1.0 }]
 */
router.get('/:id/details', BoardController.getDetails);

/**
 * @swagger
 * /boards:
 *   post:
 *     summary: Create a new board
 *     tags: [Boards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "Sprint Q2" }
 *     responses:
 *       201:
 *         description: Created board
 *       400:
 *         description: Validation error
 */
router.post('/', BoardController.create);

/**
 * @swagger
 * /boards/{id}:
 *   patch:
 *     summary: Update board title
 *     tags: [Boards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *     responses:
 *       200:
 *         description: Updated board
 */
router.patch('/:id', BoardController.update);


/**
 * @swagger
 * /boards/{id}:
 *   delete:
 *     summary: Soft delete a board (move to trash)
 *     tags: [Boards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Board moved to trash
 */
router.delete('/:id', BoardController.softDelete);

/**
 * @swagger
 * /boards/{id}/permanent:
 *   delete:
 *     summary: Permanent purge of a board and all its nested data
 *     tags: [Boards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.delete('/:id/permanent', BoardController.permanentDelete);

/**
 * @swagger
 * /boards/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted board
 *     tags: [Boards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.patch('/:id/restore', BoardController.restore);

/**
 * @swagger
 * /boards/{id}/reorder:
 *   patch:
 *     summary: Update board position (for dashboard reordering)
 *     tags: [Boards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPosition]
 *             properties:
 *               newPosition: { type: number, example: 1.5 }
 */
router.patch('/:id/reorder', BoardController.reorder);

module.exports = router;
