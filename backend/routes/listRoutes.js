const express = require('express');
const router = express.Router();
const ListController = require('../controllers/listController');

/**
 * @swagger
 * tags:
 *   name: Lists
 *   description: List management and ordering
 */

/**
 * @swagger
 * /lists:
 *   post:
 *     summary: Create a new list inside a board
 *     tags: [Lists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [boardId, title]
 *             properties:
 *               boardId: { type: integer, example: 1 }
 *               title: { type: string, example: "In Review" }
 *     responses:
 *       201:
 *         description: Created list with auto-calculated position
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 *       400:
 *         description: Missing boardId or title
 *       404:
 *         description: Board not found
 */
router.post('/', ListController.create);

/**
 * @swagger
 * /lists/reorder:
 *   post:
 *     summary: Reorder a list — intent-based (position calculation done client-side using midpoint formula)
 *     tags: [Lists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [listId, newPosition]
 *             properties:
 *               listId: { type: integer, example: 2 }
 *               newPosition: { type: number, example: 1.5, description: "(prev.position + next.position) / 2" }
 *     responses:
 *       200:
 *         description: List with updated position
 */
router.post('/reorder', ListController.reorder);

/**
 * @swagger
 * /lists/{id}:
 *   patch:
 *     summary: Update list title
 *     tags: [Lists]
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
 *     responses:
 *       200:
 *         description: Updated list
 */
router.patch('/:id', ListController.update);

/**
 * @swagger
 * /lists/{id}/archive:
 *   patch:
 *     summary: Toggle list archived state
 *     tags: [Lists]
 */
router.patch('/:id/archive', ListController.archive);

/**
 * @swagger
 * /lists/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted list and its cards
 *     tags: [Lists]
 */
router.patch('/:id/restore', ListController.restore);

/**
 * @swagger
 * /lists/{id}:
 *   delete:
 *     summary: Soft delete a list (move to trash)
 *     tags: [Lists]
 */
router.delete('/:id', ListController.softDelete);

/**
 * @swagger
 * /lists/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a list and its cards
 *     tags: [Lists]
 */
router.delete('/:id/permanent', ListController.permanentDelete);

/**
 * @swagger
 * /lists/{id}/toggle-collapse:
 *   patch:
 *     summary: Toggle list collapse state (UI layout persistence)
 *     tags: [Lists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated list with new is_collapsed value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/List'
 */
router.patch('/:id/toggle-collapse', ListController.toggleCollapse);

module.exports = router;
