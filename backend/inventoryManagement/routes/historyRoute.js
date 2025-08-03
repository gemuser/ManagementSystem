const express = require('express');
const { getActivityHistory, getActivityStats } = require('../controllers/historyController');
const { authenticateToken } = require('../../auth/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get activity history with filters
router.get('/activities', getActivityHistory);

// Get activity statistics
router.get('/stats', getActivityStats);

module.exports = router;
