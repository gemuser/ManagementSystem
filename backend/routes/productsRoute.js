const express = require('express');
const { getProducts, createProducts, updateProducts, deleteProducts } = require('../controllers/productsController');
const router = express.Router();

router.get('/list', getProducts);
router.post('/create', createProducts);
router.put('/update/:id', updateProducts);
router.delete('/delete/:id', deleteProducts);

module.exports = router;