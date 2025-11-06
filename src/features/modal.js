/**
 * Modal Feature Module
 * Handles recipe modal display and interactions
 */

import { escapeHtml } from '../utils/formatters.js';
import { saveHistory } from '../services/storage.js';
import { APP } from '../app.js';

/**
 * Show recipe in modal
 */
export function showRecipe(category, index, elements, callbacks) {
  const recipe = APP.allResults[category][index];
  if (!recipe) return;

  const isFavorite = APP.favorites.has(recipe.name);
  const history = APP.history[recipe.name] || { hasMade: false, rating: 0, notes: '' };
  const hasMade = history.hasMade || false;

  let html = '<div style="display: flex; justify-content: space-between; align-items: start;">';
  html += `<div class="modal-title">${escapeHtml(recipe.name)}</div>`;
  html += `<button id="favoriteBtn" class="favorite-btn${isFavorite ? ' active' : ''}" data-recipe-name="${escapeHtml(recipe.name)}">`;
  html += isFavorite ? '❤️' : '🤍';
  html += '</button>';
  html += '</div>';

  html += `<div class="compatibility-badge">${recipe.compatibility}% Compatible</div>`;

  // Action buttons
  html += '<div class="action-buttons">';
  const madeText = hasMade ? '✓ Made This' : '✓ Mark as Made';
  const madeStyle = hasMade ? 'background: var(--success);' : '';
  html += `<button id="madeThisBtn" class="action-btn" style="${madeStyle}" data-recipe-name="${escapeHtml(recipe.name)}">${madeText}</button>`;
  html += '</div>';

  // Rating and notes
  html += '<div class="made-this-section">';
  html += '<div style="margin-top: 10px;"><strong>Your Rating:</strong></div>';
  html += `<div id="ratingStars" class="rating-stars" data-recipe-name="${escapeHtml(recipe.name)}">`;
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= history.rating ? 'filled' : ''}" data-rating="${i}">★</span>`;
  }
  html += '</div>';

  html += '<div style="margin-top: 10px;"><strong>Your Notes:</strong></div>';
  html += `<textarea class="notes-input" id="recipeNotes" placeholder="Add your notes...">${escapeHtml(history.notes || '')}</textarea>`;
  html += `<button id="saveNotesBtn" class="action-btn" style="margin-top: 10px;" data-recipe-name="${escapeHtml(recipe.name)}">Save Notes</button>`;
  html += '</div>';

  // Ingredients
  html += '<div class="modal-section"><div class="modal-section-title">📋 Ingredients</div>';
  html += '<div class="modal-section-content"><ul class="ingredient-list">';
  recipe.fullRecipe.Ingredients.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      const hasIt = recipe.matched.some((m) => m === trimmedLine);
      const className = hasIt ? 'have' : 'missing';
      html += `<li class="${className}">${escapeHtml(trimmedLine)}</li>`;
    }
  });
  html += '</ul></div></div>';

  // Instructions
  if (recipe.fullRecipe.Instructions) {
    html += '<div class="modal-section"><div class="modal-section-title">🔨 Instructions</div>';
    html += `<div class="modal-section-content">${escapeHtml(recipe.fullRecipe.Instructions)}</div></div>`;
  }

  // Glass
  if (recipe.fullRecipe.Glass) {
    html += '<div class="modal-section"><div class="modal-section-title">🥃 Glass</div>';
    html += `<div class="modal-section-content">${escapeHtml(recipe.fullRecipe.Glass)}</div></div>`;
  }

  elements.modalBody.innerHTML = html;
  elements.modal.classList.add('active');

  // Add to recently viewed
  callbacks.addToRecentlyViewed(recipe.name);

  // Add event listeners
  const favoriteBtn = document.getElementById('favoriteBtn');
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', function () {
      callbacks.toggleFavorite(this.getAttribute('data-recipe-name'));
    });
  }

  const madeThisBtn = document.getElementById('madeThisBtn');
  if (madeThisBtn) {
    madeThisBtn.addEventListener('click', function () {
      markAsMade(this.getAttribute('data-recipe-name'), callbacks);
    });
  }

  const ratingStars = document.getElementById('ratingStars');
  if (ratingStars) {
    const recipeName = ratingStars.getAttribute('data-recipe-name');
    ratingStars.querySelectorAll('span').forEach((star) => {
      star.addEventListener('click', function () {
        setRating(recipeName, parseInt(this.getAttribute('data-rating')), callbacks);
      });
    });
  }

  const saveNotesBtn = document.getElementById('saveNotesBtn');
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', function () {
      const recipeName = this.getAttribute('data-recipe-name');
      const notes = document.getElementById('recipeNotes').value;
      saveNotes(recipeName, notes);
    });
  }
}

/**
 * Mark recipe as made
 */
function markAsMade(recipeName, callbacks) {
  if (!APP.history[recipeName]) {
    APP.history[recipeName] = { hasMade: false, rating: 0, notes: '' };
  }

  APP.history[recipeName].hasMade = !APP.history[recipeName].hasMade;
  saveHistory(APP.history);
  callbacks.displayFavorites();
  updateMadeThisButton(recipeName);
}

/**
 * Set recipe rating
 */
function setRating(recipeName, rating, callbacks) {
  if (!APP.history[recipeName]) {
    APP.history[recipeName] = { hasMade: false, rating: 0, notes: '' };
  }

  APP.history[recipeName].rating = rating;
  saveHistory(APP.history);
  updateRatingDisplay(recipeName);
}

/**
 * Save recipe notes
 */
function saveNotes(recipeName, notes) {
  if (!APP.history[recipeName]) {
    APP.history[recipeName] = { hasMade: false, rating: 0, notes: '' };
  }

  APP.history[recipeName].notes = notes;
  saveHistory(APP.history);
}

/**
 * Update rating display
 */
function updateRatingDisplay(recipeName) {
  const ratingEl = document.getElementById('ratingStars');
  if (ratingEl && APP.history[recipeName]) {
    const rating = APP.history[recipeName].rating;
    const stars = ratingEl.querySelectorAll('span');
    stars.forEach((star, idx) => {
      star.className = idx < rating ? 'filled' : '';
    });
  }
}

/**
 * Update made this button
 */
function updateMadeThisButton(recipeName) {
  const madeBtn = document.getElementById('madeThisBtn');
  if (madeBtn && APP.history[recipeName]) {
    const hasMade = APP.history[recipeName].hasMade;
    madeBtn.textContent = hasMade ? '✓ Made This' : '✓ Mark as Made';
    madeBtn.style.background = hasMade ? 'var(--success)' : 'var(--primary)';
  }
}

/**
 * Close modal
 */
export function closeModal(elements) {
  if (elements.modal) {
    elements.modal.classList.remove('active');
  }
}

/**
 * Handle modal background click
 */
export function handleModalClick(e, elements) {
  if (e.target === elements.modal) {
    closeModal(elements);
  }
}
