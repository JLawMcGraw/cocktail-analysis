// Authentication UI Integration and Auto-Sync
import { AuthService } from './authService.js';
import { APIService } from './apiService.js';
import { loadInventory, saveInventory, loadRecipes, saveRecipes, loadFavorites, saveFavorites, loadHistory, saveHistory } from './storage.js';
import { APP } from '../app.js';

// Initialize services
export const authService = new AuthService();
export const apiService = new APIService(authService);

let authMode = 'login'; // 'login' or 'signup'

// Initialize authentication
export async function initAuth() {
  const isAuthenticated = await authService.verifySession();

  // If not authenticated, clear old localStorage data
  if (!isAuthenticated) {
    clearLocalStorageData();
  }

  updateAuthUI(isAuthenticated);
  setupAuthEventListeners();

  if (isAuthenticated) {
    await loadUserDataFromServer();
  }
}

// Clear localStorage data (but keep API key)
function clearLocalStorageData() {
  const apiKey = localStorage.getItem('anthropic_api_key');

  // Clear all cocktail-related data
  localStorage.removeItem('cocktail_inventory');
  localStorage.removeItem('cocktail_recipes');
  localStorage.removeItem('cocktail_favorites');
  localStorage.removeItem('cocktail_history');
  localStorage.removeItem('cocktail_recentlyViewed');
  localStorage.removeItem('cocktail_active_tab');

  // Restore API key if it existed
  if (apiKey) {
    localStorage.setItem('anthropic_api_key', apiKey);
  }

  // Clear app state
  APP.inventoryData = null;
  APP.recipeData = [];
  APP.editableInventory = [];
  APP.favorites = new Set();
  APP.history = {};
  APP.recentlyViewed = [];
  APP.allResults = null;

  console.log('Cleared localStorage data (not authenticated)');
}

// Update auth UI
function updateAuthUI(isLoggedIn) {
  const loggedInSection = document.getElementById('authLoggedIn');
  const loggedOutSection = document.getElementById('authLoggedOut');
  const userEmailElement = document.getElementById('userEmail');

  if (isLoggedIn) {
    const user = authService.getCurrentUser();
    userEmailElement.textContent = user.email;
    loggedInSection.style.display = 'block';
    loggedOutSection.style.display = 'none';
  } else {
    loggedInSection.style.display = 'none';
    loggedOutSection.style.display = 'block';
  }
}

// Setup event listeners
function setupAuthEventListeners() {
  document.getElementById('loginBtn').addEventListener('click', () => openAuthModal('login'));
  document.getElementById('signupBtn').addEventListener('click', () => openAuthModal('signup'));
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('authModalClose').addEventListener('click', closeAuthModal);
  document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target.id === 'authModal') closeAuthModal();
  });
  document.getElementById('authForm').addEventListener('submit', handleAuthSubmit);
  document.getElementById('authSwitchLink').addEventListener('click', (e) => {
    e.preventDefault();
    switchAuthMode();
  });
}

function openAuthModal(mode) {
  authMode = mode;
  updateAuthModalUI();
  document.getElementById('authModal').style.display = 'flex';
  document.getElementById('authEmail').focus();
}

function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
  document.getElementById('authForm').reset();
  document.getElementById('authError').style.display = 'none';
}

function updateAuthModalUI() {
  const title = document.getElementById('authModalTitle');
  const submitBtn = document.getElementById('authSubmitBtn');
  const switchText = document.getElementById('authSwitchText');
  const switchLink = document.getElementById('authSwitchLink');

  if (authMode === 'login') {
    title.textContent = 'Login';
    submitBtn.textContent = 'Login';
    switchText.textContent = "Don't have an account?";
    switchLink.textContent = 'Sign up';
  } else {
    title.textContent = 'Sign Up';
    submitBtn.textContent = 'Create Account';
    switchText.textContent = 'Already have an account?';
    switchLink.textContent = 'Login';
  }
}

function switchAuthMode() {
  authMode = authMode === 'login' ? 'signup' : 'login';
  updateAuthModalUI();
  document.getElementById('authError').style.display = 'none';
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const errorElement = document.getElementById('authError');
  const submitBtn = document.getElementById('authSubmitBtn');

  errorElement.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = authMode === 'login' ? 'Logging in...' : 'Creating account...';

  try {
    if (authMode === 'login') {
      await authService.login(email, password);
    } else {
      await authService.signup(email, password);
    }

    closeAuthModal();
    updateAuthUI(true);
    await loadUserDataFromServer();
    showNotification(`Welcome${authMode === 'signup' ? ' to Cocktail Analyzer' : ' back'}!`, 'success');
  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = authMode === 'login' ? 'Login' : 'Create Account';
  }
}

async function handleLogout() {
  if (!confirm('Are you sure you want to logout? Your data will be synced to the server.')) {
    return;
  }

  try {
    await syncDataToServer();
    await authService.logout();
    updateAuthUI(false);

    // Clear app data
    APP.inventoryData = null;
    APP.recipeData = [];
    APP.editableInventory = [];
    APP.favorites = new Set();
    APP.history = {};
    APP.conversationHistory = [];
    APP.allResults = null;

    showNotification('Logged out successfully', 'success');
    window.location.reload();
  } catch (error) {
    console.error('Logout error:', error);
    showNotification('Error logging out: ' + error.message, 'error');
  }
}

// Load user data from server
export async function loadUserDataFromServer() {
  if (!authService.isAuthenticated()) return;

  try {
    const [inventory, recipes, favorites, history] = await Promise.all([
      apiService.getInventory(),
      apiService.getRecipes(),
      apiService.getFavorites(),
      apiService.getHistory()
    ]);

    if (inventory && inventory.length > 0) {
      APP.editableInventory = inventory;
      APP.inventoryData = inventory;
      saveInventory(inventory);
      console.log(`Loaded ${inventory.length} items from server`);
    }

    if (recipes && recipes.length > 0) {
      APP.recipeData = recipes;
      saveRecipes(recipes);
      console.log(`Loaded ${recipes.length} recipes from server`);
    }

    if (favorites && favorites.length > 0) {
      APP.favorites = new Set(favorites);
      saveFavorites(APP.favorites);
    }

    if (history) {
      APP.history = history;
      saveHistory(history);
    }

    showNotification('Data loaded from your account', 'success');

    console.log('User data loaded successfully from server');
  } catch (error) {
    console.error('Error loading user data:', error);
    showNotification('Error loading your data: ' + error.message, 'error');
  }
}

// Sync data to server
export async function syncDataToServer() {
  if (!authService.isAuthenticated()) return;

  try {
    const inventory = loadInventory();
    const recipes = loadRecipes();
    const favorites = loadFavorites();
    const history = loadHistory();

    await Promise.all([
      inventory && inventory.length > 0 ? apiService.saveInventory(inventory) : Promise.resolve(),
      recipes && recipes.length > 0 ? apiService.saveRecipes(recipes) : Promise.resolve(),
      favorites && favorites.size > 0 ? apiService.saveFavorites([...favorites]) : Promise.resolve(),
      history && Object.keys(history).length > 0 ? apiService.saveHistory(history) : Promise.resolve()
    ]);

    console.log('Data synced to server');
  } catch (error) {
    console.error('Error syncing data:', error);
    throw error;
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0a7ea4'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Auto-sync every 30 seconds
setInterval(async () => {
  if (authService.isAuthenticated()) {
    try {
      await syncDataToServer();
    } catch (error) {
      console.error('Auto-sync error:', error);
    }
  }
}, 30000);

// Sync before page unload
window.addEventListener('beforeunload', async (e) => {
  if (authService.isAuthenticated()) {
    try {
      await syncDataToServer();
    } catch (error) {
      console.error('Error syncing on unload:', error);
    }
  }
});
