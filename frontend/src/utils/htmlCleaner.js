/**
 * Clean HTML content for email compatibility
 * Removes unnecessary styles and keeps only essential formatting
 */
export const cleanHtmlForEmail = (html) => {
  if (!html) return '';

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Function to clean a single element
  const cleanElement = (element) => {
    // Remove all style attributes with Tailwind variables
    if (element.style) {
      const newStyle = {};
      
      // Keep only essential styles
      if (element.style.fontWeight === 'bolder' || element.style.fontWeight === 'bold') {
        newStyle.fontWeight = 'bold';
      }
      if (element.style.fontStyle === 'italic') {
        newStyle.fontStyle = 'italic';
      }
      if (element.style.textDecoration === 'underline') {
        newStyle.textDecoration = 'underline';
      }
      if (element.style.color && !element.style.color.includes('rgb(34, 34, 34)')) {
        newStyle.color = element.style.color;
      }
      
      // Clear all styles and apply only clean ones
      element.removeAttribute('style');
      Object.keys(newStyle).forEach(key => {
        element.style[key] = newStyle[key];
      });
    }

    // Remove Tailwind and other unwanted attributes
    element.removeAttribute('class');
    if (element.hasAttribute('dir') && element.getAttribute('dir') === 'ltr') {
      element.removeAttribute('dir');
    }

    // Process child elements
    Array.from(element.children).forEach(cleanElement);
  };

  // Clean all elements
  Array.from(tempDiv.children).forEach(cleanElement);

  // Get the cleaned HTML
  let cleanedHtml = tempDiv.innerHTML;

  // Replace complex spans with simple formatting tags
  cleanedHtml = cleanedHtml.replace(
    /<span[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>(.*?)<\/span>/gi,
    '<strong>$1</strong>'
  );
  cleanedHtml = cleanedHtml.replace(
    /<span[^>]*style="[^"]*font-weight:\s*bolder[^"]*"[^>]*>(.*?)<\/span>/gi,
    '<strong>$1</strong>'
  );
  cleanedHtml = cleanedHtml.replace(
    /<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/span>/gi,
    '<em>$1</em>'
  );
  cleanedHtml = cleanedHtml.replace(
    /<span[^>]*style="[^"]*text-decoration:\s*underline[^"]*"[^>]*>(.*?)<\/span>/gi,
    '<u>$1</u>'
  );

  // Remove empty spans and replace them with their content
  cleanedHtml = cleanedHtml.replace(/<span[^>]*>(.*?)<\/span>/gi, '$1');

  // Clean up multiple consecutive spaces and line breaks
  cleanedHtml = cleanedHtml.replace(/\s+/g, ' ');
  cleanedHtml = cleanedHtml.replace(/(<br[^>]*>\s*){3,}/gi, '<br><br>');

  // Remove any remaining style attributes with Tailwind variables
  cleanedHtml = cleanedHtml.replace(/style="[^"]*--tw-[^"]*"/gi, '');

  // Ensure links are properly formatted and clickable - preserve existing styling
  cleanedHtml = cleanedHtml.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, function(match, href, text) {
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
      
      // Return properly formatted link
      return `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: underline;">${cleanText}</a>`;
    }
    
    // If link is malformed, return just the text
    return cleanText;
  });

  return cleanedHtml.trim();
};

/**
 * Convert contentEditable content to clean HTML
 * This should be called when saving templates
 */
export const processRichTextContent = (content) => {
  if (!content) return '';
  
  // Clean the HTML first
  const cleaned = cleanHtmlForEmail(content);
  
  // Ensure basic structure is maintained
  if (!cleaned.includes('<br>') && !cleaned.includes('<p>') && !cleaned.includes('<div>')) {
    // Convert line breaks to <br> tags
    return cleaned.replace(/\n/g, '<br>');
  }
  
  return cleaned;
};

