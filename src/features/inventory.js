/**
 * Inventory Management Feature Module
 * Handles inventory display and editing
 */

import { runAnalysis } from '../services/analyzer.js';
import { saveInventory } from '../services/storage.js';
import { escapeHtml, escapeCsv } from '../utils/formatters.js';
import { APP } from '../app.js';

/**
 * Display inventory manager
 */
export function displayInventoryManager(elements, callbacks) {
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
      removeIngredient(parseInt(this.getAttribute('data-index')), callbacks);
    });
  });

  const addBtn = document.getElementById('addIngredientBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => addIngredient(callbacks));
  }

  const exportBtn = document.getElementById('exportInventoryBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportInventoryCSV);
  }
}

/**
 * Add ingredient to inventory
 */
function addIngredient(callbacks) {
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
  reanalyzeWithCurrentInventory(callbacks);
}

/**
 * Remove ingredient from inventory
 */
function removeIngredient(index, callbacks) {
  const item = APP.editableInventory[index];
  const itemName = typeof item === 'object' ? item.Name : item;

  if (confirm(`Remove "${itemName}" from your bar?`)) {
    APP.editableInventory.splice(index, 1);
    saveInventory(APP.editableInventory);
    reanalyzeWithCurrentInventory(callbacks);
  }
}

/**
 * Re-analyze with current inventory
 */
function reanalyzeWithCurrentInventory(callbacks) {
  if (!APP.recipeData || APP.recipeData.length === 0) {
    callbacks.displayInventoryManager();
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
  callbacks.displayResults(results);
  callbacks.displayFavorites();
  callbacks.displayInventoryManager();
  callbacks.displayShoppingList(results);
  callbacks.setupSearch();
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
