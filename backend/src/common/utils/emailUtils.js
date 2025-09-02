/**
 * Email Utilities
 * Common email-related helper functions
 */

/**
 * Replace placeholders in text with actual values
 * @param {string} text - Text containing placeholders like {{name}}
 * @param {object} placeholders - Object with placeholder values
 * @returns {string} Text with placeholders replaced
 */
const replacePlaceholders = (text, placeholders = {}) => {
  if (!text) return '';
  
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return placeholders[key] || match;
  });
};

/**
 * Clean HTML for email compatibility
 * Removes problematic CSS variables and styles that don't work in email clients
 * @param {string} html - HTML content to clean
 * @returns {string} Cleaned HTML
 */
const cleanHtmlForEmail = (html) => {
  if (!html) return '';
  
  let cleaned = html;
  
  // First pass: Remove problematic elements and attributes
  cleaned = cleaned
    // Remove CSS variables (--variable-name and --tw-*)
    .replace(/--[\w-]+:\s*[^;]+;/g, '')
    .replace(/--tw-[\w-]+:\s*[^;]+;/g, '')
    // Remove complex CSS that email clients don't support
    .replace(/var\([^)]+\)/g, '')
    // Remove @media queries
    .replace(/@media[^{]+\{[^}]*\}/g, '')
    // Remove problematic attributes
    .replace(/data-saferedirecturl="[^"]*"/gi, '')
    .replace(/<wbr[^>]*>/gi, '')
    // Remove style attributes that contain CSS variables or complex styles
    .replace(/style="[^"]*--[^"]*"/g, '')
    .replace(/style="[^"]*var\([^"]*"/g, '');

  // Second pass: Fix and preserve existing links
  // First, clean up existing links to ensure they're Gmail-compatible
  cleaned = cleaned.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, function(match, href, text) {
    // Clean the href and text
    const cleanHref = href.trim();
    const cleanText = text.trim();
    
    // Only process if we have a valid href and text
    if (cleanHref && cleanText) {
      // Ensure URL has protocol
      let finalUrl = cleanHref;
      if (!finalUrl.match(/^https?:\/\//)) {
        finalUrl = 'https://' + finalUrl;
      }
      
      // Return Gmail-compatible link
      return `<a href="${finalUrl}" style="color: #1155cc; text-decoration: none;">${cleanText}</a>`;
    }
    
    // If link is malformed, return just the text
    return cleanText;
  });
  
  // Third pass: Convert remaining plain URLs to clickable links
  // Only convert URLs that are not already inside <a> tags
  cleaned = cleaned.replace(/(?<!<a[^>]*>)(https?:\/\/[^\s<>"]+)(?![^<]*<\/a>)/gi, function(url) {
    return `<a href="${url}" style="color: #1155cc; text-decoration: none;">${url}</a>`;
  });
  
  // Fourth pass: Convert span styling to simple tags
  cleaned = cleaned
    .replace(/<span[^>]*font-weight:\s*bold[^>]*>(.*?)<\/span>/gi, '<strong>$1</strong>')
    .replace(/<span[^>]*font-weight:\s*700[^>]*>(.*?)<\/span>/gi, '<strong>$1</strong>')
    .replace(/<span[^>]*font-style:\s*italic[^>]*>(.*?)<\/span>/gi, '<em>$1</em>')
    .replace(/<span[^>]*text-decoration:\s*underline[^>]*>(.*?)<\/span>/gi, '<u>$1</u>');
  
  // Final cleanup
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .trim();
    
  return cleaned;
};

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Extract placeholders from template text
 * @param {string} text - Text containing placeholders
 * @returns {string[]} Array of unique placeholder names
 */
const extractPlaceholders = (text) => {
  if (!text) return [];
  
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  const placeholders = [];
  let match;

  while ((match = placeholderRegex.exec(text)) !== null) {
    placeholders.push(match[1].trim());
  }

  return [...new Set(placeholders)]; // Remove duplicates
};

/**
 * Validate that all required placeholders are provided
 * @param {string[]} requiredPlaceholders - Array of required placeholder names
 * @param {object} providedPlaceholders - Object with provided values
 * @returns {object} { isValid: boolean, missing: string[] }
 */
const validatePlaceholders = (requiredPlaceholders, providedPlaceholders) => {
  const missing = requiredPlaceholders.filter(
    placeholder => !(placeholder in providedPlaceholders)
  );
  
  return {
    isValid: missing.length === 0,
    missing
  };
};

module.exports = {
  replacePlaceholders,
  cleanHtmlForEmail,
  isValidEmail,
  extractPlaceholders,
  validatePlaceholders,
};
