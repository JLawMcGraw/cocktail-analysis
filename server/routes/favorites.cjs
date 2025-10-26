/**
 * Favorites and History API Routes
 * Manage user's favorites and recipe history
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth.cjs');
const {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  getUserHistory,
  upsertRecipeHistory,
} = require('../database/queries.cjs');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ========== FAVORITES ==========

/**
 * GET /api/favorites
 * Get user's favorite recipes
 */
router.get('/', async (req, res) => {
  try {
    const favorites = await getUserFavorites(req.user.id);
    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get favorites',
    });
  }
});

/**
 * POST /api/favorites
 * Add recipe to favorites
 */
router.post('/', async (req, res) => {
  try {
    const { recipeName } = req.body;

    if (!recipeName) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Recipe name is required',
      });
    }

    await addFavorite(req.user.id, recipeName);

    res.status(201).json({
      message: 'Recipe added to favorites',
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add favorite',
    });
  }
});

/**
 * DELETE /api/favorites/:recipeName
 * Remove recipe from favorites
 */
router.delete('/:recipeName', async (req, res) => {
  try {
    const recipeName = decodeURIComponent(req.params.recipeName);
    await removeFavorite(req.user.id, recipeName);

    res.json({
      message: 'Recipe removed from favorites',
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove favorite',
    });
  }
});

// ========== HISTORY ==========

/**
 * GET /api/history
 * Get user's recipe history
 */
router.get('/history', async (req, res) => {
  try {
    const history = await getUserHistory(req.user.id);
    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get history',
    });
  }
});

/**
 * POST /api/history
 * Update recipe history (mark as made, add rating, notes)
 */
router.post('/history', async (req, res) => {
  try {
    const { recipeName, hasMade, rating, notes } = req.body;

    if (!recipeName) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Recipe name is required',
      });
    }

    const data = {};
    if (hasMade !== undefined) data.has_made = hasMade;
    if (rating !== undefined) data.rating = rating;
    if (notes !== undefined) data.notes = notes;

    await upsertRecipeHistory(req.user.id, recipeName, data);

    res.json({
      message: 'Recipe history updated',
    });
  } catch (error) {
    console.error('Update history error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update history',
    });
  }
});

module.exports = router;
