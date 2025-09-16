const db = require('../../database/db');

// ===================== GET CUSTOMERS =====================
const getCustomers = async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM dishhome');
        res.status(200).send({
            success: true,
            message: data[0].length > 0 ? 'Customers retrieved successfully' : 'No customers found',
            data: data[0] || []
        });
    } catch (err) {
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
        const { customerId, name, phoneNumber, status, package: packageType, address, price, month, casId } = req.body;

        if (!name || !phoneNumber || status === undefined || !packageType || !address || !price || !month) {
            return res.status(400).send({
                success: false,
                message: 'Please provide all required fields: name, phoneNumber, status, package, address, price, month',
            });
        }

        // Validate price field
        if (isNaN(parseFloat(price))) {
            return res.status(400).send({
                success: false,
                message: 'Price must be a valid number',
            });
        }

        // Validate customerId if provided (check if it's within INT range)
        if (customerId) {
            const customerIdNum = parseInt(customerId);
            if (isNaN(customerIdNum) || customerIdNum > 2147483647 || customerIdNum < 1) {
                return res.status(400).send({
                    success: false,
                    message: 'Customer ID must be a valid number within range (1 to 2,147,483,647). For large numbers, the system will auto-generate an ID.',
                });
            }

            // Check if customerId already exists
            const existingCustomer = await db.query('SELECT customerId FROM dishhome WHERE customerId = ?', [customerIdNum]);
            if (existingCustomer[0].length > 0) {
                return res.status(400).send({
                    success: false,
                    message: 'Customer ID already exists. Please choose a different ID.',
                });
            }
        }

        // Generate CAS ID if not provided
        const finalCasId = casId || `CAS-${customerId || 'AUTO'}-${Date.now()}`;

        let query, params;
        if (customerId && parseInt(customerId) <= 2147483647) {
            // Use provided customerId if within range
            query = 'INSERT INTO dishhome (customerId, name, phoneNumber, status, package, address, price, month, casId) VALUES (?,?,?,?,?,?,?,?,?)';
            params = [parseInt(customerId), name, phoneNumber, status, packageType, address, price, month, finalCasId];
        } else {
            // Auto-generate customerId
            query = 'INSERT INTO dishhome (name, phoneNumber, status, package, address, price, month, casId) VALUES (?,?,?,?,?,?,?,?)';
            params = [name, phoneNumber, status, packageType, address, price, month, finalCasId];
        }

        const [result] = await db.query(query, params);

        res.status(201).send({
            success: true,
            message: 'Customer created successfully',
            data: {
                customerId: customerId && parseInt(customerId) <= 2147483647 ? parseInt(customerId) : result.insertId,
                name,
                phoneNumber,
                casId: finalCasId
            }
        });
    } catch (err) {
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
        const { name, phoneNumber, status, package: packageType, address, price, month, casId } = req.body;

        if (!name || !phoneNumber || status === undefined || !packageType || !address || !price || !month) {
            return res.status(400).send({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        // Generate CAS ID if not provided
        const finalCasId = casId || `CAS-${id}-${Date.now()}`;

        const data = await db.query(
            'UPDATE dishhome SET name = ?, phoneNumber = ?, status = ?, package = ?, address = ?, price = ?, month = ?, casId = ? WHERE customerId = ?',
            [name, phoneNumber, status, packageType, address, price, month, finalCasId, id]
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
