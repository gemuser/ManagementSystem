const express = require('express');
const { getCustomers, getCustomersWithDetails, createCustomer, updateCustomer, deleteCustomer, generateComboBill } = require('../controllers/Dh_fibernetControllers');
const { authenticateToken } = require('../../auth/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.get('/list', getCustomers);
router.get('/list-with-details', getCustomersWithDetails);
router.post('/create', createCustomer);
router.put('/update/:id', updateCustomer);
router.delete('/delete/:id', deleteCustomer);
router.post('/generate-bill/:comboId', generateComboBill);

module.exports = router;