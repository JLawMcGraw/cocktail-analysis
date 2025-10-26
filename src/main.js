/**
 * Main entry point for Cocktail Analyzer v6.0
 * Modular architecture with feature-based organization
 */

// Import styles
import './styles/main.css';

// Import services
import { runAnalysis } from './services/analyzer.js';
import { loadApiKey, loadActiveTab, saveActiveTab } from './services/storage.js';
import { loadUserData } from './services/dataLoader.js';

// Import app state
import { APP } from './app.js';

// Import authentication
import { isAuthenticated, getUser, clearAuth } from './utils/auth.js';
import { showLoginModal, showSignupModal } from './pages/auth.js';
import { logout } from './services/api.js';

// Import feature modules
import { handleInventoryUpload, handleRecipeUpload } from './features/fileUpload.js';
import { analyze, displayResults, displayShoppingList } from './features/analysis.js';
import { showRecipe, closeModal, handleModalClick } from './features/modal.js';
import {
  toggleFavorite,
  displayFavorites,
  addToRecentlyViewed,
  displayRecentlyViewed,
  openRecentRecipe,
} from './features/favorites.js';
import { displayInventoryManager } from './features/inventory.js';
import {
  setupSearch,
  handleSearch,
  refreshResults,
  clearAllFilters,
  showRandomCocktail,
} from './features/search.js';
import {
  handleAIQuery,
  toggleApiKeyVisibility,
  handleApiKeyChange,
  clearConversation,
} from './features/ai.js';
import { exportData, importData } from './features/dataManagement.js';

// DOM Elements cache
const elements = {};

/**
 * Initialize the application
 */
function init() {
  console.log('🍹 Initializing Cocktail Analyzer v6.0 (Modular Architecture)...');

  cacheElements();
  loadSavedData();
  setupEventListeners();
  setupTabs();
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
  // Create callbacks object for feature modules
  const callbacks = {
    showError,
    checkReady,
    displayInventoryManager: () => displayInventoryManager(elements, getCallbacks()),
    displayResults: (results) => displayResults(results, elements, getCallbacks()),
    displayFavorites: () => displayFavorites(getCallbacks()),
    displayShoppingList: (results) => displayShoppingList(results, elements),
    setupSearch: () => setupSearch(elements),
    displayRecentlyViewed: () => displayRecentlyViewed(elements),
    switchTab,
    showRecipe: (category, index) => showRecipe(category, index, elements, getCallbacks()),
    toggleFavorite: (name) => toggleFavorite(name, getCallbacks()),
    addToRecentlyViewed,
    elements,
  };

  // File uploads
  if (elements.inventoryInput) {
    elements.inventoryInput.addEventListener('change', (e) =>
      handleInventoryUpload(e, elements, callbacks),
    );
  }

  if (elements.recipeInput) {
    elements.recipeInput.addEventListener('change', (e) =>
      handleRecipeUpload(e, elements, callbacks),
    );
  }

  // Analyze button
  if (elements.analyzeBtn) {
    elements.analyzeBtn.addEventListener('click', () => analyze(getCallbacks()));
  }

  // Modal
  const modalClose = document.querySelector('.modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', () => closeModal(elements));
  }

  if (elements.modal) {
    elements.modal.addEventListener('click', (e) => handleModalClick(e, elements));
  }

  // Search
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => handleSearch(elements, getCallbacks()));
  }

  // Filter controls
  const randomBtn = document.getElementById('randomCocktailBtn');
  if (randomBtn) {
    randomBtn.addEventListener('click', () =>
      showRandomCocktail((cat, idx) => showRecipe(cat, idx, elements, getCallbacks())),
    );
  }

  if (elements.perfectMatchesBtn) {
    elements.perfectMatchesBtn.addEventListener('click', () => {
      APP.activeFilters.perfectMatches = !APP.activeFilters.perfectMatches;
      refreshResults(getCallbacks());
    });
  }

  if (elements.almostThereBtn) {
    elements.almostThereBtn.addEventListener('click', () => {
      APP.activeFilters.missingOne = !APP.activeFilters.missingOne;
      refreshResults(getCallbacks());
    });
  }

  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => clearAllFilters(elements, getCallbacks()));
  }

  if (elements.sortSelect) {
    elements.sortSelect.addEventListener('change', (e) => {
      APP.sortBy = e.target.value;
      refreshResults(getCallbacks());
    });
  }

  // AI
  if (elements.toggleApiKeyBtn) {
    elements.toggleApiKeyBtn.addEventListener('click', () => toggleApiKeyVisibility(elements));
  }

  if (elements.apiKeyInput) {
    elements.apiKeyInput.addEventListener('change', () => handleApiKeyChange(elements));
  }

  if (elements.aiQueryBtn) {
    elements.aiQueryBtn.addEventListener('click', () => handleAIQuery(elements, getCallbacks()));
  }

  if (elements.aiQueryInput) {
    elements.aiQueryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAIQuery(elements, getCallbacks());
      }
    });
  }

  if (elements.clearConversationBtn) {
    elements.clearConversationBtn.addEventListener('click', () => clearConversation(elements));
  }

  // Export/Import
  if (elements.exportDataBtn) {
    elements.exportDataBtn.addEventListener('click', exportData);
  }

  if (elements.importDataFile) {
    elements.importDataFile.addEventListener('change', (e) => importData(e, getCallbacks()));
  }
}

/**
 * Get callbacks object (avoids circular dependency)
 */
function getCallbacks() {
  return {
    showError,
    checkReady,
    displayInventoryManager: () => displayInventoryManager(elements, getCallbacks()),
    displayResults: (results) => displayResults(results, elements, getCallbacks()),
    displayFavorites: () => displayFavorites(getCallbacks()),
    displayShoppingList: (results) => displayShoppingList(results, elements),
    setupSearch: () => setupSearch(elements),
    displayRecentlyViewed: () => displayRecentlyViewed(elements),
    switchTab,
    showRecipe: (category, index) => showRecipe(category, index, elements, getCallbacks()),
    toggleFavorite: (name) => toggleFavorite(name, getCallbacks()),
    addToRecentlyViewed,
    elements,
  };
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
    displayInventoryManager(elements, getCallbacks());
  } else if (tabName === 'favoritesTab') {
    displayFavorites(getCallbacks());
  } else if (tabName === 'recipesTab' && APP.allResults) {
    displayRecentlyViewed(elements);
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
 * Show error message
 */
function showError(message) {
  alert(message);
}

/**
 * Setup authentication UI
 */
function setupAuthUI() {
  const authLoggedOut = document.getElementById('authLoggedOut');
  const authLoggedIn = document.getElementById('authLoggedIn');
  const userEmail = document.getElementById('userEmail');
  const mainContent = document.querySelector('.main-content');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (isAuthenticated()) {
    // User is logged in - show logged in state
    const user = getUser();
    if (authLoggedOut) authLoggedOut.style.display = 'none';
    if (authLoggedIn) authLoggedIn.style.display = 'block';
    if (userEmail) userEmail.textContent = user?.email || 'User';
    if (mainContent) mainContent.style.display = 'block';
  } else {
    // User is logged out - show logged out state
    if (authLoggedOut) authLoggedOut.style.display = 'block';
    if (authLoggedIn) authLoggedIn.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';

    // Show login modal automatically
    showLoginModal(() => {
      window.location.reload();
    });
  }

  // Wire up auth buttons
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      showLoginModal(() => {
        window.location.reload();
      });
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', () => {
      showSignupModal(() => {
        window.location.reload();
      });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to logout?')) {
        try {
          await logout();
          window.location.reload();
        } catch (error) {
          console.error('Logout error:', error);
          // Clear auth anyway
          clearAuth();
          window.location.reload();
        }
      }
    });
  }
}

/**
 * Initialize and run the app
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Setup authentication UI (will show login modal if not authenticated)
  setupAuthUI();

  // Only initialize the app if user is authenticated
  if (!isAuthenticated()) {
    return;
  }

  // User is authenticated - show main app
  const user = getUser();
  console.log('🍹 Welcome back,', user?.name || user?.email);

  init();

  // Load user data from API (with automatic localStorage migration)
  try {
    await loadUserData();

    // After loading data, run analysis if we have both inventory and recipes
    if (APP.editableInventory.length > 0 && APP.recipeData.length > 0) {
      const results = runAnalysis(APP.editableInventory, APP.recipeData);
      APP.allResults = results;
      displayResults(results, elements, getCallbacks());
      displayShoppingList(results, elements);
      setupSearch(elements);
      displayInventoryManager(elements, getCallbacks());
      displayFavorites(getCallbacks());
    } else {
      // No data yet - show empty states
      displayInventoryManager(elements, getCallbacks());
      displayFavorites(getCallbacks());
      // Hide shopping list when no data
      if (elements.shoppingList) {
        elements.shoppingList.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    // Show empty states on error
    displayInventoryManager(elements, getCallbacks());
    displayFavorites(getCallbacks());
    if (elements.shoppingList) {
      elements.shoppingList.style.display = 'none';
    }
  }
});

// Make openRecentRecipe global for onclick handler
window.openRecentRecipe = (recipeName) => {
  openRecentRecipe(recipeName, (cat, idx) => showRecipe(cat, idx, elements, getCallbacks()));
};
