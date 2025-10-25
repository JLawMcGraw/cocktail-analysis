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

// DOM Elements
const elements = {};

/**
 * Initialize the application
 */
function init() {
  console.log('🍹 Initializing Cocktail Analyzer v5.0 (Modular)...');

  // Cache DOM elements
  cacheElements();

  // Load saved data
  loadSavedData();

  // Initialize UI
  setupEventListeners();
  setupTabs();

  // If we have saved data, run analysis automatically
  if (APP.editableInventory.length > 0 && APP.recipeData.length > 0) {
    const results = runAnalysis(APP.editableInventory, APP.recipeData);
    APP.allResults = results;
    displayResults(results);
    displayFavorites();
    displayInventoryManager();
    displayShoppingList(results);
    setupSearch();
  } else {
    displayInventoryManager();
    displayFavorites();
  }

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
 */
function loadSavedData() {
  const savedInventory = loadInventory();
  if (savedInventory) {
    APP.editableInventory = savedInventory;
    APP.inventoryData = savedInventory;
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

  if (elements.apiKeyInput && APP.apiKey) {
    elements.apiKeyInput.value = APP.apiKey;
  }
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

  // Switch to recipes tab
  switchTab('recipesTab');
}

