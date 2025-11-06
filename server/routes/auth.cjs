/**
 * Authentication Routes
 * /auth/signup, /auth/login, /auth/me
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { createUser, findUserByEmail, verifyPassword, findUserById } = require('../database/queries.cjs');
const { generateToken, authMiddleware } = require('../middleware/auth.cjs');

const router = express.Router();

// Rate limiter for authentication endpoints
// Prevents brute force attacks and credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      retryAfter: '15 minutes',
    });
  },
});

// Stricter rate limiter for failed login attempts
// More aggressive to prevent password guessing
const strictAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    error: 'Too Many Failed Attempts',
    message: 'Too many failed login attempts. Please try again after 1 hour.',
  },
});

/**
 * POST /auth/signup
 * Create a new user account
 */
router.post(
  '/signup',
  authLimiter, // Apply rate limiting
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
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
  authLimiter, // Apply rate limiting
  strictAuthLimiter, // Additional strict rate limiting for failed attempts
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
