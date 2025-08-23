/**
 * Statistics Routes
 */

const express = require('express');
const StatisticsController = require('../controllers/StatisticsController');
const { authenticateToken } = require('../../../common/middleware/auth');

const router = express.Router();
const statisticsController = new StatisticsController();

router.use(authenticateToken);

// Statistics endpoints
router.get('/dashboard', statisticsController.getDashboardStats);
router.get('/analytics', statisticsController.getDetailedAnalytics);
router.get('/system', statisticsController.getSystemStats);

module.exports = router;
