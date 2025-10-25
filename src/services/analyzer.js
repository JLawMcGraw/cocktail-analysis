/**
 * Recipe analysis service - matches recipes against inventory
 */

import { normalizeIngredient } from '../utils/formatters.js';
import { areSimilarIngredients } from '../utils/fuzzyMatch.js';
import { addAliases } from '../utils/aliases.js';

/**
 * Create ingredient alias map from inventory
 * @param {Array} inventory - Inventory items
 * @returns {Map} - Map of ingredient names to availability
 */
export function createAliasMap(inventory) {
  const inv = new Map();

  inventory
    .filter((item) => item['Stock Number'] > 0)
    .forEach(function (item) {
      const name = item.Name.toLowerCase();
      inv.set(name, true);

      // Add aliases for common ingredient variations
      addAliases(inv, name);
    });

  // Common ingredients assumed available
  const commonItems = [
    'ice',
    'crushed ice',
    'ice cubes',
    'sugar',
    'water',
    'salt',
    'mint',
    'fresh mint',
  ];
  commonItems.forEach((item) => inv.set(item, true));

  return inv;
}

/**
 * Check if ingredient is in inventory
 * @param {string} ingredientLine - Raw ingredient line from recipe
 * @param {Map} inventory - Inventory map
 * @returns {boolean} - True if ingredient is available
 */
export function hasIngredient(ingredientLine, inventory) {
  // Skip garnish items
  if (ingredientLine.toLowerCase().includes('garnish')) {
    return true;
  }

  const normalized = normalizeIngredient(ingredientLine);

  // Direct match
  if (inventory.has(normalized)) {
    return true;
  }

  // Partial match (ingredient contains or is contained by inventory item)
  for (const [invItem] of inventory) {
    if (normalized.includes(invItem) || invItem.includes(normalized)) {
      return true;
    }

    // Fuzzy match for spelling variations (e.g., "passionfruit" vs "passion fruit")
    if (areSimilarIngredients(normalized, invItem, 0.9)) {
      return true;
    }
  }

  return false;
}

/**
 * Run analysis on recipes against inventory
 * @param {Array} inventory - Inventory items
 * @param {Array} recipes - Recipe items
 * @returns {Object} - Analysis results with perfect, veryGood, and good matches
 */
export function runAnalysis(inventory, recipes) {
  const inv = createAliasMap(inventory);

  const results = { perfect: [], veryGood: [], good: [] };

  recipes.forEach(function (recipe) {
    if (!recipe.Ingredients || !recipe['Drink Name']) {
      return;
    }

    const lines = recipe.Ingredients.split('\n').filter((l) => l.trim());
    let matches = 0;
    const missing = [];
    const matched = [];

    lines.forEach(function (line) {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        return;
      }

      if (hasIngredient(trimmedLine, inv)) {
        matches++;
        matched.push(trimmedLine);
      } else {
        missing.push(trimmedLine);
      }
    });

    const total = matches + missing.length;
    const compatibility = total > 0 ? Math.round((matches / total) * 100) : 0;

    const analysis = {
      name: recipe['Drink Name'],
      compatibility: compatibility,
      matches: matches,
      total: total,
      missing: missing,
      matched: matched,
      fullRecipe: recipe,
    };

    if (compatibility === 100) {
      results.perfect.push(analysis);
    } else if (compatibility >= 80) {
      results.veryGood.push(analysis);
    } else if (compatibility >= 60) {
      results.good.push(analysis);
    }
  });

  return results;
}

/**
 * Generate shopping list from analysis results
 * @param {Object} results - Analysis results
 * @returns {Array} - Sorted array of [ingredient, {count, recipes}]
 */
export function generateShoppingList(results) {
  const missing = {};

  results.veryGood.concat(results.good).forEach(function (recipe) {
    recipe.missing.forEach(function (ingredient) {
      const cleaned = normalizeIngredient(ingredient);

      if (cleaned && !cleaned.includes('ice') && !cleaned.includes('garnish')) {
        if (!missing[cleaned]) {
          missing[cleaned] = { count: 0, recipes: [] };
        }
        missing[cleaned].count++;
        if (!missing[cleaned].recipes.includes(recipe.name)) {
          missing[cleaned].recipes.push(recipe.name);
        }
      }
    });
  });

  const sorted = Object.keys(missing)
    .map((key) => [key, missing[key]])
    .sort((a, b) => b[1].recipes.length - a[1].recipes.length);

  return sorted;
}
