/**
 * File Utilities
 * Common file-related helper functions
 */

const path = require('path');
const { VALIDATION } = require('../constants');

/**
 * Get file extension from filename
 * @param {string} filename - Name of the file
 * @returns {string} File extension without dot
 */
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase().slice(1);
};

/**
 * Check if file type is allowed
 * @param {string} filename - Name of the file
 * @param {string[]} allowedTypes - Array of allowed extensions
 * @returns {boolean} True if file type is allowed
 */
const isFileTypeAllowed = (filename, allowedTypes) => {
  const extension = getFileExtension(filename);
  return allowedTypes.includes(extension);
};

/**
 * Check if file is a document
 * @param {string} filename - Name of the file
 * @returns {boolean} True if file is a document
 */
const isDocument = (filename) => {
  return isFileTypeAllowed(filename, VALIDATION.FILE.ALLOWED_TYPES.DOCUMENTS);
};

/**
 * Check if file is an image
 * @param {string} filename - Name of the file
 * @returns {boolean} True if file is an image
 */
const isImage = (filename) => {
  return isFileTypeAllowed(filename, VALIDATION.FILE.ALLOWED_TYPES.IMAGES);
};

/**
 * Check if file is a spreadsheet
 * @param {string} filename - Name of the file
 * @returns {boolean} True if file is a spreadsheet
 */
const isSpreadsheet = (filename) => {
  return isFileTypeAllowed(filename, VALIDATION.FILE.ALLOWED_TYPES.SPREADSHEETS);
};

/**
 * Get all allowed file types
 * @returns {string[]} Array of all allowed file extensions
 */
const getAllowedFileTypes = () => {
  const { DOCUMENTS, IMAGES, SPREADSHEETS } = VALIDATION.FILE.ALLOWED_TYPES;
  return [...DOCUMENTS, ...IMAGES, ...SPREADSHEETS];
};

/**
 * Validate file size
 * @param {number} fileSize - Size of the file in bytes
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {boolean} True if file size is valid
 */
const isFileSizeValid = (fileSize, maxSize = VALIDATION.FILE.MAX_SIZE) => {
  return fileSize <= maxSize;
};

/**
 * Generate safe filename
 * @param {string} originalName - Original filename
 * @returns {string} Safe filename with timestamp
 */
const generateSafeFilename = (originalName) => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);
  const extension = getFileExtension(originalName);
  const baseName = path.basename(originalName, `.${extension}`);
  
  // Remove special characters and spaces
  const safeName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${safeName}_${timestamp}_${randomNum}.${extension}`;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  getFileExtension,
  isFileTypeAllowed,
  isDocument,
  isImage,
  isSpreadsheet,
  getAllowedFileTypes,
  isFileSizeValid,
  generateSafeFilename,
  formatFileSize,
};
