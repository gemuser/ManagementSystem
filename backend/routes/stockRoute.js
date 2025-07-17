const express = require('express');
const { getStockChanges, createStockAdjustment } = require('../controllers/stockController');

const router = express.Router();

// Get all stock changes
router.get('/changes', getStockChanges);

// Create stock adjustment
router.post('/adjust', createStockAdjustment);

module.exports = router;
