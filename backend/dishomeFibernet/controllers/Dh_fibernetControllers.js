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

// ===================== CREATE COMBO CUSTOMER =====================
const createCustomer = async (req, res) => {
    try {
        const { dishhomeId, fibernetId, totalPrice, status,category } = req.body;

        if (!dishhomeId || !fibernetId || totalPrice === undefined || status === undefined || !category) {
            return res.status(400).send({
                success: false,
                message: 'Please provide dishhomeId, fibernetId, totalPrice, and status'
            });
        }

        await db.query(
            `INSERT INTO dishhome_fibernet_combo (dishhomeId, fibernetId, totalPrice, status, category)
             VALUES (?, ?, ?, ?)`,
            [dishhomeId, fibernetId, totalPrice, status]
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
        const { dishhomeId, fibernetId, totalPrice, status, category } = req.body;

        if (!dishhomeId || !fibernetId || totalPrice === undefined || status === undefined) {
            return res.status(400).send({
                success: false,
                message: 'Please provide dishhomeId, fibernetId, totalPrice, and status, category'
            });
        }

        const result = await db.query(
            `UPDATE dishhome_fibernet_combo
             SET dishhomeId = ?, fibernetId = ?, totalPrice = ?, status = ?
             WHERE comboId = ?`,
            [dishhomeId, fibernetId, totalPrice, status, comboId, category]
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
    createCustomer,
    updateCustomer,
    deleteCustomer
};
