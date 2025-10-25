/**
 * Main entry point for Cocktail Analyzer
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
} from './services/storage.js';
import { queryClaudeAPI, parseAIResponse } from './services/aiService.js';

// Import utilities
import { escapeHtml, normalizeIngredient, getTimeAgo } from './utils/formatters.js';
import { areSimilarIngredients } from './utils/fuzzyMatch.js';

// Import app state
import { APP, initializeApp } from './app.js';

/**
 * Initialize the application
 */
function init() {
  console.log('🍹 Initializing Cocktail Analyzer...');

  // Load saved data
  const savedInventory = loadInventory();
  if (savedInventory) {
    APP.editableInventory = savedInventory;
    console.log(`Loaded ${savedInventory.length} inventory items`);
  }

  const savedRecipes = loadRecipes();
  if (savedRecipes) {
    APP.recipeData = savedRecipes;
    console.log(`Loaded ${savedRecipes.length} recipes`);
  }

  APP.favorites = loadFavorites();
  APP.history = loadHistory();
  APP.apiKey = loadApiKey();
  APP.recentlyViewed = loadRecentlyViewed();

  // Initialize UI
  setupEventListeners();
  setupTabs();

  // If we have saved data, run analysis
  if (APP.editableInventory.length > 0 && APP.recipeData.length > 0) {
    const results = runAnalysis(APP.editableInventory, APP.recipeData);
    displayResults(results);
  }

  console.log('✅ Application ready!');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // File uploads
  const inventoryInput = document.getElementById('inventoryInput');
  const recipeInput = document.getElementById('recipeInput');

  if (inventoryInput) {
    inventoryInput.addEventListener('change', handleInventoryUpload);
  }

  if (recipeInput) {
    recipeInput.addEventListener('change', handleRecipeUpload);
  }

  // Analyze button
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', analyze);
  }

  // Modal close
  const modal = document.getElementById('recipeModal');
  const modalClose = document.querySelector('.modal-close');

  if (modal && modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
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

      // Remove active class from all tabs
      tabLinks.forEach((l) => l.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));

      // Add active class to clicked tab
      link.classList.add('active');
      const tabContent = document.getElementById(tabName);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
}

/**
 * Handle inventory file upload
 */
async function handleInventoryUpload(e) {
  const file = e.target.files[0];
  if (!file) {
    return;
  }

  try {
    const results = await parseCSV(file);
    const validation = validateInventoryCSV(results.data);

    if (!validation.valid) {
      showError(validation.error);
      return;
    }

    APP.inventoryData = results.data;
    APP.editableInventory = results.data;
    saveInventory(results.data);

    showSuccess(`Loaded ${results.data.length} inventory items`);
  } catch (error) {
    showError(`Failed to parse inventory: ${error.message}`);
  }
}

/**
 * Handle recipe file upload
 */
async function handleRecipeUpload(e) {
  const file = e.target.files[0];
  if (!file) {
    return;
  }

  try {
    const results = await parseCSV(file);
    const validation = validateRecipeCSV(results.data);

    if (!validation.valid) {
      showError(validation.error);
      return;
    }

    APP.recipeData = results.data;
    saveRecipes(results.data);

    showSuccess(`Loaded ${results.data.length} recipes`);
  } catch (error) {
    showError(`Failed to parse recipes: ${error.message}`);
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
}

/**
 * Display analysis results
 */
function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) {
    return;
  }

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

  resultsDiv.innerHTML = html;

  // Add click handlers
  resultsDiv.querySelectorAll('.recipe-item').forEach((item) => {
    item.addEventListener('click', () => {
      const category = item.dataset.category;
      const index = parseInt(item.dataset.index);
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
      ? `Missing: ${recipe.missing.join(', ')}`
      : `Missing: ${recipe.missing.length} items`;

  return `<div class="recipe-item" data-category="${category}" data-index="${index}">
    <div class="recipe-name">${escapeHtml(recipe.name)}</div>
    <div class="recipe-details">${recipe.compatibility}% - ${
    recipe.missing.length > 0 ? '<span class="missing">' + escapeHtml(missingText) + '</span>' : missingText
  }</div>
  </div>`;
}

/**
 * Show recipe modal
 */
function showRecipe(category, index) {
  const recipe = APP.allResults[category][index];
  if (!recipe) {
    return;
  }

  const modal = document.getElementById('recipeModal');
  const modalBody = document.getElementById('modalBody');

  let html = `<div class="modal-title">${escapeHtml(recipe.name)}</div>`;
  html += `<div class="compatibility-badge">${recipe.compatibility}% Compatible</div>`;

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

  if (recipe.fullRecipe.Instructions) {
    html += '<div class="modal-section"><div class="modal-section-title">🔨 Instructions</div>';
    html += `<div class="modal-section-content">${escapeHtml(recipe.fullRecipe.Instructions)}</div></div>`;
  }

  if (recipe.fullRecipe.Glass) {
    html += '<div class="modal-section"><div class="modal-section-title">🥃 Glass</div>';
    html += `<div class="modal-section-content">${escapeHtml(recipe.fullRecipe.Glass)}</div></div>`;
  }

  modalBody.innerHTML = html;
  modal.classList.add('active');
}

/**
 * Show error message
 */
function showError(message) {
  console.error(message);
  alert(`Error: ${message}`);
}

/**
 * Show success message
 */
function showSuccess(message) {
  console.log(message);
  // Could add a toast notification here
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for debugging
window.APP = APP;
