/**
 * Data Loader Service
 * Handles loading and syncing user data between localStorage and API
 */

import { APP } from '../app.js';
import {
  getInventory,
  getRecipes,
  getFavorites,
  getHistory,
  bulkUploadInventory,
  bulkUploadRecipes,
} from './api.js';
import {
  loadInventory,
  saveInventory,
  loadRecipes,
  saveRecipes,
  loadFavorites,
  saveFavorites,
} from './storage.js';

/**
 * Load all user data from API
 * Handles migration from localStorage if needed
 */
export async function loadUserData() {
  console.log('📦 Loading user data from API...');

  try {
    // Load data from API in parallel
    const [apiInventory, apiRecipes, apiFavorites, apiHistory] = await Promise.all([
      getInventory(),
      getRecipes(),
      getFavorites(),
      getHistory(),
    ]);

    console.log('✓ API data loaded:', {
      inventory: apiInventory?.length || 0,
      recipes: apiRecipes?.length || 0,
      favorites: apiFavorites?.length || 0,
      history: apiHistory?.length || 0,
    });

    // Check if we need to migrate localStorage data
    const needsMigration = await checkMigrationNeeded(apiInventory, apiRecipes);

    if (needsMigration) {
      console.log('🔄 Migrating localStorage data to API...');
      await migrateLocalStorageToAPI();

      // Reload data after migration
      const [newInventory, newRecipes] = await Promise.all([
        getInventory(),
        getRecipes(),
      ]);

      // Update APP state
      APP.editableInventory = processInventory(newInventory);
      APP.recipeData = processRecipes(newRecipes);
    } else {
      // Use API data
      APP.editableInventory = processInventory(apiInventory);
      APP.recipeData = processRecipes(apiRecipes);
    }

    // Load favorites and history
    loadFavoritesData(apiFavorites, apiHistory);

    // Save to localStorage as backup
    saveInventory(APP.editableInventory);
    saveRecipes(APP.recipeData);

    console.log('✅ User data loaded successfully');

    return {
      inventory: APP.editableInventory,
      recipes: APP.recipeData,
      favorites: apiFavorites,
      history: apiHistory,
    };
  } catch (error) {
    console.error('❌ Error loading user data from API:', error);
    console.log('⚠️ Falling back to localStorage...');

    // Fallback to localStorage
    return loadFromLocalStorage();
  }
}

/**
 * Check if we need to migrate localStorage data to API
 */
async function checkMigrationNeeded(apiInventory, apiRecipes) {
  // If API has data, no migration needed
  if ((apiInventory && apiInventory.length > 0) || (apiRecipes && apiRecipes.length > 0)) {
    return false;
  }

  // Check if localStorage has data
  const localInventory = loadInventory();
  const localRecipes = loadRecipes();

  return (localInventory && localInventory.length > 0) || (localRecipes && localRecipes.length > 0);
}

/**
 * Migrate localStorage data to API
 */
async function migrateLocalStorageToAPI() {
  const localInventory = loadInventory();
  const localRecipes = loadRecipes();

  const promises = [];

  if (localInventory && localInventory.length > 0) {
    console.log(`  - Uploading ${localInventory.length} inventory items...`);
    promises.push(bulkUploadInventory(localInventory, true));
  }

  if (localRecipes && localRecipes.length > 0) {
    console.log(`  - Uploading ${localRecipes.length} recipes...`);
    promises.push(bulkUploadRecipes(localRecipes, true));
  }

  await Promise.all(promises);
  console.log('✓ Migration complete!');
}

/**
 * Process inventory data from API format to app format
 */
function processInventory(apiInventory) {
  if (!apiInventory || apiInventory.length === 0) {
    return [];
  }

  return apiInventory.map((item) => ({
    'Liquor Type': item.liquor_type || '',
    Name: item.name || '',
    'Stock Number': item.stock_number || 1,
    'Detailed Spirit Classification': item.detailed_classification || '',
    'Distillation Method': item.distillation_method || '',
    'ABV (%)': item.abv || '',
    'Distillery Location': item.distillery_location || '',
    'Age Statement or Barrel Finish': item.age_statement || '',
    'Additional Notes': item.additional_notes || '',
    'Profile (Nose)': item.profile_nose || '',
    Palate: item.palate || '',
    Finish: item.finish || '',
  }));
}

/**
 * Process recipes data from API format to app format
 */
function processRecipes(apiRecipes) {
  if (!apiRecipes || apiRecipes.length === 0) {
    return [];
  }

  return apiRecipes.map((recipe) => {
    // Parse ingredients from JSON to newline-separated string
    let ingredientsString = '';
    if (recipe.ingredients) {
      try {
        const ingredients = typeof recipe.ingredients === 'string'
          ? JSON.parse(recipe.ingredients)
          : recipe.ingredients;

        if (Array.isArray(ingredients)) {
          ingredientsString = ingredients.join('\n');
        }
      } catch (error) {
        console.error('Error parsing recipe ingredients:', error);
        ingredientsString = recipe.ingredients; // Use as-is if parse fails
      }
    }

    return {
      'Drink Name': recipe.name || recipe.drink_name || '',
      Ingredients: ingredientsString,
      Category: recipe.category || '',
      Glass: recipe.glass || '',
      Instructions: recipe.instructions || '',
    };
  });
}

/**
 * Load favorites and history data
 */
function loadFavoritesData(apiFavorites, apiHistory) {
  // Process favorites
  if (apiFavorites && apiFavorites.length > 0) {
    const favoritesMap = {};
    apiFavorites.forEach((fav) => {
      favoritesMap[fav.recipe_name] = true;
    });
    saveFavorites(favoritesMap);
  }

  // Process history
  if (apiHistory && apiHistory.length > 0) {
    const historyMap = {};
    apiHistory.forEach((hist) => {
      historyMap[hist.recipe_name] = {
        lastMade: hist.last_made,
        timesMade: hist.times_made,
        rating: hist.rating,
        notes: hist.notes,
      };
    });
    // Store history in localStorage for now
    localStorage.setItem('recipeHistory', JSON.stringify(historyMap));
  }
}

/**
 * Fallback to localStorage if API fails
 */
function loadFromLocalStorage() {
  console.log('📦 Loading from localStorage...');

  const inventory = loadInventory() || [];
  const recipes = loadRecipes() || [];
  const favorites = loadFavorites() || {};

  APP.editableInventory = inventory;
  APP.recipeData = recipes;

  return {
    inventory,
    recipes,
    favorites,
    history: {},
  };
}
