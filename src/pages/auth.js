/**
 * Authentication Pages
 * Login and Signup forms
 */

import { login, signup } from '../services/api.js';
import { escapeHtml } from '../utils/formatters.js';

/**
 * Show login page
 */
export function showLoginPage(onSuccess) {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">🍹</div>
        <h1 class="auth-title">Cocktail Analyzer</h1>
        <p class="auth-subtitle">Login to access your bar</p>

        <form id="loginForm" class="auth-form">
          <div class="form-group">
            <label for="loginEmail">Email</label>
            <input
              type="email"
              id="loginEmail"
              name="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div class="form-group">
            <label for="loginPassword">Password</label>
            <input
              type="password"
              id="loginPassword"
              name="password"
              required
              autocomplete="current-password"
              placeholder="Enter your password"
            />
          </div>

          <div id="loginError" class="error-message" style="display: none;"></div>

          <button type="submit" class="auth-btn" id="loginBtn">
            Login
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a href="#" id="showSignupLink">Sign up</a></p>
        </div>
      </div>
    </div>
  `;

  // Handle login form submission
  const form = document.getElementById('loginForm');
  const errorDiv = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Disable button and show loading
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    errorDiv.style.display = 'none';

    try {
      await login(email, password);

      // Success! Call the callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      errorDiv.textContent = error.message || 'Login failed. Please check your credentials.';
      errorDiv.style.display = 'block';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Login';
    }
  });

  // Handle "show signup" link
  document.getElementById('showSignupLink').addEventListener('click', (e) => {
    e.preventDefault();
    showSignupPage(onSuccess);
  });
}

/**
 * Show signup page
 */
export function showSignupPage(onSuccess) {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">🍹</div>
        <h1 class="auth-title">Cocktail Analyzer</h1>
        <p class="auth-subtitle">Create your account</p>

        <form id="signupForm" class="auth-form">
          <div class="form-group">
            <label for="signupName">Name (optional)</label>
            <input
              type="text"
              id="signupName"
              name="name"
              autocomplete="name"
              placeholder="Your name"
            />
          </div>

          <div class="form-group">
            <label for="signupEmail">Email</label>
            <input
              type="email"
              id="signupEmail"
              name="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div class="form-group">
            <label for="signupPassword">Password</label>
            <input
              type="password"
              id="signupPassword"
              name="password"
              required
              autocomplete="new-password"
              minlength="6"
              placeholder="At least 6 characters"
            />
            <small class="form-hint">Minimum 6 characters</small>
          </div>

          <div class="form-group">
            <label for="signupPasswordConfirm">Confirm Password</label>
            <input
              type="password"
              id="signupPasswordConfirm"
              name="passwordConfirm"
              required
              autocomplete="new-password"
              placeholder="Re-enter your password"
            />
          </div>

          <div id="signupError" class="error-message" style="display: none;"></div>

          <button type="submit" class="auth-btn" id="signupBtn">
            Create Account
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a href="#" id="showLoginLink">Login</a></p>
        </div>
      </div>
    </div>
  `;

  // Handle signup form submission
  const form = document.getElementById('signupForm');
  const errorDiv = document.getElementById('signupError');
  const signupBtn = document.getElementById('signupBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

    // Validate passwords match
    if (password !== passwordConfirm) {
      errorDiv.textContent = 'Passwords do not match';
      errorDiv.style.display = 'block';
      return;
    }

    // Disable button and show loading
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating account...';
    errorDiv.style.display = 'none';

    try {
      await signup(email, password, name || null);

      // Success! Call the callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      errorDiv.textContent = error.message || 'Signup failed. Please try again.';
      errorDiv.style.display = 'block';
      signupBtn.disabled = false;
      signupBtn.textContent = 'Create Account';
    }
  });

  // Handle "show login" link
  document.getElementById('showLoginLink').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginPage(onSuccess);
  });
}
