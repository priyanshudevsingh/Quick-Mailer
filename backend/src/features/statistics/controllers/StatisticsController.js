/**
 * Statistics Controller
 * Handles HTTP requests for statistics endpoints
 */

const StatisticsService = require('../services/StatisticsService');
const ResponseUtils = require('../../../common/utils/responseUtils');
const asyncHandler = require('../../../common/utils/asyncHandler');

class StatisticsController {
  constructor() {
    this.statisticsService = new StatisticsService();
  }

  /**
   * Get dashboard statistics
   * GET /stats/dashboard
   */
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await this.statisticsService.getDashboardStats(req.user.id);
    
    ResponseUtils.success(res, { stats }, 'Dashboard statistics retrieved');
  });

  /**
   * Get detailed analytics
   * GET /stats/analytics
   */
  getDetailedAnalytics = asyncHandler(async (req, res) => {
    const analytics = await this.statisticsService.getDetailedAnalytics(req.user.id);
    
    ResponseUtils.success(res, { analytics }, 'Detailed analytics retrieved');
  });

  /**
   * Get system statistics (admin only)
   * GET /stats/system
   */
  getSystemStats = asyncHandler(async (req, res) => {
    // In a real app, you'd check for admin role here
    const systemStats = await this.statisticsService.getSystemStats();
    
    ResponseUtils.success(res, { stats: systemStats }, 'System statistics retrieved');
  });
}

module.exports = StatisticsController;
