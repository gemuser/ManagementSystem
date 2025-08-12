const db = require('../../database/db');

// ===================== GET CUSTOMERS =====================
const getCustomers = async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM fibernet');
        res.status(200).send({
            success: true,
            message: data[0].length > 0 ? 'Customers retrieved successfully' : 'No customers found',
            data: data[0] || []
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: "Error in getting customer",
            err: err.message
        });
    }
};

// ===================== CREATE CUSTOMER =====================
const createCustomer = async (req, res) => {
    try {
        const { customerId, name, phoneNumber, status, package: packageType, address, price, month } = req.body;

        if (!customerId || !name || !phoneNumber || status === undefined || !packageType || !address || !price || !month) {
            return res.status(400).send({
                success: false,
                message: 'Please provide all required fields: customerId, name, phoneNumber, status, package, address, price, month',
            });
        }

        // Validate price field
        if (isNaN(parseFloat(price))) {
            return res.status(400).send({
                success: false,
                message: 'Price must be a valid number',
            });
        }

        // Validate customerId (allow alphanumeric, no need for numeric validation)
        if (!customerId.toString().trim()) {
            return res.status(400).send({
                success: false,
                message: 'Customer ID cannot be empty',
            });
        }

        // Check if customerId already exists
        const existingCustomer = await db.query('SELECT customerId FROM fibernet WHERE customerId = ?', [customerId]);
        if (existingCustomer[0].length > 0) {
            return res.status(400).send({
                success: false,
                message: 'Customer ID already exists. Please choose a different ID.',
            });
        }

        await db.query(
            'INSERT INTO fibernet (customerId, name, phoneNumber, status, package, address, price, month, category) VALUES (?,?,?,?,?,?,?,?,?)',
            [customerId, name, phoneNumber, status, packageType, address, price, month, 'fibernet']
        );

        res.status(201).send({
            success: true,
            message: 'Customer created successfully',
        });
    } catch (err) {
        console.log('Error creating customer:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).send({
                success: false,
                message: 'Customer ID already exists. Please choose a different ID.',
            });
        }
        res.status(500).send({
            success: false,
            message: 'Error in creating customer',
            err: err.message
        });
    }
};

// ===================== UPDATE CUSTOMER =====================
const updateCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, phoneNumber, status, package: packageType, address, price, month } = req.body;

        if (!name || !phoneNumber || status === undefined || !packageType || !address || !price || !month) {
            return res.status(400).send({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        const data = await db.query(
            'UPDATE fibernet SET name = ?, phoneNumber = ?, status = ?, package = ?, address = ?, price = ?, month = ? WHERE customerId = ?',
            [name, phoneNumber, status, packageType, address, price, month, id]
        );

        if (data[0].affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Customer updated successfully'
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: 'Error in updating customer',
            err: err.message
        });
    }
};

// ===================== DELETE CUSTOMER =====================
const deleteCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await db.query('DELETE FROM fibernet WHERE customerId = ?', [id]);

        if (data[0].affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: 'Error in deleting customer',
            err: err.message
        });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
