/**
 * Utility functions for formatting and validation
 */

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Normalize ingredient name for matching
 * @param {string} ingredientLine - Raw ingredient line from recipe
 * @returns {string} - Normalized ingredient name
 */
export function normalizeIngredient(ingredientLine) {
  return ingredientLine
    .toLowerCase()
    .replace(/^\d+[\s\/]*\d*[\s\/]*\d*\s*/, '') // Remove measurements
    .replace(
      /ounces?|oz|teaspoons?|tsp|tablespoons?|tbsp|dash(es)?|drops?|cups?|ml|cl/gi,
      ''
    )
    .replace(/fresh|chilled|cold|room temperature|hot/gi, '')
    .trim();
}

/**
 * Get time ago string from timestamp
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Human-readable time ago string
 */
export function getTimeAgo(timestamp) {
  const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
  if (seconds < 60) {
    return 'Just now';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes + 'm ago';
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours + 'h ago';
  }
  const days = Math.floor(hours / 24);
  return days + 'd ago';
}

/**
 * Escape CSV values
 * @param {*} val - Value to escape
 * @returns {string} - Escaped CSV value
 */
export function escapeCsv(val) {
  if (!val && val !== 0) {
    return '';
  }
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
