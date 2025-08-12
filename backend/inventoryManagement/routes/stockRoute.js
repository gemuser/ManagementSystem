const express = require('express');
const { getStockChanges, createStockAdjustment, updateStock } = require('../controllers/stockController');

const router = express.Router();

// Get all stock changes
router.get('/changes', getStockChanges);

// Create stock adjustment
router.post('/adjust', createStockAdjustment);

// Update stock (add/remove)
router.post('/update', updateStock);

module.exports = router;
