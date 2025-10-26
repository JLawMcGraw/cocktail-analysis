/**
 * Inventory API Routes
 * Manage user's bar stock
 */

const express = require('express');
const { authMiddleware } = require('../middleware/auth.cjs');
const {
  getUserInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  deleteAllUserInventory,
  bulkInsertInventory,
} = require('../database/queries.cjs');

const router = express.Router();

// All inventory routes require authentication
router.use(authMiddleware);

/**
 * GET /api/inventory
 * Get user's inventory
 */
router.get('/', async (req, res) => {
  try {
    const inventory = await getUserInventory(req.user.id);
    res.json({ inventory });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get inventory',
    });
  }
});

/**
 * POST /api/inventory
 * Add item to inventory
 */
router.post('/', async (req, res) => {
  try {
    const item = req.body;

    if (!item.name && !item.Name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Item name is required',
      });
    }

    const itemId = await addInventoryItem(req.user.id, item);

    res.status(201).json({
      message: 'Item added to inventory',
      id: itemId,
    });
  } catch (error) {
    console.error('Add inventory item error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add inventory item',
    });
  }
});

/**
 * PUT /api/inventory/:id
 * Update inventory item
 */
router.put('/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const item = req.body;

    if (!item.name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Item name is required',
      });
    }

    await updateInventoryItem(req.user.id, itemId, item);

    res.json({
      message: 'Inventory item updated',
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update inventory item',
    });
  }
});

/**
 * DELETE /api/inventory/:id
 * Delete inventory item
 */
router.delete('/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    await deleteInventoryItem(req.user.id, itemId);

    res.json({
      message: 'Inventory item deleted',
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete inventory item',
    });
  }
});

/**
 * POST /api/inventory/bulk
 * Bulk upload inventory (from CSV)
 */
router.post('/bulk', async (req, res) => {
  try {
    const { items, replace } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Items array is required',
      });
    }

    // If replace flag is true, delete existing inventory first
    if (replace) {
      await deleteAllUserInventory(req.user.id);
    }

    const insertedIds = await bulkInsertInventory(req.user.id, items);

    res.json({
      message: `${insertedIds.length} items added to inventory`,
      count: insertedIds.length,
    });
  } catch (error) {
    console.error('Bulk inventory upload error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to upload inventory',
    });
  }
});

/**
 * DELETE /api/inventory
 * Clear all inventory
 */
router.delete('/', async (req, res) => {
  try {
    await deleteAllUserInventory(req.user.id);

    res.json({
      message: 'All inventory cleared',
    });
  } catch (error) {
    console.error('Clear inventory error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to clear inventory',
    });
  }
});

module.exports = router;
