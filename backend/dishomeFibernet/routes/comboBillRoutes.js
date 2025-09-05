const express = require('express');
const router = express.Router();
const { generateComboBill, generateCustomComboBill } = require('../controllers/comboBillController');
const { authenticateToken } = require('../../auth/authMiddleware');

// Generate bill for existing combo customer
router.get('/generate/:comboId', authenticateToken, generateComboBill);

// Generate custom combo bill
router.post('/generate-custom', authenticateToken, generateCustomComboBill);

module.exports = router;
