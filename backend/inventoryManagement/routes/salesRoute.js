const express = require('express');
const { getSales, createSales, updateSales, deleteSales } = require('../controllers/salesController');
const { authenticateToken } = require('../../auth/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.get('/list', getSales);
router.post('/create', createSales);

module.exports = router;