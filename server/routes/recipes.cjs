/**
 * Recipes API Routes
 * Manage user's recipe collection
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth.cjs');
const {
  getUserRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  deleteAllUserRecipes,
  bulkInsertRecipes,
} = require('../database/queries.cjs');

const router = express.Router();

// All recipe routes require authentication
router.use(authMiddleware);

/**
 * GET /api/recipes
 * Get user's recipes
 */
router.get('/', async (req, res) => {
  try {
    const recipes = await getUserRecipes(req.user.id);
    res.json({ recipes });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get recipes',
    });
  }
});

/**
 * POST /api/recipes
 * Add recipe
 */
router.post('/', async (req, res) => {
  try {
    const recipe = req.body;

    if (!recipe.name && !recipe.Name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Recipe name is required',
      });
    }

    if (!recipe.ingredients && !recipe.Ingredients) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Recipe ingredients are required',
      });
    }

    const recipeId = await addRecipe(req.user.id, recipe);

    res.status(201).json({
      message: 'Recipe added',
      id: recipeId,
    });
  } catch (error) {
    console.error('Add recipe error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add recipe',
    });
  }
});

/**
 * PUT /api/recipes/:id
 * Update recipe
 */
router.put('/:id', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const recipe = req.body;

    if (!recipe.name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Recipe name is required',
      });
    }

    await updateRecipe(req.user.id, recipeId, recipe);

    res.json({
      message: 'Recipe updated',
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update recipe',
    });
  }
});

/**
 * DELETE /api/recipes/:id
 * Delete recipe
 */
router.delete('/:id', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    await deleteRecipe(req.user.id, recipeId);

    res.json({
      message: 'Recipe deleted',
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete recipe',
    });
  }
});

/**
 * POST /api/recipes/bulk
 * Bulk upload recipes (from CSV)
 */
router.post('/bulk', async (req, res) => {
  try {
    const { recipes, replace } = req.body;

    if (!Array.isArray(recipes) || recipes.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Recipes array is required',
      });
    }

    // If replace flag is true, delete existing recipes first
    if (replace) {
      await deleteAllUserRecipes(req.user.id);
    }

    const insertedIds = await bulkInsertRecipes(req.user.id, recipes);

    res.json({
      message: `${insertedIds.length} recipes added`,
      count: insertedIds.length,
    });
  } catch (error) {
    console.error('Bulk recipes upload error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to upload recipes',
    });
  }
});

/**
 * DELETE /api/recipes
 * Clear all recipes
 */
router.delete('/', async (req, res) => {
  try {
    await deleteAllUserRecipes(req.user.id);

    res.json({
      message: 'All recipes cleared',
    });
  } catch (error) {
    console.error('Clear recipes error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to clear recipes',
    });
  }
});

module.exports = router;
