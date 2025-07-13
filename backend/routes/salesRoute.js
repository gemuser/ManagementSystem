const express = require('express');
const { getSales, createSales, updateSales, deleteSales } = require('../controllers/salesController');
const router = express.Router();


router.get('/list', getSales);
router.post('/create', createSales);

module.exports = router;