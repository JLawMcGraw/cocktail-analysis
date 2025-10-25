const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth.cjs');
const { inventoryHelpers } = require('../database.cjs');

router.get('/', authenticateToken, (req, res) => {
  try {
    const result = inventoryHelpers.get(req.user.userId);
    if (!result) {
      return res.json({ inventory: [] });
    }
    const inventory = JSON.parse(result.data);
    res.json({ inventory });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const { inventory } = req.body;
    if (!Array.isArray(inventory)) {
      return res.status(400).json({ error: 'Inventory must be an array' });
    }
    const data = JSON.stringify(inventory);
    inventoryHelpers.save(req.user.userId, data);
    res.json({ message: 'Inventory saved successfully', count: inventory.length });
  } catch (error) {
    console.error('Save inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/', authenticateToken, (req, res) => {
  try {
    inventoryHelpers.save(req.user.userId, JSON.stringify([]));
    res.json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
