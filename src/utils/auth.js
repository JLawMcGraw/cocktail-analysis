/**
 * Authentication Utility
 * Manages JWT tokens and user session
 */

const TOKEN_KEY = 'cocktail_auth_token';
const USER_KEY = 'cocktail_user';

/**
 * Save auth token to localStorage
 */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get auth token from localStorage
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove auth token from localStorage
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Save user data to localStorage
 */
export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get user data from localStorage
 */
export function getUser() {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
}

/**
 * Remove user data from localStorage
 */
export function removeUser() {
  localStorage.removeItem(USER_KEY);
}

/**
 * Clear all auth data
 */
export function clearAuth() {
  removeToken();
  removeUser();
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
