/**
 * Attachment Routes
 */

const express = require('express');
const multer = require('multer');
const AttachmentController = require('../controllers/AttachmentController');
const { authenticateToken } = require('../../../common/middleware/auth');

const router = express.Router();
const attachmentController = new AttachmentController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.use(authenticateToken);

// Attachment CRUD operations
router.get('/', attachmentController.getAttachments);
router.post('/', upload.single('file'), attachmentController.uploadFile);
router.get('/stats', attachmentController.getAttachmentStats);
router.get('/:id', attachmentController.getAttachment);
router.put('/:id', attachmentController.updateAttachment);
router.delete('/:id', attachmentController.deleteAttachment);
router.get('/:id/download', attachmentController.downloadAttachment);
router.get('/:id/presigned-url', attachmentController.getPresignedUrl);

module.exports = router;
