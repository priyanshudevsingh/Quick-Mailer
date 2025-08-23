/**
 * Statistics Service
 * Business logic for dashboard statistics and analytics
 */

const User = require('../../auth/models/User');
const Template = require('../../templates/models/Template');
const Attachment = require('../../attachments/models/Attachment');
const { NotFoundError } = require('../../../common/errors/AppError');

class StatisticsService {
  /**
   * Get dashboard statistics for a user
   * @param {number} userId - User ID
   * @returns {object} Dashboard statistics
   */
  async getDashboardStats(userId) {
    // Get user with email statistics
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Get parallel counts for efficiency
    const [templateCount, attachmentCount] = await Promise.all([
      Template.count({
        where: { 
          userId,
          isActive: true 
        }
      }),
      Attachment.count({
        where: { 
          userId,
          isActive: true 
        }
      })
    ]);

    return {
      templates: templateCount,
      attachments: attachmentCount,
      emailsSent: user.emailsSent || 0,
      drafts: user.draftsCreated || 0,
      user: {
        name: user.name,
        email: user.email,
        joinedAt: user.createdAt
      }
    };
  }

  /**
   * Get detailed analytics for a user
   * @param {number} userId - User ID
   * @returns {object} Detailed analytics
   */
  async getDetailedAnalytics(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Get templates with their usage statistics
    const templates = await Template.findAll({
      where: { userId, isActive: true },
      attributes: ['id', 'name', 'subject', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // Get attachments with their statistics
    const attachments = await Attachment.findAll({
      where: { userId, isActive: true },
      attributes: ['id', 'originalName', 'mimetype', 'size', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // Calculate storage usage
    const totalStorageUsed = attachments.reduce((sum, att) => sum + att.size, 0);

    // Group attachments by type
    const attachmentsByType = attachments.reduce((groups, attachment) => {
      const type = attachment.mimetype.split('/')[0];
      if (!groups[type]) {
        groups[type] = { count: 0, size: 0 };
      }
      groups[type].count++;
      groups[type].size += attachment.size;
      return groups;
    }, {});

    // Calculate activity over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTemplates = templates.filter(t => t.createdAt >= thirtyDaysAgo);
    const recentAttachments = attachments.filter(a => a.createdAt >= thirtyDaysAgo);

    return {
      summary: {
        totalTemplates: templates.length,
        totalAttachments: attachments.length,
        totalStorageUsed,
        totalStorageUsedMB: Math.round(totalStorageUsed / 1024 / 1024 * 100) / 100,
        emailsSent: user.emailsSent || 0,
        draftsCreated: user.draftsCreated || 0
      },
      templates: {
        total: templates.length,
        recent: recentTemplates.length,
        list: templates.slice(0, 10) // Latest 10 templates
      },
      attachments: {
        total: attachments.length,
        recent: recentAttachments.length,
        byType: attachmentsByType,
        list: attachments.slice(0, 10) // Latest 10 attachments
      },
      activity: {
        last30Days: {
          templatesCreated: recentTemplates.length,
          attachmentsUploaded: recentAttachments.length
        }
      }
    };
  }

  /**
   * Get system-wide statistics (admin only)
   * @returns {object} System statistics
   */
  async getSystemStats() {
    const [totalUsers, totalTemplates, totalAttachments] = await Promise.all([
      User.count(),
      Template.count({ where: { isActive: true } }),
      Attachment.count({ where: { isActive: true } })
    ]);

    // Get total emails sent across all users
    const emailStats = await User.findAll({
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('emailsSent')), 'totalEmailsSent'],
        [require('sequelize').fn('SUM', require('sequelize').col('draftsCreated')), 'totalDrafts']
      ]
    });

    return {
      users: totalUsers,
      templates: totalTemplates,
      attachments: totalAttachments,
      emails: {
        sent: emailStats[0]?.dataValues?.totalEmailsSent || 0,
        drafts: emailStats[0]?.dataValues?.totalDrafts || 0
      }
    };
  }
}

module.exports = StatisticsService;
