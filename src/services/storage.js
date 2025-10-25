/**
 * LocalStorage service for persistent data
 */

const KEYS = {
  INVENTORY: 'cocktail_inventory',
  RECIPES: 'cocktail_recipes',
  FAVORITES: 'cocktail_favorites',
  HISTORY: 'cocktail_history',
  API_KEY: 'anthropic_api_key',
  ACTIVE_TAB: 'cocktail_active_tab',
  RECENTLY_VIEWED: 'cocktail_recentlyViewed',
};

/**
 * Load inventory from localStorage
 * @returns {Array|null} - Inventory data or null
 */
export function loadInventory() {
  try {
    const saved = localStorage.getItem(KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load inventory:', error);
    return null;
  }
}

/**
 * Save inventory to localStorage
 * @param {Array} inventory - Inventory data
 */
export function saveInventory(inventory) {
  try {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory));
  } catch (error) {
    console.error('Failed to save inventory:', error);
  }
}

/**
 * Load recipes from localStorage
 * @returns {Array|null} - Recipe data or null
 */
export function loadRecipes() {
  try {
    const saved = localStorage.getItem(KEYS.RECIPES);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load recipes:', error);
    return null;
  }
}

/**
 * Save recipes to localStorage
 * @param {Array} recipes - Recipe data
 */
export function saveRecipes(recipes) {
  try {
    if (recipes && recipes.length > 0) {
      localStorage.setItem(KEYS.RECIPES, JSON.stringify(recipes));
    }
  } catch (error) {
    console.error('Failed to save recipes:', error);
  }
}

/**
 * Load favorites from localStorage
 * @returns {Set} - Set of favorite recipe names
 */
export function loadFavorites() {
  try {
    const saved = localStorage.getItem(KEYS.FAVORITES);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return new Set();
  }
}

/**
 * Save favorites to localStorage
 * @param {Set} favorites - Set of favorite recipe names
 */
export function saveFavorites(favorites) {
  try {
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify([...favorites]));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
}

/**
 * Load history from localStorage
 * @returns {Object} - History object
 */
export function loadHistory() {
  try {
    const saved = localStorage.getItem(KEYS.HISTORY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Failed to load history:', error);
    return {};
  }
}

/**
 * Save history to localStorage
 * @param {Object} history - History object
 */
export function saveHistory(history) {
  try {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

/**
 * Load API key from localStorage
 * @returns {string|null} - API key or null
 */
export function loadApiKey() {
  try {
    return localStorage.getItem(KEYS.API_KEY);
  } catch (error) {
    console.error('Failed to load API key:', error);
    return null;
  }
}

/**
 * Save API key to localStorage
 * @param {string} apiKey - API key
 */
export function saveApiKey(apiKey) {
  try {
    if (apiKey) {
      localStorage.setItem(KEYS.API_KEY, apiKey);
    } else {
      localStorage.removeItem(KEYS.API_KEY);
    }
  } catch (error) {
    console.error('Failed to save API key:', error);
  }
}

/**
 * Load active tab from localStorage
 * @returns {string|null} - Active tab name or null
 */
export function loadActiveTab() {
  try {
    return localStorage.getItem(KEYS.ACTIVE_TAB);
  } catch (error) {
    console.error('Failed to load active tab:', error);
    return null;
  }
}

/**
 * Save active tab to localStorage
 * @param {string} tabName - Tab name
 */
export function saveActiveTab(tabName) {
  try {
    localStorage.setItem(KEYS.ACTIVE_TAB, tabName);
  } catch (error) {
    console.error('Failed to save active tab:', error);
  }
}

/**
 * Load recently viewed recipes from localStorage
 * @returns {Array} - Array of recently viewed items
 */
export function loadRecentlyViewed() {
  try {
    const saved = localStorage.getItem(KEYS.RECENTLY_VIEWED);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load recently viewed:', error);
    return [];
  }
}

/**
 * Save recently viewed recipes to localStorage
 * @param {Array} recentlyViewed - Array of recently viewed items
 */
export function saveRecentlyViewed(recentlyViewed) {
  try {
    localStorage.setItem(KEYS.RECENTLY_VIEWED, JSON.stringify(recentlyViewed));
  } catch (error) {
    console.error('Failed to save recently viewed:', error);
  }
}

/**
 * Export all data as JSON
 * @returns {Object} - All application data
 */
export function exportAllData() {
  return {
    inventory: loadInventory(),
    recipes: loadRecipes(),
    favorites: [...loadFavorites()],
    history: loadHistory(),
    recentlyViewed: loadRecentlyViewed(),
    exportDate: new Date().toISOString(),
  };
}

/**
 * Import all data from JSON
 * @param {Object} data - Data object to import
 * @returns {boolean} - Success status
 */
export function importAllData(data) {
  try {
    if (data.inventory) {
      saveInventory(data.inventory);
    }
    if (data.recipes) {
      saveRecipes(data.recipes);
    }
    if (data.favorites) {
      saveFavorites(new Set(data.favorites));
    }
    if (data.history) {
      saveHistory(data.history);
    }
    if (data.recentlyViewed) {
      saveRecentlyViewed(data.recentlyViewed);
    }
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}
