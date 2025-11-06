/**
 * Search and Filters Feature Module
 * Handles search, filtering, and sorting functionality
 */

import { normalizeIngredient, escapeHtml } from '../utils/formatters.js';
import { areSimilarIngredients } from '../utils/fuzzyMatch.js';
import { createRecipeCard } from './analysis.js';
import { APP } from '../app.js';

/**
 * Setup search functionality
 */
export function setupSearch(elements) {
  const ingredients = [];
  if (APP.currentInventory) {
    APP.currentInventory.forEach((val, key) => {
      if (!['ice', 'crushed ice', 'ice cubes', 'water', 'salt'].includes(key)) {
        ingredients.push(key);
      }
    });
  }
  ingredients.sort();

  if (elements.ingredientSelect) {
    elements.ingredientSelect.innerHTML = '<option value="">-- Select an ingredient --</option>';
    ingredients.forEach((ing) => {
      const option = document.createElement('option');
      option.value = ing;
      option.textContent = ing.charAt(0).toUpperCase() + ing.slice(1);
      elements.ingredientSelect.appendChild(option);
    });
  }
}

/**
 * Handle ingredient search
 */
export function handleSearch(elements, callbacks) {
  const selected = elements.ingredientSelect.value;
  if (!selected) return;

  const allRecipes = APP.allResults.perfect.concat(
    APP.allResults.veryGood,
    APP.allResults.good,
  );
  const matches = [];

  allRecipes.forEach((recipe) => {
    const ingredientLines = recipe.fullRecipe.Ingredients.split('\n');
    let foundMatch = false;

    for (const line of ingredientLines) {
      const normalized = normalizeIngredient(line);
      const selectedNorm = normalizeIngredient(selected);

      if (
        normalized.includes(selectedNorm) ||
        selectedNorm.includes(normalized) ||
        areSimilarIngredients(normalized, selectedNorm, 0.85)
      ) {
        foundMatch = true;
        break;
      }
    }

    if (foundMatch) {
      matches.push(recipe);
    }
  });

  if (matches.length === 0) {
    elements.searchResponse.innerHTML = `<div style="padding: 20px;">No cocktails found with <strong>${escapeHtml(selected)}</strong></div>`;
  } else {
    let html = `<div style="font-weight: bold; margin-bottom: 15px;">Found ${matches.length} cocktail${matches.length > 1 ? 's' : ''} with <strong>${escapeHtml(selected)}</strong>:</div>`;

    matches.slice(0, 15).forEach((recipe) => {
      const category = APP.allResults.perfect.includes(recipe)
        ? 'perfect'
        : APP.allResults.veryGood.includes(recipe)
          ? 'veryGood'
          : 'good';
      const index = APP.allResults[category].indexOf(recipe);
      html += createRecipeCard(recipe, category, index);
    });

    if (matches.length > 15) {
      html += '<div style="margin-top: 10px; font-style: italic;">Showing first 15 results</div>';
    }

    elements.searchResponse.innerHTML = html;

    elements.searchResponse.querySelectorAll('.recipe-item').forEach((item) => {
      item.addEventListener('click', function () {
        const category = this.dataset.category;
        const index = parseInt(this.dataset.index);
        callbacks.showRecipe(category, index);
      });
    });
  }

  elements.searchResponse.classList.add('active');
}

/**
 * Apply search and filters
 */
export function applySearchAndFilters(results) {
  let allRecipes = [
    ...results.perfect.map((r) => ({ ...r, category: 'perfect' })),
    ...results.veryGood.map((r) => ({ ...r, category: 'veryGood' })),
    ...results.good.map((r) => ({ ...r, category: 'good' })),
  ];

  // Apply perfect matches filter
  if (APP.activeFilters.perfectMatches) {
    allRecipes = allRecipes.filter((r) => r.missing.length === 0);
  }

  // Apply missing 1 ingredient filter
  if (APP.activeFilters.missingOne) {
    allRecipes = allRecipes.filter((r) => r.missing.length === 1);
  }

  // Apply sorting
  allRecipes = sortRecipes(allRecipes);

  // Reorganize back into categories
  return {
    perfect: allRecipes.filter((r) => r.category === 'perfect'),
    veryGood: allRecipes.filter((r) => r.category === 'veryGood'),
    good: allRecipes.filter((r) => r.category === 'good'),
  };
}

/**
 * Sort recipes
 */
function sortRecipes(recipes) {
  const sorted = [...recipes];
  switch (APP.sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'compatibility':
    default:
      return sorted.sort((a, b) => b.compatibility - a.compatibility);
  }
}

/**
 * Update filter UI
 */
export function updateFilterUI(elements) {
  if (APP.allResults && elements.filterControls) {
    elements.filterControls.style.display = 'block';
  }

  const activeFiltersArray = [];
  if (APP.activeFilters.perfectMatches) {
    activeFiltersArray.push('Perfect Matches');
  }
  if (APP.activeFilters.missingOne) {
    activeFiltersArray.push('Missing 1 Ingredient');
  }

  if (elements.activeFiltersDiv) {
    if (activeFiltersArray.length > 0) {
      let html = '';
      activeFiltersArray.forEach((filter) => {
        html += `<span class="filter-tag">${escapeHtml(filter)}</span>`;
      });
      elements.activeFiltersDiv.innerHTML = html;
      elements.activeFiltersDiv.style.display = 'flex';
    } else {
      elements.activeFiltersDiv.style.display = 'none';
    }
  }

  // Update button active states
  if (elements.perfectMatchesBtn) {
    elements.perfectMatchesBtn.classList.toggle('active', APP.activeFilters.perfectMatches);
  }
  if (elements.almostThereBtn) {
    elements.almostThereBtn.classList.toggle('active', APP.activeFilters.missingOne);
  }
}

/**
 * Refresh results with filters
 */
export function refreshResults(callbacks) {
  if (!APP.allResults) return;

  const filteredResults = applySearchAndFilters(APP.allResults);
  callbacks.displayResults(filteredResults);
  updateFilterUI(callbacks.elements);
}

/**
 * Clear all filters
 */
export function clearAllFilters(elements, callbacks) {
  APP.activeFilters.perfectMatches = false;
  APP.activeFilters.missingOne = false;
  APP.sortBy = 'compatibility';
  if (elements.sortSelect) {
    elements.sortSelect.value = 'compatibility';
  }
  refreshResults(callbacks);
}

/**
 * Show random cocktail
 */
export function showRandomCocktail(callback) {
  if (!APP.allResults) return;

  const allRecipes = [
    ...APP.allResults.perfect,
    ...APP.allResults.veryGood,
    ...APP.allResults.good,
  ];

  if (allRecipes.length === 0) return;

  const random = allRecipes[Math.floor(Math.random() * allRecipes.length)];

  let category, index;
  if (APP.allResults.perfect.includes(random)) {
    category = 'perfect';
    index = APP.allResults.perfect.indexOf(random);
  } else if (APP.allResults.veryGood.includes(random)) {
    category = 'veryGood';
    index = APP.allResults.veryGood.indexOf(random);
  } else {
    category = 'good';
    index = APP.allResults.good.indexOf(random);
  }

  callback(category, index);
}
