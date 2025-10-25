const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth');
const { recipesHelpers } = require('../database');

// Get user's recipes
router.get('/', authenticateToken, (req, res) => {
  try {
    const result = recipesHelpers.get(req.user.userId);

    if (!result) {
      return res.json({ recipes: [] });
    }

    const recipes = JSON.parse(result.data);
    res.json({ recipes });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save user's recipes
router.post('/', authenticateToken, (req, res) => {
  try {
    const { recipes } = req.body;

    if (!Array.isArray(recipes)) {
      return res.status(400).json({ error: 'Recipes must be an array' });
    }

    // Store recipes as JSON string
    const data = JSON.stringify(recipes);
    recipesHelpers.save(req.user.userId, data);

    res.json({
      message: 'Recipes saved successfully',
      count: recipes.length
    });
  } catch (error) {
    console.error('Save recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user's recipes
router.delete('/', authenticateToken, (req, res) => {
  try {
    recipesHelpers.save(req.user.userId, JSON.stringify([]));
    res.json({ message: 'Recipes deleted successfully' });
  } catch (error) {
    console.error('Delete recipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
