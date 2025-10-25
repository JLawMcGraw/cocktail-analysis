/**
 * CSV Parser service using PapaParse
 */

import Papa from 'papaparse';

/**
 * Parse CSV file
 * @param {File} file - File to parse
 * @param {Object} options - Papa Parse options
 * @returns {Promise<Object>} - Parsed data
 */
export function parseCSV(file, options = {}) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      ...options,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0].message));
        } else {
          resolve(results);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Validate inventory CSV structure
 * @param {Array} data - Parsed CSV data
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateInventoryCSV(data) {
  if (!data || data.length === 0) {
    return { valid: false, error: 'Inventory file is empty' };
  }

  const firstRow = data[0];
  if (!firstRow.Name || firstRow['Stock Number'] === undefined) {
    return {
      valid: false,
      error: 'Inventory CSV must have "Name" and "Stock Number" columns',
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate recipe CSV structure
 * @param {Array} data - Parsed CSV data
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateRecipeCSV(data) {
  if (!data || data.length === 0) {
    return { valid: false, error: 'Recipe file is empty' };
  }

  const firstRow = data[0];
  if (!firstRow['Drink Name'] || !firstRow.Ingredients) {
    return {
      valid: false,
      error: 'Recipe CSV must have "Drink Name" and "Ingredients" columns',
    };
  }

  return { valid: true, error: null };
}
