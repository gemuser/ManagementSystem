const db = require('../../database/db');
const { generateVATBillBuffer } = require('../../inventoryManagement/generateVATBillMemory');

// ===================== GENERATE DISHHOME INVOICE =====================
const generateDishhomeInvoice = async (req, res) => {
    try {
        const { 
            customerId, 
            monthsBilled = 1, 
            discountPercentage = 0, 
            discountAmount = 0,
            paymentMethod = null,
            notes = '',
            dueDate = null
        } = req.body;

        if (!customerId) {
            return res.status(400).send({
                success: false,
                message: 'Customer ID is required'
            });
        }

        // Get customer details
        const customerQuery = 'SELECT * FROM dishhome WHERE customerId = ?';
        const customerResult = await db.query(customerQuery, [customerId]);
        
        if (!customerResult[0] || customerResult[0].length === 0) {
            return res.status(404).send({
                success: false,
                message: 'Customer not found'
            });
        }

        const customer = customerResult[0][0];
        
        // Generate invoice number
        const invoiceNumber = `DH-${Date.now()}-${customerId}`;
        
        // Calculate billing period
        const billingStart = new Date();
        const billingEnd = new Date();
        billingEnd.setMonth(billingEnd.getMonth() + monthsBilled);
        
        // Calculate amounts
        const packagePrice = parseFloat(customer.price);
        const subtotal = packagePrice * monthsBilled;
        const discountAmountCalculated = discountPercentage > 0 
            ? (subtotal * discountPercentage / 100) 
            : (discountAmount || 0);
        const totalAmount = subtotal - discountAmountCalculated;
        
        // Set due date (default 30 days from invoice date)
        const invoiceDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Insert invoice into database (try-catch for database errors)
        try {
            const insertQuery = `
                INSERT INTO dishhome_invoices 
                (invoice_number, customer_id, customer_name, customer_phone, customer_address, 
                 service_package, billing_period_start, billing_period_end, months_billed, 
                 package_price, discount_amount, discount_percentage, subtotal, total_amount, 
                 due_date, cas_id, notes, payment_method) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const invoiceValues = [
                invoiceNumber,
                customer.customerId,
                customer.name,
                customer.phoneNumber,
                customer.address,
                customer.package,
                billingStart.toISOString().split('T')[0],
                billingEnd.toISOString().split('T')[0],
                monthsBilled,
                packagePrice,
                discountAmountCalculated,
                discountPercentage,
                subtotal,
                totalAmount,
                invoiceDueDate.toISOString().split('T')[0],
                customer.casId || null,
                notes,
                paymentMethod
            ];

            const result = await db.query(insertQuery, invoiceValues);
            const invoiceId = result[0].insertId;
        } catch (dbError) {
            console.error('Database error (tables might not exist):', dbError);
            // Continue without database insertion for now
        }

        // Prepare invoice data for PDF generation using VAT bill format
        const invoiceData = {
            customerName: customer.name,
            invoiceNumber: invoiceNumber,
            invoiceDate: new Date().toLocaleDateString(),
            items: [{
                name: `${customer.package} - ${monthsBilled} month(s)`,
                quantity: monthsBilled,
                price: packagePrice,
                total: subtotal
            }],
            subtotal: subtotal,
            discountAmount: discountAmountCalculated,
            discountPercentage: discountPercentage,
            grandTotal: totalAmount,
            dueDate: invoiceDueDate.toLocaleDateString(),
            notes: notes,
            serviceType: 'DishHome TV Service',
            customerPhone: customer.phoneNumber,
            customerAddress: customer.address,
            casId: customer.casId || 'N/A'
        };

        // Generate PDF using VAT bill logic
        const pdfBuffer = await generateVATBillBuffer(invoiceData, {
            title: 'DishHome Invoice',
            serviceBased: true
        });

        // Convert buffer to base64 for frontend
        const pdfBase64 = pdfBuffer.toString('base64');

        res.status(200).send({
            success: true,
            message: 'Invoice generated successfully',
            pdf: pdfBase64,
            data: {
                invoiceNumber,
                totalAmount: totalAmount.toFixed(2),
                dueDate: invoiceDueDate.toISOString().split('T')[0]
            }
        });

    } catch (error) {
        console.error('Error generating DishHome invoice:', error);
        res.status(500).send({
            success: false,
            message: 'Failed to generate invoice',
            error: error.message
        });
    }
};

// ===================== GENERATE FIBERNET INVOICE =====================
const generateFibernetInvoice = async (req, res) => {
    try {
        const { 
            customerId, 
            monthsBilled = 1, 
            discountPercentage = 0, 
            discountAmount = 0,
            paymentMethod = null,
            notes = '',
            dueDate = null
        } = req.body;

        if (!customerId) {
            return res.status(400).send({
                success: false,
                message: 'Customer ID is required'
            });
        }

        // Get customer details
        const customerQuery = 'SELECT * FROM fibernet WHERE customerId = ?';
        const customerResult = await db.query(customerQuery, [customerId]);
        
        if (!customerResult[0] || customerResult[0].length === 0) {
            return res.status(404).send({
                success: false,
                message: 'Customer not found'
            });
        }

        const customer = customerResult[0][0];
        
        // Generate invoice number
        const invoiceNumber = `FN-${Date.now()}-${customerId}`;
        
        // Calculate billing period
        const billingStart = new Date();
        const billingEnd = new Date();
        billingEnd.setMonth(billingEnd.getMonth() + monthsBilled);
        
        // Calculate amounts
        const packagePrice = parseFloat(customer.price);
        const subtotal = packagePrice * monthsBilled;
        const discountAmountCalculated = discountPercentage > 0 
            ? (subtotal * discountPercentage / 100) 
            : (discountAmount || 0);
        const totalAmount = subtotal - discountAmountCalculated;
        
        // Set due date (default 30 days from invoice date)
        const invoiceDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Insert invoice into database (try-catch for database errors)
        try {
            const insertQuery = `
                INSERT INTO fibernet_invoices 
                (invoice_number, customer_id, customer_name, customer_phone, customer_address, 
                 service_package, billing_period_start, billing_period_end, months_billed, 
                 package_price, discount_amount, discount_percentage, subtotal, total_amount, 
                 due_date, notes, payment_method) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const invoiceValues = [
                invoiceNumber,
                customer.customerId,
                customer.name,
                customer.phoneNumber,
                customer.address,
                customer.package,
                billingStart.toISOString().split('T')[0],
                billingEnd.toISOString().split('T')[0],
                monthsBilled,
                packagePrice,
                discountAmountCalculated,
                discountPercentage,
                subtotal,
                totalAmount,
                invoiceDueDate.toISOString().split('T')[0],
                notes,
                paymentMethod
            ];

            const result = await db.query(insertQuery, invoiceValues);
            const invoiceId = result[0].insertId;
        } catch (dbError) {
            console.error('Database error (tables might not exist):', dbError);
            // Continue without database insertion for now
        }

        // Prepare invoice data for PDF generation using VAT bill format
        const invoiceData = {
            customerName: customer.name,
            invoiceNumber: invoiceNumber,
            invoiceDate: new Date().toLocaleDateString(),
            items: [{
                name: `${customer.package} - ${monthsBilled} month(s)`,
                quantity: monthsBilled,
                price: packagePrice,
                total: subtotal
            }],
            subtotal: subtotal,
            discountAmount: discountAmountCalculated,
            discountPercentage: discountPercentage,
            grandTotal: totalAmount,
            dueDate: invoiceDueDate.toLocaleDateString(),
            notes: notes,
            serviceType: 'Fibernet Internet Service',
            customerPhone: customer.phoneNumber,
            customerAddress: customer.address
        };

        // Generate PDF using VAT bill logic
        const pdfBuffer = await generateVATBillBuffer(invoiceData, {
            title: 'Fibernet Invoice',
            serviceBased: true
        });

        // Convert buffer to base64 for frontend
        const pdfBase64 = pdfBuffer.toString('base64');

        res.status(200).send({
            success: true,
            message: 'Invoice generated successfully',
            pdf: pdfBase64,
            data: {
                invoiceNumber,
                totalAmount: totalAmount.toFixed(2),
                dueDate: invoiceDueDate.toISOString().split('T')[0]
            }
        });

    } catch (error) {
        console.error('Error generating Fibernet invoice:', error);
        res.status(500).send({
            success: false,
            message: 'Failed to generate invoice',
            error: error.message
        });
    }
};

// ===================== GET DISHHOME INVOICES =====================
const getDishhomeInvoices = async (req, res) => {
    try {
        const query = 'SELECT * FROM dishhome_invoices ORDER BY created_at DESC';
        const result = await db.query(query);
        
        res.status(200).send({
            success: true,
            data: result[0] || []
        });
    } catch (error) {
        console.error('Error fetching DishHome invoices:', error);
        res.status(500).send({
            success: false,
            message: 'Failed to fetch invoices',
            error: error.message
        });
    }
};

// ===================== GET FIBERNET INVOICES =====================
const getFibernetInvoices = async (req, res) => {
    try {
        const query = 'SELECT * FROM fibernet_invoices ORDER BY created_at DESC';
        const result = await db.query(query);
        
        res.status(200).send({
            success: true,
            data: result[0] || []
        });
    } catch (error) {
        console.error('Error fetching Fibernet invoices:', error);
        res.status(500).send({
            success: false,
            message: 'Failed to fetch invoices',
            error: error.message
        });
    }
};

// ===================== UPDATE PAYMENT STATUS =====================
const updatePaymentStatus = async (req, res) => {
    try {
        const { invoiceType, invoiceId } = req.params;
        const { paymentStatus, paymentMethod, paymentDate } = req.body;

        if (!['dishhome', 'fibernet'].includes(invoiceType)) {
            return res.status(400).send({
                success: false,
                message: 'Invalid invoice type'
            });
        }

        const tableName = `${invoiceType}_invoices`;
        const query = `
            UPDATE ${tableName} 
            SET payment_status = ?, payment_method = ?, payment_date = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE invoice_id = ?
        `;
        
        await db.query(query, [paymentStatus, paymentMethod, paymentDate, invoiceId]);
        
        res.status(200).send({
            success: true,
            message: 'Payment status updated successfully'
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).send({
            success: false,
            message: 'Failed to update payment status',
            error: error.message
        });
    }
};

module.exports = {
    generateDishhomeInvoice,
    generateFibernetInvoice,
    getDishhomeInvoices,
    getFibernetInvoices,
    updatePaymentStatus
};