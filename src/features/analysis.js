/**
 * Analysis Feature Module
 * Handles running analysis and displaying results
 */

import { runAnalysis, generateShoppingList } from '../services/analyzer.js';
import { escapeHtml } from '../utils/formatters.js';
import { APP } from '../app.js';

/**
 * Run analysis
 */
export function analyze(callbacks) {
  if (!APP.editableInventory || APP.editableInventory.length === 0) {
    callbacks.showError('Please upload your inventory first');
    return;
  }

  if (!APP.recipeData || APP.recipeData.length === 0) {
    callbacks.showError('Please upload recipes first');
    return;
  }

  // Get button and show loading state
  const analyzeBtn = callbacks.elements?.analyzeBtn || document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ Analyzing...';
  }

  // Small delay to show loading state
  setTimeout(() => {
    try {
      const results = runAnalysis(APP.editableInventory, APP.recipeData);
      APP.allResults = results;
      callbacks.displayResults(results);
      callbacks.displayFavorites();
      callbacks.displayShoppingList(results);
      callbacks.setupSearch();
      callbacks.displayRecentlyViewed();

      // Show success feedback
      if (analyzeBtn) {
        analyzeBtn.textContent = '✓ Analysis Complete!';
        setTimeout(() => {
          analyzeBtn.textContent = 'Analyze My Bar';
          analyzeBtn.disabled = false;
        }, 1500);
      }

      // Switch to recipes tab after a short delay
      setTimeout(() => {
        callbacks.switchTab('recipesTab');
      }, 300);
    } catch (error) {
      console.error('Analysis error:', error);
      if (analyzeBtn) {
        analyzeBtn.textContent = 'Analyze My Bar';
        analyzeBtn.disabled = false;
      }
      callbacks.showError('Analysis failed: ' + error.message);
    }
  }, 100);
}

/**
 * Display analysis results
 */
export function displayResults(results, elements, callbacks) {
  const total = results.perfect.length + results.veryGood.length + results.good.length;

  let html = '<div class="stats">';
  html += `<div class="stat-card"><div class="stat-number">${results.perfect.length}</div><div class="stat-label">Perfect Matches</div></div>`;
  html += `<div class="stat-card"><div class="stat-number">${results.veryGood.length}</div><div class="stat-label">Very Good</div></div>`;
  html += `<div class="stat-card"><div class="stat-number">${total}</div><div class="stat-label">Total Makeable</div></div>`;
  html += '</div>';

  if (results.perfect.length > 0) {
    html += `<div class="category"><div class="category-title perfect">🟢 Perfect Matches (${results.perfect.length})</div>`;
    results.perfect.forEach((r, index) => {
      html += createRecipeCard(r, 'perfect', index);
    });
    html += '</div>';
  }

  if (results.veryGood.length > 0) {
    const displayCount = Math.min(results.veryGood.length, 20);
    html += `<div class="category"><div class="category-title very-good">🟡 Very Good Matches (${results.veryGood.length})</div>`;
    results.veryGood.slice(0, displayCount).forEach((r, index) => {
      html += createRecipeCard(r, 'veryGood', index);
    });
    if (results.veryGood.length > displayCount) {
      html += `<div class="info-message">Showing ${displayCount} of ${results.veryGood.length} recipes</div>`;
    }
    html += '</div>';
  }

  if (results.good.length > 0) {
    const displayCount = Math.min(results.good.length, 10);
    html += `<div class="category"><div class="category-title good">🔵 Good Matches (${results.good.length})</div>`;
    results.good.slice(0, displayCount).forEach((r, index) => {
      html += createRecipeCard(r, 'good', index);
    });
    if (results.good.length > displayCount) {
      html += `<div class="info-message">Showing ${displayCount} of ${results.good.length} recipes</div>`;
    }
    html += '</div>';
  }

  if (total === 0) {
    html += '<div class="info-message">No matching recipes found. Try adding more ingredients to your bar stock!</div>';
  }

  elements.resultsDiv.innerHTML = html;

  // Update results count
  if (elements.resultsCount) {
    elements.resultsCount.textContent = `Showing ${total} recipe${total !== 1 ? 's' : ''}`;
  }

  // Add click handlers
  document.querySelectorAll('.recipe-item').forEach((item) => {
    item.addEventListener('click', function () {
      const category = this.dataset.category;
      const index = parseInt(this.dataset.index);
      callbacks.showRecipe(category, index);
    });
  });
}

/**
 * Create recipe card HTML
 */
export function createRecipeCard(recipe, category, index) {
  const missingText =
    recipe.missing.length === 0
      ? 'You have everything!'
      : recipe.missing.length <= 2
        ? 'Missing: ' + recipe.missing.join(', ')
        : 'Missing: ' + recipe.missing.length + ' items';

  return `<div class="recipe-item" data-category="${category}" data-index="${index}">
    <div class="recipe-name">${escapeHtml(recipe.name)}</div>
    <div class="recipe-details">${recipe.compatibility}% - ${recipe.missing.length > 0 ? '<span class="missing">' + escapeHtml(missingText) + '</span>' : missingText}</div>
  </div>`;
}

/**
 * Display shopping list
 */
export function displayShoppingList(results, elements) {
  if (!elements.shoppingList) return;

  const shoppingListData = generateShoppingList(results);

  if (shoppingListData.length === 0) {
    elements.shoppingList.style.display = 'none';
    return;
  }

  let html = '<div class="shopping-list-title">🛒 Smart Shopping List</div>';
  html +=
    '<div style="margin-bottom: 20px; opacity: 0.95;">Top ingredients to unlock more recipes:</div>';

  shoppingListData.slice(0, 15).forEach((item) => {
    // item format: [ingredient_name, {count, recipes}]
    const ingredientName = item[0];
    const recipeCount = item[1].recipes.length;

    html += '<div class="shopping-item">';
    html += `<div class="shopping-item-name">${escapeHtml(ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1))}</div>`;
    html += `<div class="shopping-item-impact">+${recipeCount} recipe${recipeCount > 1 ? 's' : ''}</div>`;
    html += '</div>';
  });

  elements.shoppingList.innerHTML = html;
  elements.shoppingList.style.display = 'block';
}
