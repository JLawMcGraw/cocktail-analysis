/**
 * Data Management Feature Module
 * Handles export and import of application data
 */

import {
  exportAllData,
  importAllData,
  loadInventory,
  loadRecipes,
  loadFavorites,
  loadHistory,
  loadApiKey,
} from '../services/storage.js';
import { APP } from '../app.js';

/**
 * Export all data
 */
export function exportData() {
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
export async function importData(e, callbacks) {
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
        callbacks.displayInventoryManager();
      }
      callbacks.checkReady();

      alert('✓ Backup restored successfully! All your data has been imported.');

      e.target.value = '';
    } catch (error) {
      alert('❌ Error importing backup: ' + error.message);
      console.error('Import error:', error);
    }
  };
  reader.readAsText(file);
}
