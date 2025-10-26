/**
 * API Service Layer
 * Handles all communication with the backend
 */

import { getAuthHeader, saveToken, saveUser, clearAuth } from '../utils/auth.js';

const API_BASE_URL = 'http://localhost:3000';

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        clearAuth();
        window.location.href = '/'; // Redirect to login
      }
      throw new Error(data.message || data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============= AUTHENTICATION API =============

/**
 * Sign up a new user
 */
export async function signup(email, password, name) {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });

  // Save token and user data
  if (data.token) {
    saveToken(data.token);
    saveUser(data.user);
  }

  return data;
}

/**
 * Login user
 */
export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Save token and user data
  if (data.token) {
    saveToken(data.token);
    saveUser(data.user);
  }

  return data;
}

/**
 * Logout user
 */
export async function logout() {
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    // Continue even if logout fails
    console.error('Logout error:', error);
  } finally {
    clearAuth();
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser() {
  const data = await apiFetch('/auth/me');
  if (data.user) {
    saveUser(data.user);
  }
  return data.user;
}

// ============= INVENTORY API =============

/**
 * Get user's inventory
 */
export async function getInventory() {
  const data = await apiFetch('/api/inventory');
  return data.inventory;
}

/**
 * Add item to inventory
 */
export async function addInventoryItem(item) {
  const data = await apiFetch('/api/inventory', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return data;
}

/**
 * Update inventory item
 */
export async function updateInventoryItem(id, item) {
  const data = await apiFetch(`/api/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
  return data;
}

/**
 * Delete inventory item
 */
export async function deleteInventoryItem(id) {
  const data = await apiFetch(`/api/inventory/${id}`, {
    method: 'DELETE',
  });
  return data;
}

/**
 * Bulk upload inventory
 */
export async function bulkUploadInventory(items, replace = true) {
  const data = await apiFetch('/api/inventory/bulk', {
    method: 'POST',
    body: JSON.stringify({ items, replace }),
  });
  return data;
}

// ============= RECIPES API =============

/**
 * Get user's recipes
 */
export async function getRecipes() {
  const data = await apiFetch('/api/recipes');
  return data.recipes;
}

/**
 * Add recipe
 */
export async function addRecipe(recipe) {
  const data = await apiFetch('/api/recipes', {
    method: 'POST',
    body: JSON.stringify(recipe),
  });
  return data;
}

/**
 * Update recipe
 */
export async function updateRecipe(id, recipe) {
  const data = await apiFetch(`/api/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(recipe),
  });
  return data;
}

/**
 * Delete recipe
 */
export async function deleteRecipe(id) {
  const data = await apiFetch(`/api/recipes/${id}`, {
    method: 'DELETE',
  });
  return data;
}

/**
 * Bulk upload recipes
 */
export async function bulkUploadRecipes(recipes, replace = true) {
  const data = await apiFetch('/api/recipes/bulk', {
    method: 'POST',
    body: JSON.stringify({ recipes, replace }),
  });
  return data;
}

// ============= FAVORITES API =============

/**
 * Get user's favorites
 */
export async function getFavorites() {
  const data = await apiFetch('/api/favorites');
  return data.favorites;
}

/**
 * Add to favorites
 */
export async function addFavorite(recipeName) {
  const data = await apiFetch('/api/favorites', {
    method: 'POST',
    body: JSON.stringify({ recipeName }),
  });
  return data;
}

/**
 * Remove from favorites
 */
export async function removeFavorite(recipeName) {
  const encodedName = encodeURIComponent(recipeName);
  const data = await apiFetch(`/api/favorites/${encodedName}`, {
    method: 'DELETE',
  });
  return data;
}

// ============= HISTORY API =============

/**
 * Get user's recipe history
 */
export async function getHistory() {
  const data = await apiFetch('/api/favorites/history');
  return data.history;
}

/**
 * Update recipe history
 */
export async function updateHistory(recipeName, historyData) {
  const data = await apiFetch('/api/favorites/history', {
    method: 'POST',
    body: JSON.stringify({
      recipeName,
      ...historyData,
    }),
  });
  return data;
}
