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
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
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
 *     summary: Delete a board (cascades all lists and cards)
 *     tags: [Boards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Board deleted
 */
router.delete('/:id', BoardController.delete);

module.exports = router;
