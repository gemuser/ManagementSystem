const express = require('express');
const { authenticateToken } = require('../../auth/authMiddleware');
const {
  generateVATBillForSale,
  generateCustomVATBill,
  generateVATBillMemory,
  listGeneratedBills,
  downloadVATBill
} = require('../controllers/vatBillController');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route POST /api/vat-bill/generate-for-sale
 * @desc Generate VAT bill for a sale transaction
 * @body {string} customerName - Customer name
 * @body {string} itemName - Product/item name
 * @body {number} price - Unit price
 * @body {number} quantity - Quantity (optional, default: 1)
 * @body {number} vatRate - VAT rate percentage (optional, default: 13)
 */
router.post('/generate-for-sale', generateVATBillForSale);

/**
 * @route POST /api/vat-bill/generate-custom
 * @desc Generate VAT bill with custom data
 * @body {string} customerName - Customer name
 * @body {string} invoiceDate - Invoice date (optional)
 * @body {string} itemName - Item name (optional)
 * @body {string} price - Price string (optional)
 * @body {string} vat - VAT amount string (optional)
 * @body {string} total - Total amount string (optional)
 */
router.post('/generate-custom', generateCustomVATBill);

/**
 * @route POST /api/vat-bill/generate-memory
 * @desc Generate VAT bill for multiple items in memory
 * @body {string} customerName - Customer name
 * @body {string} invoiceNumber - Invoice number
 * @body {string} invoiceDate - Invoice date
 * @body {Array} items - Array of items with productName, quantity, price, total
 * @body {number} subtotal - Subtotal amount
 * @body {number} vatRate - VAT rate percentage
 * @body {number} vatAmount - VAT amount
 * @body {number} grandTotal - Grand total amount
 */
router.post('/generate-memory', generateVATBillMemory);

/**
 * @route GET /api/vat-bill/list
 * @desc Get list of all generated VAT bills
 */
router.get('/list', listGeneratedBills);

/**
 * @route GET /api/vat-bill/download/:filename
 * @desc Download a specific VAT bill PDF
 * @param {string} filename - Name of the PDF file
 */
router.get('/download/:filename', downloadVATBill);

module.exports = router;
