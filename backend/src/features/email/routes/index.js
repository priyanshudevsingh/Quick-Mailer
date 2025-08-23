/**
 * Email Routes
 */

const express = require('express');
const multer = require('multer');
const EmailController = require('../controllers/EmailController');
const { authenticateToken, requireGmailAccess } = require('../../../common/middleware/auth');

const router = express.Router();
const emailController = new EmailController();

// Configure multer for Excel file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// All routes require authentication and Gmail access
router.use(authenticateToken);
router.use(requireGmailAccess);

// Email operations
router.post('/send', emailController.sendEmail);
router.post('/draft', emailController.saveDraft);

// Mass email operations
router.get('/mass-email/template/:templateId', emailController.downloadExcelTemplate);
router.post('/mass-email', upload.single('excelFile'), emailController.sendMassEmail);
router.post('/mass-email/drafts', upload.single('excelFile'), emailController.saveMassEmailAsDrafts);

// Email history
router.get('/history', emailController.getEmailHistory);

module.exports = router;
