/**
 * Application state management
 */

/**
 * Global application state
 */
export const APP = {
  inventoryData: null,
  recipeData: [],
  currentInventory: null,
  allResults: null,
  apiKey: null,
  conversationHistory: [],
  favorites: new Set(),
  history: {},
  editableInventory: [],
  activeFilters: {
    perfectMatches: false,
    missingOne: false,
  },
  sortBy: 'compatibility',
  recentlyViewed: [],
};

/**
 * Initialize application state
 */
export function initializeApp() {
  console.log('Cocktail Analyzer v5.0 - Modularized Edition');
  console.log('Application initialized');
}
