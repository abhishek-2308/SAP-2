const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const CardAttachmentController = require('../controllers/cardAttachmentController');

/**
 * @swagger
 * tags:
 *   name: Attachments
 *   description: Card file management
 */

router.get('/:cardId', CardAttachmentController.list);
router.post('/:cardId', upload.single('file'), CardAttachmentController.add);
router.delete('/:attachmentId', CardAttachmentController.delete);

module.exports = router;
