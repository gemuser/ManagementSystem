const db = require('../../database/db');

// ===================== GET COMBO CUSTOMERS =====================
const getCustomers = async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM dishhome_fibernet_combo');
        if (!data || data[0].length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No combo customers found'
            });
        }
        res.status(200).send({
            success: true,
            message: 'Combo customers retrieved successfully',
            data: data[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            success: false,
            message: "Error in getting combo customers",
            err: err.message
        });
    }
};

// ===================== GET COMBO CUSTOMERS WITH DETAILS =====================
const getCustomersWithDetails = async (req, res) => {
    try {
        const data = await db.query(`
            SELECT 
                dfc.*,
                d.name as dishhome_customer_name,
                d.phoneNumber as dishhome_phone,
                d.address as dishhome_address,
                d.package as dishhome_package,
                d.price as dishhome_price,
                d.month as dishhome_month,
                d.category as dishhome_category,
                f.name as fibernet_customer_name,
                f.phoneNumber as fibernet_phone,
                f.address as fibernet_address,
                f.package as fibernet_package,
                f.price as fibernet_price,
                f.month as fibernet_month
            FROM dishhome_fibernet_combo dfc
            LEFT JOIN dishhome d ON dfc.dishhomeId = d.customerId
            LEFT JOIN fibernet f ON dfc.fibernetId = f.customerId
        `);
        
        if (!data || data[0].length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No combo customers found'
            });
        }
        
        res.status(200).send({
            success: true,
            message: 'Combo customers with details retrieved successfully',
            data: data[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            success: false,
            message: "Error in getting combo customers with details",
            err: err.message
        });
    }
};

// ===================== CREATE COMBO CUSTOMER =====================
const createCustomer = async (req, res) => {
    try {
        const { dishhomeId, fibernetId, totalPrice, status, category, phoneNumber, casId } = req.body;

        if (!dishhomeId || !fibernetId || totalPrice === undefined || status === undefined || !category || !phoneNumber) {
            return res.status(400).send({
                success: false,
                message: 'Please provide dishhomeId, fibernetId, totalPrice, status, category, and phoneNumber. casId is optional.'
            });
        }

        await db.query(
            `INSERT INTO dishhome_fibernet_combo (dishhomeId, fibernetId, totalPrice, status, category, phoneNumber, casId)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [dishhomeId, fibernetId, totalPrice, status, category, phoneNumber, casId || null]
        );

        res.status(201).send({
            success: true,
            message: 'Combo customer created successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({
            success: false,
            message: 'Error in creating combo customer',
            err: err.message
        });
    }
};

// ===================== UPDATE COMBO CUSTOMER =====================
const updateCustomer = async (req, res) => {
    try {
        const comboId = req.params.id;
        const { dishhomeId, fibernetId, totalPrice, status, category, phoneNumber, casId } = req.body;

        if (!dishhomeId || !fibernetId || totalPrice === undefined || status === undefined || !category || !phoneNumber) {
            return res.status(400).send({
                success: false,
                message: 'Please provide dishhomeId, fibernetId, totalPrice, status, category, and phoneNumber. casId is optional.'
            });
        }

        const result = await db.query(
            `UPDATE dishhome_fibernet_combo
             SET dishhomeId = ?, fibernetId = ?, totalPrice = ?, status = ?, category = ?, phoneNumber = ?, casId = ?
             WHERE comboId = ?`,
            [dishhomeId, fibernetId, totalPrice, status, category, phoneNumber, casId || null, comboId]
        );

        if (result[0].affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Combo customer not found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Combo customer updated successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({
            success: false,
            message: 'Error in updating combo customer',
            err: err.message
        });
    }
};

// ===================== DELETE COMBO CUSTOMER =====================
const deleteCustomer = async (req, res) => {
    try {
        const comboId = req.params.id;
        const result = await db.query('DELETE FROM dishhome_fibernet_combo WHERE comboId = ?', [comboId]);

        if (result[0].affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Combo customer not found'
            });
        }

        res.status(200).send({
            success: true,
            message: 'Combo customer deleted successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({
            success: false,
            message: 'Error in deleting combo customer',
            err: err.message
        });
    }
};

module.exports = {
    getCustomers,
    getCustomersWithDetails,
    createCustomer,
    updateCustomer,
    deleteCustomer
};
