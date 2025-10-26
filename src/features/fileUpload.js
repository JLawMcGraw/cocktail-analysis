/**
 * File Upload Feature Module
 * Handles inventory and recipe file uploads
 */

import { parseCSV, validateInventoryCSV, validateRecipeCSV } from '../services/csvParser.js';
import { saveInventory, saveRecipes } from '../services/storage.js';
import { bulkUploadInventory, bulkUploadRecipes } from '../services/api.js';
import { APP } from '../app.js';

/**
 * Handle inventory file upload
 */
export async function handleInventoryUpload(e, elements, callbacks) {
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
      callbacks.showError(validation.error);
      elements.inventoryStatus.textContent = '❌ ' + validation.error;
      elements.inventoryStatus.className = 'file-status error';
      return;
    }

    APP.inventoryData = results.data;
    APP.editableInventory = results.data;

    // Save to localStorage (backup)
    saveInventory(results.data);

    // Upload to API
    try {
      await bulkUploadInventory(results.data, true); // replace existing
      const inStock = results.data.filter((item) => item['Stock Number'] > 0).length;
      elements.inventoryStatus.textContent = `✓ Loaded ${inStock} items in stock (saved to cloud)`;
      elements.inventoryStatus.className = 'file-status success';
    } catch (apiError) {
      console.error('API upload error:', apiError);
      const inStock = results.data.filter((item) => item['Stock Number'] > 0).length;
      elements.inventoryStatus.textContent = `✓ Loaded ${inStock} items (saved locally only)`;
      elements.inventoryStatus.className = 'file-status success';
    }

    callbacks.checkReady();
    callbacks.displayInventoryManager();
  } catch (error) {
    callbacks.showError(`Failed to parse inventory: ${error.message}`);
    elements.inventoryStatus.textContent = '❌ Error loading file';
    elements.inventoryStatus.className = 'file-status error';
  }
}

/**
 * Handle recipe file upload (supports multiple files)
 */
export async function handleRecipeUpload(e, elements, callbacks) {
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
        callbacks.showError(`Error in ${file.name}: ${validation.error}`);
        continue;
      }

      allRecipes = allRecipes.concat(results.data);
    }

    if (allRecipes.length === 0) {
      throw new Error('No valid recipes found');
    }

    APP.recipeData = allRecipes;

    // Save to localStorage (backup)
    saveRecipes(allRecipes);

    // Upload to API
    try {
      await bulkUploadRecipes(allRecipes, true); // replace existing
      elements.recipeStatus.textContent = `✓ Loaded ${allRecipes.length} recipes from ${files.length} file(s) (saved to cloud)`;
      elements.recipeStatus.className = 'file-status success';
    } catch (apiError) {
      console.error('API upload error:', apiError);
      elements.recipeStatus.textContent = `✓ Loaded ${allRecipes.length} recipes (saved locally only)`;
      elements.recipeStatus.className = 'file-status success';
    }

    callbacks.checkReady();
  } catch (error) {
    callbacks.showError(`Failed to parse recipes: ${error.message}`);
    elements.recipeStatus.textContent = '❌ Error loading files';
    elements.recipeStatus.className = 'file-status error';
  }
}
