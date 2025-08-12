const db = require('../../database/db');

// ===================== GET COMBO CUSTOMERS =====================
const getCustomers = async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM dishhome_fibernet_combo');
        res.status(200).send({
            success: true,
            message: data[0].length > 0 ? 'Combo customers retrieved successfully' : 'No combo customers found',
            data: data[0] || []
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
        const { 
            dishhomeId, 
            fibernetId, 
            totalPrice, 
            status = 1, 
            category = 'combo',
            phoneNumber,
            casId,
            month,
            upgradeType,
            sourceService
        } = req.body;

        // For upgrade scenarios, only one ID might be provided
        if ((!dishhomeId && !fibernetId) || totalPrice === undefined) {
            return res.status(400).send({
                success: false,
                message: 'Please provide at least one customer ID (dishhomeId or fibernetId) and totalPrice'
            });
        }

        // If this is an upgrade from a single service, we need to get the customer details
        let finalPhoneNumber = phoneNumber;
        let finalCasId = casId;
        let customerName = '';
        let customerAddress = '';
        let dishhomePackage = '';
        let fibernetPackage = '';

        if (dishhomeId) {
            // Get DishHome customer details
            const [dishhomeCustomer] = await db.query(
                `SELECT name, phoneNumber, address, package, casId FROM dishhome WHERE customerId = ?`,
                [dishhomeId]
            );
            
            if (dishhomeCustomer.length > 0) {
                const customer = dishhomeCustomer[0];
                if (!finalPhoneNumber) finalPhoneNumber = customer.phoneNumber;
                if (!finalCasId) finalCasId = customer.casId;
                customerName = customer.name;
                customerAddress = customer.address;
                dishhomePackage = customer.package;
            }
        }

        if (fibernetId) {
            // Get Fibernet customer details
            const [fibernetCustomer] = await db.query(
                `SELECT name, phoneNumber, address, package FROM fibernet WHERE customerId = ?`,
                [fibernetId]
            );
            
            if (fibernetCustomer.length > 0) {
                const customer = fibernetCustomer[0];
                if (!finalPhoneNumber) finalPhoneNumber = customer.phoneNumber;
                if (!customerName) customerName = customer.name;
                if (!customerAddress) customerAddress = customer.address;
                fibernetPackage = customer.package;
            }
        }

        // Generate CAS ID if not provided and this involves DishHome
        if (!finalCasId && (dishhomeId || upgradeType === 'DTH')) {
            finalCasId = `CAS-COMBO-${Date.now()}`;
        }

        // For upgrade scenarios, we need to populate both service columns
        // so the customer appears in both DishHome and Fibernet columns
        let finalDishhomeId = dishhomeId;
        let finalFibernetId = fibernetId;
        
        // If this is an upgrade, create entries for both services using the same customer
        if (upgradeType && sourceService) {
            if (sourceService === 'dishhome' && dishhomeId) {
                // DishHome customer upgrading - they get both DishHome and Fibernet IDs
                finalDishhomeId = dishhomeId;
                finalFibernetId = dishhomeId; // Use same ID for fibernet to show in both columns
            } else if (sourceService === 'fibernet' && fibernetId) {
                // Fibernet customer upgrading - they get both DishHome and Fibernet IDs
                finalDishhomeId = fibernetId; // Use same ID for dishhome to show in both columns
                finalFibernetId = fibernetId;
            }
        }

        // Ensure we have a customer name for display
        if (!customerName && dishhomeId) {
            const [dishhomeCustomer] = await db.query(
                `SELECT name FROM dishhome WHERE customerId = ?`,
                [dishhomeId]
            );
            if (dishhomeCustomer.length > 0) {
                customerName = dishhomeCustomer[0].name;
            }
        }
        
        if (!customerName && fibernetId) {
            const [fibernetCustomer] = await db.query(
                `SELECT name FROM fibernet WHERE customerId = ?`,
                [fibernetId]
            );
            if (fibernetCustomer.length > 0) {
                customerName = fibernetCustomer[0].name;
            }
        }

        // For upgrades, set both package names to show complete service
        if (upgradeType && sourceService) {
            if (sourceService === 'dishhome') {
                fibernetPackage = `${upgradeType} Internet Service`; // Generic fibernet package for combo
            } else if (sourceService === 'fibernet') {
                dishhomePackage = `${upgradeType} TV Service`; // Generic dishhome package for combo
            }
        }

        await db.query(
            `INSERT INTO dishhome_fibernet_combo 
             (dishhomeId, fibernetId, totalPrice, status, category, phoneNumber, casId, month, upgradeType, sourceService, customerName, customerAddress, dishhomePackage, fibernetPackage)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                finalDishhomeId || null, 
                finalFibernetId || null, 
                totalPrice, 
                status, 
                category, 
                finalPhoneNumber || null, 
                finalCasId || null,
                month || null,
                upgradeType || null,
                sourceService || null,
                customerName || null,
                customerAddress || null,
                dishhomePackage || null,
                fibernetPackage || null
            ]
        );

        res.status(201).send({
            success: true,
            message: 'Combo customer created successfully'
        });

    } catch (err) {
        console.error('Error creating combo customer:', err);
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
        const { 
            dishhomeId, 
            fibernetId, 
            totalPrice, 
            status, 
            category, 
            phoneNumber, 
            casId, 
            month, 
            upgradeType, 
            sourceService,
            customerName,
            customerAddress,
            dishhomePackage,
            fibernetPackage
        } = req.body;

        // Ensure we have customer name if not provided
        let finalCustomerName = customerName;
        let finalCustomerAddress = customerAddress;
        let finalDishhomePackage = dishhomePackage;
        let finalFibernetPackage = fibernetPackage;

        if (!finalCustomerName && dishhomeId) {
            const [dishhomeCustomer] = await db.query(
                `SELECT name, address, package FROM dishhome WHERE customerId = ?`,
                [dishhomeId]
            );
            if (dishhomeCustomer.length > 0) {
                finalCustomerName = dishhomeCustomer[0].name;
                finalCustomerAddress = finalCustomerAddress || dishhomeCustomer[0].address;
                finalDishhomePackage = finalDishhomePackage || dishhomeCustomer[0].package;
            }
        }

        if (!finalCustomerName && fibernetId) {
            const [fibernetCustomer] = await db.query(
                `SELECT name, address, package FROM fibernet WHERE customerId = ?`,
                [fibernetId]
            );
            if (fibernetCustomer.length > 0) {
                finalCustomerName = fibernetCustomer[0].name;
                finalCustomerAddress = finalCustomerAddress || fibernetCustomer[0].address;
                finalFibernetPackage = finalFibernetPackage || fibernetCustomer[0].package;
            }
        }

        const result = await db.query(
            `UPDATE dishhome_fibernet_combo
             SET dishhomeId = ?, fibernetId = ?, totalPrice = ?, status = ?, category = ?, 
                 phoneNumber = ?, casId = ?, month = ?, upgradeType = ?, sourceService = ?,
                 customerName = ?, customerAddress = ?, dishhomePackage = ?, fibernetPackage = ?
             WHERE comboId = ?`,
            [
                dishhomeId || null, 
                fibernetId || null, 
                totalPrice, 
                status, 
                category, 
                phoneNumber || null, 
                casId || null,
                month || null,
                upgradeType || null,
                sourceService || null,
                finalCustomerName || null,
                finalCustomerAddress || null,
                finalDishhomePackage || null,
                finalFibernetPackage || null,
                comboId
            ]
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
