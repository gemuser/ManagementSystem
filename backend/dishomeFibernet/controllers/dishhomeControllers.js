const db = require('../../database/db');

// ===================== GET CUSTOMERS =====================
const getCustomers = async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM dishhome');
        if (!data || data[0].length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No customer found'
            });
        }
        res.status(200).send({
            success: true,
            message: 'Customers retrieved successfully',
            data: data[0]
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
        const { name, phoneNumber, status, package: packageType, address, price, month } = req.body;

        if (!name || !phoneNumber || !status || !packageType || !address || !price || !month) {
            return res.status(400).send({
                success: false,
                message: 'Please provide all fields: name, phoneNumber, status, package, address, price, month',
            });
        }

        // Validate numeric fields
        if (isNaN(parseFloat(price))) {
            return res.status(400).send({
                success: false,
                message: 'Price must be a valid number',
            });
        }

        await db.query(
            'INSERT INTO dishhome (name, phoneNumber, status, package, address, price, month) VALUES (?,?,?,?,?,?,?)',
            [name, phoneNumber, status, packageType, address, price, month]
        );

        res.status(201).send({
            success: true,
            message: 'Customer created successfully',
        });
    } catch (err) {
        console.log('Error creating customer:', err);
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

        if (!name || !phoneNumber || !status || !packageType || !address || !price || !month) {
            return res.status(400).send({
                success: false,
                message: 'Please provide all fields',
            });
        }

        const data = await db.query(
            'UPDATE dishhome SET name = ?, phoneNumber = ?, status = ?, package = ?, address = ?, price = ?, month = ? WHERE customerId = ?',
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
        const data = await db.query('DELETE FROM dishhome WHERE customerId = ?', [id]);

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
