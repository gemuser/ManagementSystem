const express = require('express');
const { getCustomers, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/Dh_fibernetControllers');

const router = express.Router();

router.get('/list', getCustomers);
router.post('/create', createCustomer);
router.put('/update/:id', updateCustomer);
router.delete('/delete/:id', deleteCustomer);

module.exports = router;