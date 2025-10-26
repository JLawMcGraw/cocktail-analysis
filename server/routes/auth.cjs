/**
 * Authentication Routes
 * /auth/signup, /auth/login, /auth/me
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { createUser, findUserByEmail, verifyPassword, findUserById } = require('../database/queries.cjs');
const { generateToken, authMiddleware } = require('../middleware/auth.cjs');

const router = express.Router();

/**
 * POST /auth/signup
 * Create a new user account
 */
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').optional().trim(),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array(),
        });
      }

      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'An account with this email already exists',
        });
      }

      // Create user
      const userId = await createUser(email, password, name);
      const user = await findUserById(userId);

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: 'Account created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create account',
      });
    }
  }
);

/**
 * POST /auth/login
 * Login with email and password
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Verify credentials
      const user = await verifyPassword(email, password);

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Login failed',
      });
    }
  }
);

/**
 * GET /auth/me
 * Get current user profile (protected route)
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        created_at: req.user.created_at,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get user profile',
    });
  }
});

/**
 * POST /auth/logout
 * Logout (client-side token removal, server just acknowledges)
 */
router.post('/logout', authMiddleware, async (req, res) => {
  res.json({
    message: 'Logout successful',
  });
});

module.exports = router;
