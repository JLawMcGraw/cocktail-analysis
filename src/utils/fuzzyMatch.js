/**
 * Fuzzy matching utilities for ingredient matching
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance
 */
export function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate string similarity as a percentage
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity percentage (0-1)
 */
export function stringSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Normalize string for fuzzy matching
 * @param {string} str - String to normalize
 * @returns {string} - Normalized string
 */
export function fuzzyNormalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Check if two ingredients are similar enough to be considered a match
 * @param {string} ing1 - First ingredient
 * @param {string} ing2 - Second ingredient
 * @param {number} threshold - Similarity threshold (0-1), default 0.85
 * @returns {boolean} - True if similar enough
 */
export function areSimilarIngredients(ing1, ing2, threshold = 0.85) {
  const norm1 = fuzzyNormalize(ing1);
  const norm2 = fuzzyNormalize(ing2);

  if (norm1 === norm2) {
    return true;
  }

  const similarity = stringSimilarity(norm1, norm2);
  return similarity >= threshold;
}
