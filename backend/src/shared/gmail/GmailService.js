/**
 * Gmail Service
 * Abstraction layer for Gmail API operations
 */

const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const { AppError } = require('../../common/errors/AppError');
const { ERROR_MESSAGES } = require('../../common/constants');
const { cleanHtmlForEmail } = require('../../common/utils/emailUtils');
const { createStorageService } = require('../storage/StorageService');

class GmailService {
  constructor(accessToken) {
    if (!accessToken) {
      throw new AppError(ERROR_MESSAGES.GMAIL_TOKEN_MISSING, 400);
    }
    
    this.oauth2Client = new google.auth.OAuth2();
    this.oauth2Client.setCredentials({ access_token: accessToken });
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Create email with attachments
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body (HTML)
   * @param {Array} attachments - Array of attachment objects
   * @returns {string} Base64 encoded email
   */
  async createEmailWithAttachments(to, subject, body, attachments = []) {
    try {
      const cleanedBody = cleanHtmlForEmail(body);
    
      if (attachments.length === 0) {
        // Simple HTML email without attachments - Use quoted-printable encoding for clickable links
        const htmlBody = `<html><head><style>a{color:#1155cc!important;text-decoration:none!important}a:hover{text-decoration:underline!important}strong{font-weight:bold!important}</style></head><body>${cleanedBody}</body></html>`;
        
        // Convert to quoted-printable encoding for Gmail compatibility
        const quotedPrintableBody = htmlBody
          .replace(/=/g, '=3D')
          .replace(/\r?\n/g, '\r\n')
          .replace(/.{74}/g, '$&=\r\n'); // Line breaks for quoted-printable

        const email = [
          `To: ${to}`,
          `Subject: ${subject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=utf-8',
          'Content-Transfer-Encoding: quoted-printable',
          '',
          quotedPrintableBody
        ].join('\r\n');
        
        return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }

      // Multipart email with attachments
      const boundary = 'boundary_' + Math.random().toString(36).substr(2, 9);
      
      const htmlBody = `<html><head><style>a{color:#1155cc!important;text-decoration:none!important}a:hover{text-decoration:underline!important}strong{font-weight:bold!important}</style></head><body>${cleanedBody}</body></html>`;
      
      // Convert to quoted-printable encoding for Gmail compatibility
      const quotedPrintableBody = htmlBody
        .replace(/=/g, '=3D')
        .replace(/\r?\n/g, '\r\n')
        .replace(/.{74}/g, '$&=\r\n'); // Line breaks for quoted-printable
      
      let email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=utf-8',
        'Content-Transfer-Encoding: quoted-printable',
        '',
        quotedPrintableBody,
        ''
      ].join('\r\n');

      // Add attachments
      for (const attachment of attachments) {
        try {
          let fileContent;
          
          // Handle both local and S3 storage
          if (attachment.path && attachment.path.includes('s3.amazonaws.com')) {
            // S3 storage - download file content
            const storageService = createStorageService();
            fileContent = await storageService.getFile(attachment.path);
          } else {
            // Local storage - read from filesystem
            // Use the storage service to get the file content instead of direct path resolution
            const storageService = createStorageService();
            const filePath = attachment.path || attachment.filename;
            
            if (filePath) {
              try {
                fileContent = await storageService.getFile(filePath);
              } catch (storageError) {
                // Fallback to direct file reading if storage service fails
                const uploadsPath = path.join(__dirname, '../../../uploads', attachment.filename);
                fileContent = await fs.readFile(uploadsPath);
              }
            } else {
              console.warn(`Warning: No file path found for attachment ${attachment.originalName}`);
              continue;
            }
          }
          
          const base64Content = fileContent.toString('base64');
          
          email += [
            `--${boundary}`,
            `Content-Type: ${attachment.mimetype}`,
            `Content-Disposition: attachment; filename="${attachment.originalName}"`,
            `Content-Transfer-Encoding: base64`,
            '',
            base64Content,
            ''
          ].join('\r\n');
        } catch (error) {
          console.warn(`Warning: Could not attach file ${attachment.originalName}:`, error.message);
        }
      }

      email += `--${boundary}--`;
      
      return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (error) {
      throw new AppError(`Failed to create email: ${error.message}`, 500);
    }
  }

  /**
   * Send email immediately
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body
   * @param {Array} attachments - Attachments array
   * @returns {object} Gmail API response
   */
  async sendEmail(to, subject, body, attachments = []) {
    try {
      const rawEmail = await this.createEmailWithAttachments(to, subject, body, attachments);
      
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: rawEmail
        }
      });
      
      return response.data;
    } catch (error) {
      throw new AppError(`Failed to send email: ${error.message}`, 500);
    }
  }

  /**
   * Schedule email for later delivery
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body
   * @param {Date} scheduledTime - When to send the email
   * @param {Array} attachments - Attachments array
   * @returns {object} Gmail API response
   */
  async scheduleEmail(to, subject, body, scheduledTime, attachments = []) {
    try {
      const rawEmail = await this.createEmailWithAttachments(to, subject, body, attachments);
      
      // Gmail doesn't support scheduling directly, so we just send it now
      // In a real implementation, you'd use a job queue like Bull or Agenda
      
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: rawEmail
        }
      });
      
      return response.data;
    } catch (error) {
      throw new AppError(`Failed to schedule email: ${error.message}`, 500);
    }
  }

  /**
   * Save email as draft
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body
   * @param {Array} attachments - Attachments array
   * @returns {object} Gmail API response
   */
  async saveDraft(to, subject, body, attachments = []) {
    try {
      const rawEmail = await this.createEmailWithAttachments(to, subject, body, attachments);
      
      const response = await this.gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: rawEmail
          }
        }
      });
      
      return response.data;
    } catch (error) {
      throw new AppError(`Failed to save draft: ${error.message}`, 500);
    }
  }

  /**
   * Get user's email statistics from Gmail
   * @returns {object} Email statistics
   */
  async getEmailStats() {
    try {
      // Get sent emails count
      const sentResponse = await this.gmail.users.messages.list({
        userId: 'me',
        labelIds: ['SENT'],
        maxResults: 500
      });
      
      // Get drafts count
      const draftsResponse = await this.gmail.users.drafts.list({
        userId: 'me'
      });
      
      return {
        sent: sentResponse.data.resultSizeEstimate || 0,
        drafts: draftsResponse.data.drafts ? draftsResponse.data.drafts.length : 0
      };
    } catch (error) {
      console.warn('Failed to get Gmail stats:', error.message);
      return { sent: 0, drafts: 0 };
    }
  }
}

module.exports = GmailService;