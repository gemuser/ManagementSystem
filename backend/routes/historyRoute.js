const express = require('express');
const { getActivityHistory, getActivityStats } = require('../controllers/historyController');

const router = express.Router();

// Get activity history with filters
router.get('/activities', getActivityHistory);

// Get activity statistics
router.get('/stats', getActivityStats);

module.exports = router;
