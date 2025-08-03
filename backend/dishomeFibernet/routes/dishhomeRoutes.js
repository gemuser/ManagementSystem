const express = require('express');
const { getCustomers, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/dishhomeControllers');
const { authenticateToken } = require('../../auth/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.get('/list', getCustomers);
router.post('/create', createCustomer);
router.put('/update/:id', updateCustomer);
router.delete('/delete/:id', deleteCustomer);

module.exports = router;