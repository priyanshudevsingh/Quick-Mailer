/**
 * Template Routes
 * Route definitions for template endpoints
 */

const express = require('express');
const TemplateController = require('../controllers/TemplateController');
const { authenticateToken } = require('../../../common/middleware/auth');

const router = express.Router();
const templateController = new TemplateController();

// All template routes require authentication
router.use(authenticateToken);

// Template CRUD operations
router.get('/', templateController.getTemplates);
router.post('/', templateController.createTemplate);
router.get('/stats', templateController.getTemplateStats);
router.get('/:id', templateController.getTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);
router.post('/:id/duplicate', templateController.duplicateTemplate);

module.exports = router;
