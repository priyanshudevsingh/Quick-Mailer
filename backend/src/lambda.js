/**
 * AWS Lambda Handler
 * Wraps Express app with serverless-http for serverless deployment
 */

const serverless = require('serverless-http');
const { app } = require('./server');

// Export the serverless-wrapped Express app
module.exports.handler = serverless(app, {
  // Customize serverless-http options for better Lambda performance
  binary: [
    'application/octet-stream',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/*',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  // Handle large payloads
  request: {
    // Increase payload size limit for Lambda
    limit: '10mb'
  },
  // Optimize response handling
  response: {
    // Ensure proper CORS headers
    headers: {
      'Access-Control-Allow-Origin': 'https://quick-mailer-seven.vercel.app',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Credentials': 'true'
    }
  },
  // Add request logging for debugging
  request: (req, event, context) => {
    console.log('🔍 Lambda Request:', {
      path: req.path,
      method: req.method,
      url: req.url,
      headers: req.headers
    });
    return req;
  }
});
