/**
 * Main entry point for Cocktail Analyzer - FULL FEATURE VERSION
 */

// Import styles
import './styles/main.css';

// Import services
import { runAnalysis, generateShoppingList } from './services/analyzer.js';
import { parseCSV, validateInventoryCSV, validateRecipeCSV } from './services/csvParser.js';
import {
  loadInventory,
  saveInventory,
  loadRecipes,
  saveRecipes,
  loadFavorites,
  saveFavorites,
  loadHistory,
  saveHistory,
  loadApiKey,
  saveApiKey,
  loadRecentlyViewed,
  saveRecentlyViewed,
  loadActiveTab,
  saveActiveTab,
  exportAllData,
  importAllData,
} from './services/storage.js';
import { queryClaudeAPI, parseAIResponse } from './services/aiService.js';

// Import utilities
import { escapeHtml, normalizeIngredient, getTimeAgo, escapeCsv } from './utils/formatters.js';
import { areSimilarIngredients } from './utils/fuzzyMatch.js';

// Import app state
import { APP } from './app.js';

// Import authentication
import { initAuth } from './services/authIntegration.js';

// DOM Elements
const elements = {};

/**
 * Initialize the application
 */
function init() {
  console.log('🍹 Initializing Cocktail Analyzer v5.0 (Modular)...');

  // Cache DOM elements
  cacheElements();

  // Load saved data (only API key and preferences)
  loadSavedData();

  // Initialize UI
  setupEventListeners();
  setupTabs();

  // Note: Data loading and analysis moved to after auth check in DOMContentLoaded

  // Update UI states
  checkReady();

  console.log('✅ Application ready!');
}

/**
 * Cache DOM elements
 */
function cacheElements() {
  elements.inventoryInput = document.getElementById('inventoryInput');
  elements.recipeInput = document.getElementById('recipeInput');
  elements.analyzeBtn = document.getElementById('analyzeBtn');
  elements.inventoryStatus = document.getElementById('inventoryStatus');
  elements.recipeStatus = document.getElementById('recipeStatus');
  elements.resultsDiv = document.getElementById('results');
  elements.modal = document.getElementById('recipeModal');
  elements.modalBody = document.getElementById('modalBody');
  elements.shoppingList = document.getElementById('shoppingList');
  elements.inventoryManager = document.getElementById('inventoryManager');
  elements.searchSection = document.getElementById('searchSection');
  elements.searchResponse = document.getElementById('searchResponse');
  elements.ingredientSelect = document.getElementById('ingredientSelect');
  elements.filterControls = document.getElementById('filterControls');
  elements.resultsCount = document.getElementById('resultsCount');
  elements.sortSelect = document.getElementById('sortSelect');
  elements.activeFiltersDiv = document.getElementById('activeFilters');
  elements.perfectMatchesBtn = document.getElementById('perfectMatchesBtn');
  elements.almostThereBtn = document.getElementById('almostThereBtn');
  elements.recentlyViewedSection = document.getElementById('recentlyViewedSection');
  elements.recentlyViewedList = document.getElementById('recentlyViewedList');
  elements.favoritesListSection = document.getElementById('favoritesListSection');
  elements.madeThisListSection = document.getElementById('madeThisListSection');
  elements.aiQueryInput = document.getElementById('aiQueryInput');
  elements.aiQueryBtn = document.getElementById('aiQueryBtn');
  elements.aiSearchResponse = document.getElementById('aiSearchResponse');
  elements.apiKeyInput = document.getElementById('apiKeyInput');
  elements.toggleApiKeyBtn = document.getElementById('toggleApiKeyBtn');
  elements.apiKeyInputContainer = document.getElementById('apiKeyInputContainer');
  elements.clearConversationBtn = document.getElementById('clearConversationBtn');
  elements.exportDataBtn = document.getElementById('exportDataBtn');
  elements.importDataFile = document.getElementById('importDataFile');
}

/**
 * Load saved data from localStorage
 * Note: This is now only called after authentication is verified
 */
function loadSavedData() {
  // Only load API key and UI preferences initially
  // Data (inventory, recipes) will be loaded by authIntegration if authenticated
  APP.apiKey = loadApiKey();

  if (elements.apiKeyInput && APP.apiKey) {
    elements.apiKeyInput.value = APP.apiKey;
  }

  console.log('Initial load complete (auth-gated data loading)');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // File uploads
  if (elements.inventoryInput) {
    elements.inventoryInput.addEventListener('change', handleInventoryUpload);
  }

  if (elements.recipeInput) {
    elements.recipeInput.addEventListener('change', handleRecipeUpload);
  }

  // Analyze button
  if (elements.analyzeBtn) {
    elements.analyzeBtn.addEventListener('click', analyze);
  }

  // Modal close
  const modalClose = document.querySelector('.modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (elements.modal) {
    elements.modal.addEventListener('click', handleModalClick);
  }

  // Search
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }

  // Filter controls
  const randomBtn = document.getElementById('randomCocktailBtn');
  if (randomBtn) {
    randomBtn.addEventListener('click', showRandomCocktail);
  }

  if (elements.perfectMatchesBtn) {
    elements.perfectMatchesBtn.addEventListener('click', () => {
      APP.activeFilters.perfectMatches = !APP.activeFilters.perfectMatches;
      refreshResults();
    });
  }

  if (elements.almostThereBtn) {
    elements.almostThereBtn.addEventListener('click', () => {
      APP.activeFilters.missingOne = !APP.activeFilters.missingOne;
      refreshResults();
    });
  }

  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearAllFilters);
  }

  if (elements.sortSelect) {
    elements.sortSelect.addEventListener('change', (e) => {
      APP.sortBy = e.target.value;
      refreshResults();
    });
  }

  // AI
  if (elements.toggleApiKeyBtn) {
    elements.toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
  }

  if (elements.apiKeyInput) {
    elements.apiKeyInput.addEventListener('change', handleApiKeyChange);
  }

  if (elements.aiQueryBtn) {
    elements.aiQueryBtn.addEventListener('click', handleAIQuery);
  }

  if (elements.aiQueryInput) {
    elements.aiQueryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAIQuery();
      }
    });
  }

  if (elements.clearConversationBtn) {
    elements.clearConversationBtn.addEventListener('click', clearConversation);
  }

  // Export/Import
  if (elements.exportDataBtn) {
    elements.exportDataBtn.addEventListener('click', exportData);
  }

  if (elements.importDataFile) {
    elements.importDataFile.addEventListener('change', importData);
  }
}

/**
 * Setup tab navigation
 */
function setupTabs() {
  const tabLinks = document.querySelectorAll('.sidebar-nav-link');
  
  tabLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.dataset.tab;
      switchTab(tabName);
    });
  });

  // Load last active tab
  const activeTab = loadActiveTab();
  if (activeTab) {
    switchTab(activeTab);
  }
}

/**
 * Switch to a tab
 */
function switchTab(tabName) {
  // Remove active class from all tabs
  document.querySelectorAll('.sidebar-nav-link').forEach((l) => l.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));

  // Add active class to clicked tab
  const link = document.querySelector(`[data-tab="${tabName}"]`);
  if (link) {
    link.classList.add('active');
  }

  const tabContent = document.getElementById(tabName);
  if (tabContent) {
    tabContent.classList.add('active');
  }

  // Save active tab
  saveActiveTab(tabName);

  // Update displays when switching tabs
  if (tabName === 'inventoryTab') {
    displayInventoryManager();
  } else if (tabName === 'favoritesTab') {
    displayFavorites();
  } else if (tabName === 'recipesTab' && APP.allResults) {
    displayRecentlyViewed();
  }
}

/**
 * Handle inventory file upload
 */
async function handleInventoryUpload(e) {
  const file = e.target.files[0];
  if (!file) {
    return;
  }

  elements.inventoryStatus.textContent = 'Loading...';
  elements.inventoryStatus.className = 'file-status';

  try {
    const results = await parseCSV(file);
    const validation = validateInventoryCSV(results.data);

    if (!validation.valid) {
      showError(validation.error);
      elements.inventoryStatus.textContent = '❌ ' + validation.error;
      elements.inventoryStatus.className = 'file-status error';
      return;
    }

    APP.inventoryData = results.data;
    APP.editableInventory = results.data;
    saveInventory(results.data);

    const inStock = results.data.filter((item) => item['Stock Number'] > 0).length;
    elements.inventoryStatus.textContent = `✓ Loaded ${inStock} items in stock`;
    elements.inventoryStatus.className = 'file-status success';

    checkReady();
    displayInventoryManager();
  } catch (error) {
    showError(`Failed to parse inventory: ${error.message}`);
    elements.inventoryStatus.textContent = '❌ Error loading file';
    elements.inventoryStatus.className = 'file-status error';
  }
}

/**
 * Handle recipe file upload (supports multiple files)
 */
async function handleRecipeUpload(e) {
  const files = Array.from(e.target.files);
  if (files.length === 0) {
    return;
  }

  elements.recipeStatus.textContent = `Loading ${files.length} file(s)...`;
  elements.recipeStatus.className = 'file-status';

  try {
    let allRecipes = [];

    for (const file of files) {
      const results = await parseCSV(file);
      const validation = validateRecipeCSV(results.data);

      if (!validation.valid) {
        showError(`Error in ${file.name}: ${validation.error}`);
        continue;
      }

      allRecipes = allRecipes.concat(results.data);
    }

    if (allRecipes.length === 0) {
      throw new Error('No valid recipes found');
    }

    APP.recipeData = allRecipes;
    saveRecipes(allRecipes);

    elements.recipeStatus.textContent = `✓ Loaded ${allRecipes.length} recipes from ${files.length} file(s)`;
    elements.recipeStatus.className = 'file-status success';

    checkReady();
  } catch (error) {
    showError(`Failed to parse recipes: ${error.message}`);
    elements.recipeStatus.textContent = '❌ Error loading files';
    elements.recipeStatus.className = 'file-status error';
  }
}

/**
 * Check if ready to analyze
 */
function checkReady() {
  const ready =
    APP.editableInventory &&
    APP.editableInventory.length > 0 &&
    APP.recipeData &&
    APP.recipeData.length > 0;

  if (elements.analyzeBtn) {
    elements.analyzeBtn.disabled = !ready;
  }
}

/**
 * Run analysis
 */
function analyze() {
  if (!APP.editableInventory || APP.editableInventory.length === 0) {
    showError('Please upload your inventory first');
    return;
  }

  if (!APP.recipeData || APP.recipeData.length === 0) {
    showError('Please upload recipes first');
    return;
  }

  const results = runAnalysis(APP.editableInventory, APP.recipeData);
  APP.allResults = results;
  displayResults(results);
  displayFavorites();
  displayShoppingList(results);
  setupSearch();
  displayRecentlyViewed();

  // Switch to recipes tab
  switchTab('recipesTab');
}

/**
 * ===== DISPLAY FUNCTIONS =====
 */

/**
 * Display analysis results
 */
function displayResults(results) {
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
      showRecipe(category, index);
    });
  });
}

/**
 * Create recipe card HTML
 */
function createRecipeCard(recipe, category, index) {
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
 * Show recipe in modal
 */
function showRecipe(category, index) {
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
  addToRecentlyViewed(recipe.name);

  // Add event listeners
  const favoriteBtn = document.getElementById('favoriteBtn');
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', function () {
      toggleFavorite(this.getAttribute('data-recipe-name'));
    });
  }

  const madeThisBtn = document.getElementById('madeThisBtn');
  if (madeThisBtn) {
    madeThisBtn.addEventListener('click', function () {
      markAsMade(this.getAttribute('data-recipe-name'));
    });
  }

  const ratingStars = document.getElementById('ratingStars');
  if (ratingStars) {
    const recipeName = ratingStars.getAttribute('data-recipe-name');
    ratingStars.querySelectorAll('span').forEach((star) => {
      star.addEventListener('click', function () {
        setRating(recipeName, parseInt(this.getAttribute('data-rating')));
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
 * ===== FAVORITES & HISTORY FUNCTIONS =====
 */

/**
 * Toggle favorite status
 */
function toggleFavorite(recipeName) {
  if (APP.favorites.has(recipeName)) {
    APP.favorites.delete(recipeName);
  } else {
    APP.favorites.add(recipeName);
  }
  saveFavorites(APP.favorites);
  displayFavorites();
  updateFavoriteButton(recipeName);
}

/**
 * Mark recipe as made
 */
function markAsMade(recipeName) {
  if (!APP.history[recipeName]) {
    APP.history[recipeName] = { hasMade: false, rating: 0, notes: '' };
  }

  APP.history[recipeName].hasMade = !APP.history[recipeName].hasMade;
  saveHistory(APP.history);
  displayFavorites();
  updateMadeThisButton(recipeName);
}

/**
 * Set recipe rating
 */
function setRating(recipeName, rating) {
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
 * Display favorites section
 */
function displayFavorites() {
  const allRecipes = APP.allResults
    ? APP.allResults.perfect.concat(APP.allResults.veryGood, APP.allResults.good)
    : [];

  displayFavoritesList(allRecipes);
  displayMadeThisList(allRecipes);
}

/**
 * Display favorites list
 */
function displayFavoritesList(allRecipes) {
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
      showRecipe(category, index);
    });
  });
}

/**
 * Display made this list
 */
function displayMadeThisList(allRecipes) {
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
      showRecipe(category, index);
    });
  });
}

/**
 * ===== INVENTORY MANAGEMENT FUNCTIONS =====
 */

/**
 * Display inventory manager
 */
function displayInventoryManager() {
  if (!elements.inventoryManager) return;

  if (!APP.editableInventory || APP.editableInventory.length === 0) {
    elements.inventoryManager.innerHTML = `
      <div class="card">
        <p>No inventory loaded. Upload a CSV file or add items manually after analyzing.</p>
      </div>
    `;
    return;
  }

  let html = '<div class="search-title">📦 Manage Your Bar Stock</div>';
  html +=
    '<div style="margin-bottom: 15px; opacity: 0.95;">Add or remove ingredients. Changes update your recipes instantly!</div>';

  html += '<div class="inventory-list">';
  APP.editableInventory.forEach((item, idx) => {
    const isObject = typeof item === 'object';
    const name = isObject ? item.Name : item;

    html += '<div class="inventory-item-rich">';
    html += '<div class="inventory-item-details">';
    html += `<div class="inventory-item-name">${escapeHtml(name)}</div>`;

    if (isObject) {
      // Type and Classification
      const line1 = [];
      if (item['Liquor Type']) line1.push(escapeHtml(item['Liquor Type']));
      if (item['Detailed Spirit Classification'])
        line1.push(escapeHtml(item['Detailed Spirit Classification']));
      if (line1.length > 0) {
        html += `<div class="inventory-item-secondary">${line1.join(' • ')}</div>`;
      }

      // Location, ABV, Age
      const line2 = [];
      if (item['Distillery Location']) line2.push(escapeHtml(item['Distillery Location']));
      if (item['ABV (%)']) line2.push(escapeHtml(item['ABV (%)']) + '%');
      if (item['Age Statement or Barrel Finish'])
        line2.push(escapeHtml(item['Age Statement or Barrel Finish']));
      if (line2.length > 0) {
        html += `<div class="inventory-item-secondary">${line2.join(' • ')}</div>`;
      }

      // Distillation Method
      if (item['Distillation Method']) {
        html += `<div class="inventory-item-secondary">Method: ${escapeHtml(item['Distillation Method'])}</div>`;
      }

      // Tasting Profile
      if (item['Profile (Nose)'] || item.Palate || item.Finish) {
        html += '<div class="inventory-tasting-profile">';
        if (item['Profile (Nose)']) {
          html += `<div><strong>Nose:</strong> ${escapeHtml(item['Profile (Nose)'])}</div>`;
        }
        if (item.Palate) {
          html += `<div><strong>Palate:</strong> ${escapeHtml(item.Palate)}</div>`;
        }
        if (item.Finish) {
          html += `<div><strong>Finish:</strong> ${escapeHtml(item.Finish)}</div>`;
        }
        html += '</div>';
      }

      // Additional Notes
      if (item['Additional Notes']) {
        html += `<div class="inventory-item-notes">📝 ${escapeHtml(item['Additional Notes'])}</div>`;
      }
    }

    html += '</div>';
    html += `<button class="inventory-remove-btn" data-index="${idx}">Remove</button>`;
    html += '</div>';
  });
  html += '</div>';

  html += '<div class="inventory-add-section">';
  html +=
    '<input type="text" id="newIngredientInput" class="inventory-add-input" placeholder="Add ingredient name (e.g., Hamilton 86)">';
  html += '<button class="inventory-add-btn" id="addIngredientBtn">Add</button>';
  html += '</div>';

  html +=
    '<div style="margin-top: 20px; padding: 15px; border-radius: 10px; text-align: center; background: var(--bg-tertiary);">';
  html += `<strong>Total Ingredients: ${APP.editableInventory.length}</strong>`;
  html += '</div>';

  // Export button
  html += '<div style="margin-top: 16px; text-align: center;">';
  html += '<button id="exportInventoryBtn" class="btn-secondary btn-sm">📥 Export Inventory CSV</button>';
  html += '</div>';

  elements.inventoryManager.innerHTML = html;
  elements.inventoryManager.style.display = 'block';

  // Add event listeners
  const removeButtons = elements.inventoryManager.querySelectorAll('.inventory-remove-btn');
  removeButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      removeIngredient(parseInt(this.getAttribute('data-index')));
    });
  });

  const addBtn = document.getElementById('addIngredientBtn');
  if (addBtn) {
    addBtn.addEventListener('click', addIngredient);
  }

  const exportBtn = document.getElementById('exportInventoryBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportInventoryCSV);
  }
}

/**
 * Add ingredient to inventory
 */
function addIngredient() {
  const input = document.getElementById('newIngredientInput');
  const newItem = input.value.trim();

  if (!newItem) {
    alert('Please enter an ingredient name');
    return;
  }

  // Check for duplicates
  const isDuplicate = APP.editableInventory.some((item) => {
    const itemName = typeof item === 'object' ? item.Name : item;
    return itemName.toLowerCase() === newItem.toLowerCase();
  });

  if (isDuplicate) {
    alert('This ingredient is already in your inventory');
    return;
  }

  // Create new bottle object
  const newBottle = {
    'Liquor Type': '',
    Name: newItem,
    'Stock Number': 1,
    'Detailed Spirit Classification': '',
    'Distillation Method': '',
    'ABV (%)': '',
    'Distillery Location': '',
    'Age Statement or Barrel Finish': '',
    'Additional Notes': '',
    'Profile (Nose)': '',
    Palate: '',
    Finish: '',
  };

  APP.editableInventory.push(newBottle);
  saveInventory(APP.editableInventory);
  input.value = '';

  // Re-analyze
  reanalyzeWithCurrentInventory();
}

/**
 * Remove ingredient from inventory
 */
function removeIngredient(index) {
  const item = APP.editableInventory[index];
  const itemName = typeof item === 'object' ? item.Name : item;

  if (confirm(`Remove "${itemName}" from your bar?`)) {
    APP.editableInventory.splice(index, 1);
    saveInventory(APP.editableInventory);
    reanalyzeWithCurrentInventory();
  }
}

/**
 * Re-analyze with current inventory
 */
function reanalyzeWithCurrentInventory() {
  if (!APP.recipeData || APP.recipeData.length === 0) {
    displayInventoryManager();
    return;
  }

  const fakeInventoryData = APP.editableInventory.map((item) => {
    if (typeof item === 'object') {
      return { ...item, 'Stock Number': item['Stock Number'] || 1 };
    } else {
      return { Name: item, 'Stock Number': 1 };
    }
  });

  const results = runAnalysis(fakeInventoryData, APP.recipeData);
  APP.allResults = results;
  displayResults(results);
  displayFavorites();
  displayInventoryManager();
  displayShoppingList(results);
  setupSearch();
}

/**
 * Export inventory as CSV
 */
function exportInventoryCSV() {
  const header =
    'Liquor Type,Name,Stock Number,Detailed Spirit Classification,Distillation Method,ABV (%),Distillery Location,Age Statement or Barrel Finish,Additional Notes,Profile (Nose),Palate,Finish\n';

  const rows = APP.editableInventory.map((item) => {
    if (typeof item === 'object') {
      return [
        escapeCsv(item['Liquor Type'] || ''),
        escapeCsv(item.Name || ''),
        escapeCsv(item['Stock Number'] || 1),
        escapeCsv(item['Detailed Spirit Classification'] || ''),
        escapeCsv(item['Distillation Method'] || ''),
        escapeCsv(item['ABV (%)'] || ''),
        escapeCsv(item['Distillery Location'] || ''),
        escapeCsv(item['Age Statement or Barrel Finish'] || ''),
        escapeCsv(item['Additional Notes'] || ''),
        escapeCsv(item['Profile (Nose)'] || ''),
        escapeCsv(item.Palate || ''),
        escapeCsv(item.Finish || ''),
      ].join(',');
    } else {
      return `,${item},1,,,,,,,,,`;
    }
  });

  const csv = header + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-bar-inventory.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * ===== SEARCH & FILTER FUNCTIONS =====
 */

/**
 * Setup search functionality
 */
function setupSearch() {
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
function handleSearch() {
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
        showRecipe(category, index);
      });
    });
  }

  elements.searchResponse.classList.add('active');
}

/**
 * Apply search and filters
 */
function applySearchAndFilters(results) {
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
function updateFilterUI() {
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
function refreshResults() {
  if (!APP.allResults) return;

  const filteredResults = applySearchAndFilters(APP.allResults);
  displayResults(filteredResults);
  updateFilterUI();
}

/**
 * Clear all filters
 */
function clearAllFilters() {
  APP.activeFilters.perfectMatches = false;
  APP.activeFilters.missingOne = false;
  APP.sortBy = 'compatibility';
  if (elements.sortSelect) {
    elements.sortSelect.value = 'compatibility';
  }
  refreshResults();
}

/**
 * Show random cocktail
 */
function showRandomCocktail() {
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

  showRecipe(category, index);
}

/**
 * ===== SHOPPING LIST =====
 */

/**
 * Display shopping list
 */
function displayShoppingList(results) {
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
    html += '<div class="shopping-item">';
    html += `<div class="shopping-item-name">${escapeHtml(item.ingredient.charAt(0).toUpperCase() + item.ingredient.slice(1))}</div>`;
    html += `<div class="shopping-item-impact">+${item.unlocks} recipe${item.unlocks > 1 ? 's' : ''}</div>`;
    html += '</div>';
  });

  elements.shoppingList.innerHTML = html;
  elements.shoppingList.style.display = 'block';
}

/**
 * ===== RECENTLY VIEWED =====
 */

/**
 * Add to recently viewed
 */
function addToRecentlyViewed(recipeName) {
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

  displayRecentlyViewed();
}

/**
 * Display recently viewed
 */
function displayRecentlyViewed() {
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
function openRecentRecipe(recipeName) {
  if (!APP.allResults) return;

  const categories = ['perfect', 'veryGood', 'good'];
  for (const cat of categories) {
    const index = APP.allResults[cat].findIndex((r) => r.name === recipeName);
    if (index !== -1) {
      showRecipe(cat, index);
      return;
    }
  }
}

// Make openRecentRecipe global for onclick handler
window.openRecentRecipe = openRecentRecipe;

/**
 * ===== AI FUNCTIONS =====
 */

/**
 * Handle AI query
 */
async function handleAIQuery() {
  const query = elements.aiQueryInput.value.trim();

  if (!query) {
    alert('Please enter a question or search query');
    return;
  }

  if (!APP.apiKey) {
    alert('Please enter your Anthropic API key first');
    if (elements.apiKeyInput) {
      elements.apiKeyInputContainer.style.display = 'block';
      elements.apiKeyInput.focus();
    }
    return;
  }

  if (!APP.allResults) {
    alert('Please analyze your bar first before using AI search');
    return;
  }

  // Disable button and show loading
  elements.aiQueryBtn.disabled = true;
  elements.aiSearchResponse.innerHTML =
    '<div style="padding: 20px; text-align: center;">🤔 AI is thinking...</div>';
  elements.aiSearchResponse.classList.add('active');

  // Clear input for next question
  elements.aiQueryInput.value = '';

  try {
    // Build context
    const allRecipes = APP.allResults.perfect.concat(
      APP.allResults.veryGood,
      APP.allResults.good,
    );

    let inventoryContext = "\n=== USER'S BAR INVENTORY ===\n";
    if (APP.editableInventory && APP.editableInventory.length > 0) {
      const spirits = APP.editableInventory.slice(0, 40);
      spirits.forEach((item) => {
        let itemDesc = `${item.Name || 'Unknown'}`;
        if (item['Liquor Type']) itemDesc += ` (${item['Liquor Type']})`;
        if (item['Detailed Spirit Classification'])
          itemDesc += ` - ${item['Detailed Spirit Classification']}`;

        const notes = [];
        if (item['Profile (Nose)']) notes.push(`Nose: ${item['Profile (Nose)']}`);
        if (item['Palate']) notes.push(`Palate: ${item['Palate']}`);
        if (item['Finish']) notes.push(`Finish: ${item['Finish']}`);
        if (notes.length > 0) itemDesc += ` | ${notes.join(', ')}`;

        inventoryContext += `- ${itemDesc}\n`;
      });
    }

    let favoritesContext = '';
    if (APP.favorites.size > 0) {
      favoritesContext = "\n=== USER'S FAVORITE COCKTAILS ===\n";
      Array.from(APP.favorites)
        .slice(0, 10)
        .forEach((name) => {
          favoritesContext += `- ${name}\n`;
        });
    }

    let historyContext = '';
    const madeRecipes = Object.keys(APP.history).filter((name) => APP.history[name].hasMade);
    if (madeRecipes.length > 0) {
      historyContext = '\n=== COCKTAILS USER HAS MADE ===\n';
      madeRecipes.slice(0, 15).forEach((name) => {
        const hist = APP.history[name];
        let line = `- ${name}`;
        if (hist.rating) line += ` (⭐${hist.rating}/5)`;
        if (hist.notes) line += ` - "${hist.notes.substring(0, 50)}"`;
        historyContext += line + '\n';
      });
    }

    const recipeList = allRecipes.map((r) => {
      const ingredientLines = r.fullRecipe.Ingredients.split('\n').slice(0, 4);
      const mainIngredients = ingredientLines
        .map((line) =>
          line
            .replace(/^\d+[\s\/]*\d*[\s\/]*\d*\s*/, '')
            .replace(
              /ounces?|oz|teaspoons?|tsp|tablespoons?|tbsp|dash(es)?|drops?|cups?|ml|cl/gi,
              '',
            )
            .trim(),
        )
        .join(', ');
      return `${r.name} (${r.compatibility}% match) - ${mainIngredients}`;
    });

    const topRecipes = recipeList.slice(0, 30);

    const context = {
      inventory: APP.editableInventory,
      recipes: allRecipes.slice(0, 30),
      favorites: Array.from(APP.favorites),
      history: APP.history,
    };

    const result = await queryClaudeAPI(query, APP.conversationHistory, APP.apiKey, context);
    displayAIRecommendations(result);
  } catch (error) {
    elements.aiSearchResponse.innerHTML = `<div style="padding: 20px; color: #721c24; background: #f8d7da; border-radius: 8px;">❌ Error: ${escapeHtml(error.message)}</div>`;
  } finally {
    elements.aiQueryBtn.disabled = false;
    if (elements.aiQueryInput) {
      elements.aiQueryInput.focus();
    }
  }
}

/**
 * Display AI recommendations
 */
function displayAIRecommendations(result) {
  const { explanation, recommendations } = parseAIResponse(result);

  let html = '';

  if (explanation) {
    html +=
      '<div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; color: #333; line-height: 1.6;">';
    html +=
      '<div style="font-weight: bold; margin-bottom: 10px; color: #667eea; font-size: 1.1em;">🤖 Bartender AI:</div>';
    html += `<div style="white-space: pre-wrap;">${escapeHtml(explanation)}</div>`;
    html += '</div>';
  }

  if (recommendations && recommendations.length > 0) {
    const allRecipes = APP.allResults.perfect.concat(
      APP.allResults.veryGood,
      APP.allResults.good,
    );

    html +=
      '<div style="font-weight: bold; margin-bottom: 15px; color: #333; background: white; padding: 15px; border-radius: 10px;">📋 Recommended Cocktails (click to view):</div>';

    recommendations.forEach((recipeName, idx) => {
      let recipe = allRecipes.find((r) => r.name.toLowerCase() === recipeName.toLowerCase());

      if (!recipe) {
        recipe = allRecipes.find((r) => areSimilarIngredients(r.name, recipeName, 0.7));
      }

      if (recipe) {
        const category = APP.allResults.perfect.includes(recipe)
          ? 'perfect'
          : APP.allResults.veryGood.includes(recipe)
            ? 'veryGood'
            : 'good';
        const index = APP.allResults[category].indexOf(recipe);

        html += `<div style="margin-bottom: 5px; color: #666; font-size: 0.9em; background: white; padding: 5px 15px;">#${idx + 1}</div>`;
        html += createRecipeCard(recipe, category, index);
      }
    });
  }

  html +=
    '<div style="background: rgba(255,255,255,0.5); padding: 15px; border-radius: 10px; margin-top: 20px; color: #333; font-style: italic; text-align: center;">';
  html += '💬 Keep chatting! Ask follow-up questions or refine your search.';
  html += '</div>';

  elements.aiSearchResponse.innerHTML = html;

  elements.aiSearchResponse.querySelectorAll('.recipe-item').forEach((item) => {
    item.addEventListener('click', function () {
      const category = this.dataset.category;
      const index = parseInt(this.dataset.index);
      showRecipe(category, index);
    });
  });
}

/**
 * Toggle API key visibility
 */
function toggleApiKeyVisibility() {
  if (!elements.apiKeyInputContainer) return;

  if (elements.apiKeyInputContainer.style.display === 'none') {
    elements.apiKeyInputContainer.style.display = 'block';
  } else {
    elements.apiKeyInputContainer.style.display = 'none';
  }
}

/**
 * Handle API key change
 */
function handleApiKeyChange() {
  const key = elements.apiKeyInput.value.trim();
  if (key) {
    APP.apiKey = key;
    saveApiKey(key);
  }
}

/**
 * Clear conversation
 */
function clearConversation() {
  APP.conversationHistory = [];
  if (elements.aiSearchResponse) {
    elements.aiSearchResponse.innerHTML =
      '<div style="padding: 20px; color: #333;">Conversation cleared. Start fresh!</div>';
    elements.aiSearchResponse.classList.add('active');
  }
}

/**
 * ===== EXPORT/IMPORT =====
 */

/**
 * Export all data
 */
function exportData() {
  const data = exportAllData();
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `bartender-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);

  alert('✓ Backup exported successfully!');
}

/**
 * Import all data
 */
async function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const backupData = JSON.parse(event.target.result);
      importAllData(backupData);

      // Refresh UI
      APP.editableInventory = loadInventory() || [];
      APP.recipeData = loadRecipes() || [];
      APP.favorites = loadFavorites();
      APP.history = loadHistory();
      APP.apiKey = loadApiKey();

      if (APP.editableInventory.length > 0) {
        displayInventoryManager();
      }
      checkReady();

      alert('✓ Backup restored successfully! All your data has been imported.');

      e.target.value = '';
    } catch (error) {
      alert('❌ Error importing backup: ' + error.message);
      console.error('Import error:', error);
    }
  };
  reader.readAsText(file);
}

/**
 * ===== MODAL & UTILITY FUNCTIONS =====
 */

/**
 * Close modal
 */
function closeModal() {
  if (elements.modal) {
    elements.modal.classList.remove('active');
  }
}

/**
 * Handle modal background click
 */
function handleModalClick(e) {
  if (e.target === elements.modal) {
    closeModal();
  }
}

/**
 * Show error message
 */
function showError(message) {
  alert(message);
}

/**
 * Initialize and run the app
 */
document.addEventListener('DOMContentLoaded', async () => {
  init();

  // Initialize authentication (this will load data if authenticated)
  await initAuth();

  // After auth check, if we have data, run analysis
  if (APP.editableInventory.length > 0 && APP.recipeData.length > 0) {
    const results = runAnalysis(APP.editableInventory, APP.recipeData);
    APP.allResults = results;
    displayResults(results);
    displayShoppingList(results);
    setupSearch();
  }

  // Always display these UI components
  displayInventoryManager();
  displayFavorites();
});

