// Authentication Integration
// This file handles the UI integration of authentication with the main app

// Auth Modal State
let authMode = 'login'; // 'login' or 'signup'

// Initialize authentication on page load
async function initAuth() {
  // Check if user is already logged in
  const isAuthenticated = await authClient.verifySession();

  updateAuthUI(isAuthenticated);

  // Set up event listeners
  setupAuthEventListeners();

  if (isAuthenticated) {
    // Load user data from server
    await loadUserDataFromServer();
  }
}

// Update auth UI based on login state
function updateAuthUI(isLoggedIn) {
  const loggedInSection = document.getElementById('authLoggedIn');
  const loggedOutSection = document.getElementById('authLoggedOut');
  const userEmailElement = document.getElementById('userEmail');

  if (isLoggedIn) {
    const user = authClient.getCurrentUser();
    userEmailElement.textContent = user.email;
    loggedInSection.style.display = 'block';
    loggedOutSection.style.display = 'none';
  } else {
    loggedInSection.style.display = 'none';
    loggedOutSection.style.display = 'block';
  }
}

// Setup event listeners for auth
function setupAuthEventListeners() {
  // Login button
  document.getElementById('loginBtn').addEventListener('click', () => {
    openAuthModal('login');
  });

  // Signup button
  document.getElementById('signupBtn').addEventListener('click', () => {
    openAuthModal('signup');
  });

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to logout? Your data will be synced to the server.')) {
      await handleLogout();
    }
  });

  // Auth modal close
  document.getElementById('authModalClose').addEventListener('click', () => {
    closeAuthModal();
  });

  // Click outside modal to close
  document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target.id === 'authModal') {
      closeAuthModal();
    }
  });

  // Auth form submit
  document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleAuthSubmit();
  });

  // Switch between login and signup
  document.getElementById('authSwitchLink').addEventListener('click', (e) => {
    e.preventDefault();
    switchAuthMode();
  });
}

// Open auth modal
function openAuthModal(mode) {
  authMode = mode;
  updateAuthModalUI();
  document.getElementById('authModal').style.display = 'flex';
  document.getElementById('authEmail').focus();
}

// Close auth modal
function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
  document.getElementById('authForm').reset();
  document.getElementById('authError').style.display = 'none';
}

// Update auth modal UI based on mode
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

// Switch between login and signup
function switchAuthMode() {
  authMode = authMode === 'login' ? 'signup' : 'login';
  updateAuthModalUI();
  document.getElementById('authError').style.display = 'none';
}

// Handle auth form submission
async function handleAuthSubmit() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const errorElement = document.getElementById('authError');
  const submitBtn = document.getElementById('authSubmitBtn');

  // Clear previous errors
  errorElement.style.display = 'none';

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = authMode === 'login' ? 'Logging in...' : 'Creating account...';

  try {
    if (authMode === 'login') {
      await authClient.login(email, password);
    } else {
      await authClient.signup(email, password);
    }

    // Success! Close modal and update UI
    closeAuthModal();
    updateAuthUI(true);

    // Load user data from server
    await loadUserDataFromServer();

    // Show success message
    showNotification(`Welcome${authMode === 'signup' ? ' to Cocktail Analyzer' : ' back'}!`, 'success');
  } catch (error) {
    // Show error
    errorElement.textContent = error.message;
    errorElement.style.display = 'block';
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = authMode === 'login' ? 'Login' : 'Create Account';
  }
}

// Handle logout
async function handleLogout() {
  try {
    // Sync data before logging out
    await syncDataToServer();

    // Logout
    await authClient.logout();

    // Update UI
    updateAuthUI(false);

    // Clear app data
    APP.inventoryData = null;
    APP.recipeData = [];
    APP.editableInventory = [];
    APP.favorites = new Set();
    APP.history = {};
    APP.conversationHistory = [];
    APP.allResults = null;

    // Refresh UI
    if (typeof refreshUI === 'function') {
      refreshUI();
    }

    showNotification('Logged out successfully', 'success');
  } catch (error) {
    console.error('Logout error:', error);
    showNotification('Error logging out: ' + error.message, 'error');
  }
}

// Load user data from server
async function loadUserDataFromServer() {
  if (!authClient.isAuthenticated()) {
    return;
  }

  try {
    // Load inventory
    const inventory = await apiClient.getInventory();
    if (inventory && inventory.length > 0) {
      APP.editableInventory = inventory;
      APP.inventoryData = inventory;

      // Update status
      if (elements && elements.inventoryStatus) {
        elements.inventoryStatus.textContent = `✓ Loaded ${inventory.length} items from your account`;
        elements.inventoryStatus.className = 'file-status success';
      }
    }

    // Load recipes
    const recipes = await apiClient.getRecipes();
    if (recipes && recipes.length > 0) {
      APP.recipeData = recipes;

      // Update status
      if (elements && elements.recipeStatus) {
        elements.recipeStatus.textContent = `✓ Loaded ${recipes.length} recipes from your account`;
        elements.recipeStatus.className = 'file-status success';
      }
    }

    // Load favorites
    const favorites = await apiClient.getFavorites();
    if (favorites && favorites.length > 0) {
      APP.favorites = new Set(favorites);
    }

    // Load history
    const history = await apiClient.getHistory();
    if (history) {
      APP.history = history;
    }

    // Enable analyze button if we have data
    if (elements && elements.analyzeBtn && APP.editableInventory.length > 0 && APP.recipeData.length > 0) {
      elements.analyzeBtn.disabled = false;
    }

    // Refresh UI
    if (typeof renderInventoryManager === 'function') {
      renderInventoryManager();
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    showNotification('Error loading your data: ' + error.message, 'error');
  }
}

// Sync data to server
async function syncDataToServer() {
  if (!authClient.isAuthenticated()) {
    return;
  }

  try {
    // Save inventory
    if (APP.editableInventory && APP.editableInventory.length > 0) {
      await apiClient.saveInventory(APP.editableInventory);
    }

    // Save recipes
    if (APP.recipeData && APP.recipeData.length > 0) {
      await apiClient.saveRecipes(APP.recipeData);
    }

    // Save favorites
    if (APP.favorites && APP.favorites.size > 0) {
      await apiClient.saveFavorites(Array.from(APP.favorites));
    }

    // Save history
    if (APP.history && Object.keys(APP.history).length > 0) {
      await apiClient.saveHistory(APP.history);
    }
  } catch (error) {
    console.error('Error syncing data:', error);
    throw error;
  }
}

// Show notification (helper function)
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 16px 24px;
    background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--info)'};
    color: white;
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Auto-sync data periodically (every 30 seconds)
setInterval(async () => {
  if (authClient.isAuthenticated()) {
    try {
      await syncDataToServer();
      console.log('Data auto-synced to server');
    } catch (error) {
      console.error('Auto-sync error:', error);
    }
  }
}, 30000);

// Sync data before page unload
window.addEventListener('beforeunload', async (e) => {
  if (authClient.isAuthenticated()) {
    try {
      await syncDataToServer();
    } catch (error) {
      console.error('Error syncing on unload:', error);
    }
  }
});
