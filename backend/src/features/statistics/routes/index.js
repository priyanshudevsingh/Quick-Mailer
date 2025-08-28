/**
 * Statistics Routes
 */

const express = require('express');
const StatisticsController = require('../controllers/StatisticsController');
const { authenticateToken } = require('../../../common/middleware/auth');

const router = express.Router();
const statisticsController = new StatisticsController();

router.use(authenticateToken);

// Root stats endpoint (returns dashboard stats)
router.get('/', statisticsController.getDashboardStats);

// Statistics endpoints
router.get('/dashboard', statisticsController.getDashboardStats);
router.get('/analytics', statisticsController.getDetailedAnalytics);
router.get('/system', statisticsController.getSystemStats);

module.exports = router;
