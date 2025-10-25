const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth.cjs');
const { favoritesHelpers, historyHelpers } = require('../database.cjs');

router.get('/favorites', authenticateToken, (req, res) => {
  try {
    const result = favoritesHelpers.get(req.user.userId);
    if (!result) {
      return res.json({ favorites: [] });
    }
    const favorites = JSON.parse(result.data);
    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/favorites', authenticateToken, (req, res) => {
  try {
    const { favorites } = req.body;
    if (!Array.isArray(favorites)) {
      return res.status(400).json({ error: 'Favorites must be an array' });
    }
    const data = JSON.stringify(favorites);
    favoritesHelpers.save(req.user.userId, data);
    res.json({ message: 'Favorites saved successfully', count: favorites.length });
  } catch (error) {
    console.error('Save favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', authenticateToken, (req, res) => {
  try {
    const result = historyHelpers.get(req.user.userId);
    if (!result) {
      return res.json({ history: {} });
    }
    const history = JSON.parse(result.data);
    res.json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/history', authenticateToken, (req, res) => {
  try {
    const { history } = req.body;
    if (typeof history !== 'object' || Array.isArray(history)) {
      return res.status(400).json({ error: 'History must be an object' });
    }
    const data = JSON.stringify(history);
    historyHelpers.save(req.user.userId, data);
    res.json({ message: 'History saved successfully' });
  } catch (error) {
    console.error('Save history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
