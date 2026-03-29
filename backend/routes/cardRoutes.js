const express = require('express');
const router = express.Router();
const CardController = require('../controllers/cardController');

/**
 * @swagger
 * tags:
 *   name: Cards
 *   description: Card CRUD and movement (critical for drag-and-drop)
 */

/**
 * @swagger
 * /cards:
 *   post:
 *     summary: Create a card at the end of a list
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [listId, title]
 *             properties:
 *               listId: { type: integer, example: 1 }
 *               title: { type: string, example: "Implement auth" }
 *     responses:
 *       201:
 *         description: Created card with auto-assigned position
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 */
router.post('/', CardController.create);

/**
 * @swagger
 * /cards/move:
 *   post:
 *     summary: Move a card within or across lists — INTENT-BASED endpoint (uses DB transaction)
 *     description: |
 *       Position is calculated client-side (drag-and-drop) using:
 *       - **Empty list**: `newPosition = 1.0`
 *       - **Top of list**: `newPosition = firstCard.position / 2`
 *       - **Between two cards**: `newPosition = (prev.position + next.position) / 2`
 *       - **End of list**: `newPosition = lastCard.position + 1`
 *
 *       This operation is wrapped in a PostgreSQL transaction (BEGIN/COMMIT/ROLLBACK).
 *     tags: [Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cardId, targetListId, newPosition]
 *             properties:
 *               cardId: { type: integer, example: 5 }
 *               sourceListId: { type: integer, example: 1 }
 *               targetListId: { type: integer, example: 3 }
 *               newPosition: { type: number, example: 1.5 }
 *     responses:
 *       200:
 *         description: Card moved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Card or target list not found
 */
router.post('/move', CardController.move);

/**
 * @swagger
 * /cards/{id}:
 *   patch:
 *     summary: Update card details (title, description, due_date)
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               due_date: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Updated card
 *       404:
 *         description: Card not found
 */
router.patch('/:id', CardController.update);

/**
 * @swagger
 * /cards/{id}/toggle-complete:
 *   patch:
 *     summary: Toggle card completed state
 *     tags: [Cards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.patch('/:id/toggle-complete', CardController.toggleComplete);

/**
 * @swagger
 * /cards/{id}/archive:
 *   patch:
 *     summary: Toggle card archived state
 *     tags: [Cards]
 */
router.patch('/:id/archive', CardController.archive);

/**
 * @swagger
 * /cards/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted card from trash
 *     tags: [Cards]
 */
router.patch('/:id/restore', CardController.restore);

/**
 * @swagger
 * /cards/{id}:
 *   delete:
 *     summary: Soft delete a card (move to trash)
 *     tags: [Cards]
 */
router.delete('/:id', CardController.softDelete);

/**
 * @swagger
 * /cards/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a card and its attachments
 *     tags: [Cards]
 */
router.delete('/:id/permanent', CardController.permanentDelete);

module.exports = router;
