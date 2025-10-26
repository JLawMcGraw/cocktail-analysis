/**
 * Authentication Pages
 * Login and Signup using the existing modal
 */

import { login, signup } from '../services/api.js';

/**
 * Show login in existing modal
 */
export function showLoginModal(onSuccess) {
  const modal = document.getElementById('authModal');
  const form = document.getElementById('authForm');
  const title = document.getElementById('authModalTitle');
  const submitBtn = document.getElementById('authSubmitBtn');
  const switchText = document.getElementById('authSwitchText');
  const switchLink = document.getElementById('authSwitchLink');
  const errorDiv = document.getElementById('authError');
  const emailInput = document.getElementById('authEmail');
  const passwordInput = document.getElementById('authPassword');

  // Set up for login
  title.textContent = 'Login';
  submitBtn.textContent = 'Login';
  switchText.textContent = "Don't have an account?";
  switchLink.textContent = 'Sign up';
  errorDiv.style.display = 'none';
  form.reset();

  // Show modal
  modal.style.display = 'flex';

  // Handle form submit
  form.onsubmit = async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    errorDiv.style.display = 'none';

    try {
      await login(email, password);
      modal.style.display = 'none';
      if (onSuccess) onSuccess();
    } catch (error) {
      errorDiv.textContent = error.message || 'Login failed. Please check your credentials.';
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  };

  // Handle switch to signup
  switchLink.onclick = (e) => {
    e.preventDefault();
    showSignupModal(onSuccess);
  };

  // Close modal
  document.getElementById('authModalClose').onclick = () => {
    modal.style.display = 'none';
  };
}

/**
 * Show signup in existing modal
 */
export function showSignupModal(onSuccess) {
  const modal = document.getElementById('authModal');
  const form = document.getElementById('authForm');
  const title = document.getElementById('authModalTitle');
  const submitBtn = document.getElementById('authSubmitBtn');
  const switchText = document.getElementById('authSwitchText');
  const switchLink = document.getElementById('authSwitchLink');
  const errorDiv = document.getElementById('authError');
  const emailInput = document.getElementById('authEmail');
  const passwordInput = document.getElementById('authPassword');

  // Set up for signup
  title.textContent = 'Create Account';
  submitBtn.textContent = 'Sign Up';
  switchText.textContent = 'Already have an account?';
  switchLink.textContent = 'Login';
  errorDiv.style.display = 'none';
  form.reset();

  // Show modal
  modal.style.display = 'flex';

  // Handle form submit
  form.onsubmit = async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    errorDiv.style.display = 'none';

    try {
      await signup(email, password, null);
      modal.style.display = 'none';
      if (onSuccess) onSuccess();
    } catch (error) {
      errorDiv.textContent = error.message || 'Signup failed. Please try again.';
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up';
    }
  };

  // Handle switch to login
  switchLink.onclick = (e) => {
    e.preventDefault();
    showLoginModal(onSuccess);
  };

  // Close modal
  document.getElementById('authModalClose').onclick = () => {
    modal.style.display = 'none';
  };
}
