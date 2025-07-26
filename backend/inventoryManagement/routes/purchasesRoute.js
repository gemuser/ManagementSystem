const express = require('express');
const router = express.Router();
const {
  getAllPurchases,
  addPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseById,
  generateInvoiceNumber
} = require('../controllers/purchasesController');

// GET /purchases/list - Get all purchases
router.get('/list', getAllPurchases);

// GET /purchases/generate-invoice - Generate next invoice number
router.get('/generate-invoice', generateInvoiceNumber);

// GET /purchases/:id - Get purchase by ID
router.get('/:id', getPurchaseById);

// POST /purchases/add - Add new purchase
router.post('/add', addPurchase);

// PUT /purchases/:id - Update purchase
router.put('/:id', updatePurchase);

// DELETE /purchases/:id - Delete purchase
router.delete('/:id', deletePurchase);

module.exports = router;
