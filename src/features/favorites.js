/**
 * Favorites Feature Module
 * Handles favorites and recipe history tracking
 */

import { saveFavorites, saveHistory, saveRecentlyViewed } from '../services/storage.js';
import { addFavorite, removeFavorite } from '../services/api.js';
import { getTimeAgo, escapeHtml } from '../utils/formatters.js';
import { createRecipeCard } from './analysis.js';
import { APP } from '../app.js';

/**
 * Toggle favorite status
 */
export async function toggleFavorite(recipeName, callbacks) {
  const isFavorite = APP.favorites.has(recipeName);

  // Update local state first for instant feedback
  if (isFavorite) {
    APP.favorites.delete(recipeName);
  } else {
    APP.favorites.add(recipeName);
  }
  saveFavorites(APP.favorites);
  callbacks.displayFavorites();
  updateFavoriteButton(recipeName);

  // Sync with API in background
  try {
    if (isFavorite) {
      await removeFavorite(recipeName);
      console.log('✓ Removed from favorites (cloud)');
    } else {
      await addFavorite(recipeName);
      console.log('✓ Added to favorites (cloud)');
    }
  } catch (error) {
    console.error('Failed to sync favorite to API:', error);
    // Revert local state on error
    if (isFavorite) {
      APP.favorites.add(recipeName);
    } else {
      APP.favorites.delete(recipeName);
    }
    saveFavorites(APP.favorites);
    callbacks.displayFavorites();
    updateFavoriteButton(recipeName);
    alert('Failed to sync favorite. Please try again.');
  }
}

/**
 * Update favorite button in modal
 */
function updateFavoriteButton(recipeName) {
  const heartBtn = document.getElementById('favoriteBtn');
  if (heartBtn) {
    const isFavorite = APP.favorites.has(recipeName);
    heartBtn.textContent = isFavorite ? '❤️' : '🤍';
    heartBtn.className = 'favorite-btn' + (isFavorite ? ' active' : '');
  }
}

/**
 * Display favorites section
 */
export function displayFavorites(callbacks) {
  const allRecipes = APP.allResults
    ? APP.allResults.perfect.concat(APP.allResults.veryGood, APP.allResults.good)
    : [];

  displayFavoritesList(allRecipes, callbacks);
  displayMadeThisList(allRecipes, callbacks);
}

/**
 * Display favorites list
 */
function displayFavoritesList(allRecipes, callbacks) {
  const favoritesListSection = document.getElementById('favoritesListSection');
  if (!favoritesListSection) return;

  if (APP.favorites.size === 0) {
    favoritesListSection.innerHTML =
      '<div class="card"><p style="color: var(--text-secondary);">No favorites yet. Click the heart on any recipe to add it here!</p></div>';
    return;
  }

  if (!APP.allResults || allRecipes.length === 0) {
    let html = '<div class="card">';
    html += `<p style="color: var(--text-secondary); margin-bottom: 12px;">You have <strong>${APP.favorites.size} favorite(s)</strong> saved!</p>`;
    html += '<p style="color: var(--text-secondary);">Run "Analyze My Bar" to see them here.</p>';
    html += '</div>';
    favoritesListSection.innerHTML = html;
    return;
  }

  const favoriteRecipes = allRecipes.filter((r) => APP.favorites.has(r.name));

  let html = '';
  if (favoriteRecipes.length === 0) {
    html += '<div class="card">';
    html += `<p style="color: var(--text-secondary);">You have ${APP.favorites.size} favorite(s) saved, but they're not in your current recipe collection.</p>`;
    html += '<p style="color: var(--text-secondary); margin-top: 8px;">Try uploading different recipes or running analyze again.</p>';
    html += '</div>';
  } else {
    favoriteRecipes.forEach((recipe) => {
      const category = APP.allResults.perfect.includes(recipe)
        ? 'perfect'
        : APP.allResults.veryGood.includes(recipe)
          ? 'veryGood'
          : 'good';
      const index = APP.allResults[category].indexOf(recipe);
      html += createRecipeCard(recipe, category, index);
    });
  }

  favoritesListSection.innerHTML = html;

  favoritesListSection.querySelectorAll('.recipe-item').forEach((item) => {
    item.addEventListener('click', function () {
      const category = this.dataset.category;
      const index = parseInt(this.dataset.index);
      callbacks.showRecipe(category, index);
    });
  });
}

/**
 * Display made this list
 */
function displayMadeThisList(allRecipes, callbacks) {
  const madeThisListSection = document.getElementById('madeThisListSection');
  if (!madeThisListSection) return;

  const madeRecipeNames = Object.keys(APP.history).filter((name) => APP.history[name].hasMade);

  if (madeRecipeNames.length === 0) {
    madeThisListSection.innerHTML =
      '<div class="card"><p style="color: var(--text-secondary);">No recipes marked yet. Click "Made This" on any recipe to track it here!</p></div>';
    return;
  }

  if (!APP.allResults || allRecipes.length === 0) {
    let html = '<div class="card">';
    html += `<p style="color: var(--text-secondary); margin-bottom: 12px;">You have <strong>${madeRecipeNames.length} recipe(s)</strong> marked as made!</p>`;
    html += '<p style="color: var(--text-secondary);">Run "Analyze My Bar" to see them here.</p>';
    html += '</div>';
    madeThisListSection.innerHTML = html;
    return;
  }

  const madeRecipes = allRecipes.filter((r) => madeRecipeNames.includes(r.name));

  let html = '';
  if (madeRecipes.length === 0) {
    html += '<div class="card">';
    html += `<p style="color: var(--text-secondary);">You have ${madeRecipeNames.length} recipe(s) marked as made, but they're not in your current recipe collection.</p>`;
    html += '<p style="color: var(--text-secondary); margin-top: 8px;">Try uploading different recipes or running analyze again.</p>';
    html += '</div>';
  } else {
    madeRecipes.forEach((recipe) => {
      const category = APP.allResults.perfect.includes(recipe)
        ? 'perfect'
        : APP.allResults.veryGood.includes(recipe)
          ? 'veryGood'
          : 'good';
      const index = APP.allResults[category].indexOf(recipe);
      html += createRecipeCard(recipe, category, index);
    });
  }

  madeThisListSection.innerHTML = html;

  madeThisListSection.querySelectorAll('.recipe-item').forEach((item) => {
    item.addEventListener('click', function () {
      const category = this.dataset.category;
      const index = parseInt(this.dataset.index);
      callbacks.showRecipe(category, index);
    });
  });
}

/**
 * Add to recently viewed
 */
export function addToRecentlyViewed(recipeName) {
  // Remove if already exists
  APP.recentlyViewed = APP.recentlyViewed.filter((item) => item.name !== recipeName);

  // Add to beginning
  APP.recentlyViewed.unshift({
    name: recipeName,
    timestamp: new Date().getTime(),
  });

  // Keep only last 6
  APP.recentlyViewed = APP.recentlyViewed.slice(0, 6);

  // Save to localStorage
  saveRecentlyViewed(APP.recentlyViewed);
}

/**
 * Display recently viewed
 */
export function displayRecentlyViewed(elements) {
  if (!elements.recentlyViewedSection || !elements.recentlyViewedList) return;

  if (APP.recentlyViewed.length === 0) {
    elements.recentlyViewedSection.style.display = 'none';
    return;
  }

  elements.recentlyViewedSection.style.display = 'block';

  let html = '';
  APP.recentlyViewed.forEach((item) => {
    const timeAgo = getTimeAgo(item.timestamp);
    html += `<div class="recently-viewed-item" onclick="openRecentRecipe('${escapeHtml(item.name).replace(/'/g, "\\'")}')">`;
    html += `<div class="recently-viewed-name">${escapeHtml(item.name)}</div>`;
    html += `<div class="recently-viewed-time">${timeAgo}</div>`;
    html += '</div>';
  });

  elements.recentlyViewedList.innerHTML = html;
}

/**
 * Open recent recipe
 */
export function openRecentRecipe(recipeName, callback) {
  if (!APP.allResults) return;

  const categories = ['perfect', 'veryGood', 'good'];
  for (const cat of categories) {
    const index = APP.allResults[cat].findIndex((r) => r.name === recipeName);
    if (index !== -1) {
      callback(cat, index);
      return;
    }
  }
}
