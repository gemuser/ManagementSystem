const express = require('express');
const { getProducts, createProducts, updateProducts, deleteProducts } = require('../controllers/productsController');
const { authenticateToken } = require('../../auth/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.get('/list', getProducts);
router.post('/create', createProducts);
router.put('/update/:id', updateProducts);
router.delete('/delete/:id', deleteProducts);

module.exports = router;