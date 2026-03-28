const express = require('express');
const router = express.Router();
const C = require('../controllers/cardDetailController');

/**
 * @swagger
 * tags:
 *   - name: Labels
 *     description: Card label management (M:N)
 *   - name: Members
 *     description: Card member assignment (M:N)
 *   - name: Checklists
 *     description: Checklist and checklist item management
 *   - name: Activities
 *     description: Board activity audit log
 *   - name: Search
 *     description: Server-side search and filtering
 */

// ─── Labels ──────────────────────────────────────────────────
/**
 * @swagger
 * /card-details/labels:
 *   get:
 *     summary: Get all available labels
 *     tags: [Labels]
 *     responses:
 *       200:
 *         description: All labels
 */
router.get('/labels', C.getAllLabels);

/**
 * @swagger
 * /card-details/{cardId}/labels:
 *   get:
 *     summary: Get labels assigned to a card
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Card labels
 */
router.get('/:cardId/labels', C.getLabels);

/**
 * @swagger
 * /card-details/{cardId}/add-label:
 *   post:
 *     summary: Add a label to a card (intent-based)
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [labelId]
 *             properties:
 *               labelId: { type: integer, example: 2 }
 *     responses:
 *       201:
 *         description: Label added
 */
router.post('/:cardId/add-label', C.addLabel);

/**
 * @swagger
 * /card-details/{cardId}/labels/{labelId}:
 *   delete:
 *     summary: Remove a label from a card
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: labelId
 *         required: true
 *         schema: { type: integer }
 */
router.delete('/:cardId/labels/:labelId', C.removeLabel);

// ─── Members ─────────────────────────────────────────────────
/**
 * @swagger
 * /card-details/users:
 *   get:
 *     summary: List all users (for member assignment dropdown)
 *     tags: [Members]
 */
router.get('/users', C.getAllUsers);

/**
 * @swagger
 * /card-details/{cardId}/members:
 *   get:
 *     summary: Get members assigned to a card
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema: { type: integer }
 */
router.get('/:cardId/members', C.getMembers);

/**
 * @swagger
 * /card-details/{cardId}/assign-member:
 *   post:
 *     summary: Assign a member to a card (intent-based)
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: integer, example: 1 }
 */
router.post('/:cardId/assign-member', C.assignMember);

/**
 * @swagger
 * /card-details/{cardId}/members/{userId}:
 *   delete:
 *     summary: Remove member from a card
 *     tags: [Members]
 */
router.delete('/:cardId/members/:userId', C.removeMember);

// ─── Checklists ──────────────────────────────────────────────
/**
 * @swagger
 * /card-details/{cardId}/checklists:
 *   get:
 *     summary: Get all checklists (with items) for a card
 *     tags: [Checklists]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema: { type: integer }
 */
router.get('/:cardId/checklists', C.getChecklists);

/**
 * @swagger
 * /card-details/{cardId}/checklists:
 *   post:
 *     summary: Create a new checklist on a card
 *     tags: [Checklists]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string, example: "Subtasks" }
 */
router.post('/:cardId/checklists', C.createChecklist);

/**
 * @swagger
 * /card-details/checklists/{checklistId}:
 *   delete:
 *     summary: Delete a checklist (cascades items)
 *     tags: [Checklists]
 */
router.delete('/checklists/:checklistId', C.deleteChecklist);

/**
 * @swagger
 * /card-details/checklists/{checklistId}/items:
 *   post:
 *     summary: Add item to a checklist
 *     tags: [Checklists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string, example: "Write unit tests" }
 */
router.post('/checklists/:checklistId/items', C.addChecklistItem);

/**
 * @swagger
 * /card-details/checklist-items/{itemId}/toggle:
 *   patch:
 *     summary: Toggle a checklist item completed/incomplete
 *     tags: [Checklists]
 */
router.patch('/checklist-items/:itemId/toggle', C.toggleChecklistItem);

/**
 * @swagger
 * /card-details/checklist-items/{itemId}:
 *   delete:
 *     summary: Delete a checklist item
 *     tags: [Checklists]
 */
router.delete('/checklist-items/:itemId', C.deleteChecklistItem);

// ─── Activities ──────────────────────────────────────────────
/**
 * @swagger
 * /card-details/activities/{boardId}:
 *   get:
 *     summary: Get activity log for a board
 *     tags: [Activities]
 */
router.get('/activities/:boardId', C.getActivities);

// ─── Search ──────────────────────────────────────────────────
/**
 * @swagger
 * /card-details/search/{boardId}:
 *   get:
 *     summary: Search and filter cards within a board
 *     tags: [Search]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search by title/description (ILIKE)
 *       - in: query
 *         name: labelId
 *         schema: { type: integer }
 *       - in: query
 *         name: memberId
 *         schema: { type: integer }
 *       - in: query
 *         name: hasDueDate
 *         schema: { type: string, enum: ["true"] }
 *       - in: query
 *         name: overdue
 *         schema: { type: string, enum: ["true"] }
 *     responses:
 *       200:
 *         description: Filtered cards
 */
router.get('/search/:boardId', C.search);

module.exports = router;
