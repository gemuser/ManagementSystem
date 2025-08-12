const express = require('express');
const router = express.Router();
const {
    generateDishhomeInvoice,
    generateFibernetInvoice,
    getDishhomeInvoices,
    getFibernetInvoices,
    updatePaymentStatus
} = require('../controllers/invoiceControllers');

// ===================== DISHHOME INVOICE ROUTES =====================
// Generate DishHome invoice
router.post('/dishhome/generate', generateDishhomeInvoice);

// Get DishHome invoices
router.get('/dishhome', getDishhomeInvoices);

// ===================== FIBERNET INVOICE ROUTES =====================
// Generate Fibernet invoice
router.post('/fibernet/generate', generateFibernetInvoice);

// Get Fibernet invoices
router.get('/fibernet', getFibernetInvoices);

// ===================== COMMON INVOICE ROUTES =====================
// Update payment status for any invoice type
router.patch('/:invoiceType/:invoiceId/payment', updatePaymentStatus);

// Get single invoice by type and ID
router.get('/:invoiceType/:invoiceId', async (req, res) => {
    try {
        const { invoiceType, invoiceId } = req.params;
        
        if (!['dishhome', 'fibernet'].includes(invoiceType)) {
            return res.status(400).send({
                success: false,
                message: 'Invalid invoice type'
            });
        }

        const db = require('../../database/db');
        const tableName = `${invoiceType}_invoices`;
        const query = `SELECT * FROM ${tableName} WHERE invoice_id = ?`;
        
        const result = await db.query(query, [invoiceId]);
        
        if (!result[0] || result[0].length === 0) {
            return res.status(404).send({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Invoice retrieved successfully',
            data: result[0][0]
        });

    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).send({
            success: false,
            message: 'Error fetching invoice',
            error: error.message
        });
    }
});

// Get invoice statistics
router.get('/stats/:invoiceType', async (req, res) => {
    try {
        const { invoiceType } = req.params;
        
        if (!['dishhome', 'fibernet'].includes(invoiceType)) {
            return res.status(400).send({
                success: false,
                message: 'Invalid invoice type'
            });
        }

        const db = require('../../database/db');
        const tableName = `${invoiceType}_invoices`;
        
        const statsQuery = `
            SELECT 
                COUNT(*) as total_invoices,
                SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_invoices,
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
                SUM(CASE WHEN payment_status = 'overdue' THEN 1 ELSE 0 END) as overdue_invoices,
                SUM(total_amount) as total_revenue,
                SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as collected_revenue,
                SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_revenue
            FROM ${tableName}
        `;

        const result = await db.query(statsQuery);
        
        res.status(200).send({
            success: true,
            message: 'Invoice statistics retrieved successfully',
            data: result[0][0]
        });

    } catch (error) {
        console.error('Error fetching invoice statistics:', error);
        res.status(500).send({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

module.exports = router;
