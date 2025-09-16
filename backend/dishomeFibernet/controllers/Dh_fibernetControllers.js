const db = require('../../database/db');
const { generateVATBillBuffer } = require('../../inventoryManagement/generateVATBillMemory');

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
            sourceService,
            customerName: providedCustomerName,
            customerAddress: providedCustomerAddress,
            dishhomePackage: providedDishhomePackage,
            fibernetPackage: providedFibernetPackage
        } = req.body;

        // Validate required fields
        if (!totalPrice || totalPrice <= 0) {
            return res.status(400).send({
                success: false,
                message: 'Please provide a valid total price'
            });
        }

        // For conversion scenarios, we need either source info or manual data
        if (upgradeType && sourceService) {
            if (sourceService === 'dishhome' && !dishhomeId) {
                return res.status(400).send({
                    success: false,
                    message: 'DishHome customer ID is required for DishHome conversion'
                });
            }
            if (sourceService === 'fibernet' && !fibernetId) {
                return res.status(400).send({
                    success: false,
                    message: 'Fibernet customer ID is required for Fibernet conversion'
                });
            }
        } else {
            // For new combo customers, we need at least basic info
            if (!dishhomeId && !fibernetId && !providedCustomerName && !phoneNumber) {
                return res.status(400).send({
                    success: false,
                    message: 'Please provide customer information (ID or manual details)'
                });
            }
        }

        // Initialize customer details
        let finalPhoneNumber = phoneNumber;
        let finalCasId = casId;
        let customerName = providedCustomerName || '';
        let customerAddress = providedCustomerAddress || '';
        let dishhomePackage = providedDishhomePackage || '';
        let fibernetPackage = providedFibernetPackage || '';
        let finalDishhomeId = dishhomeId;
        let finalFibernetId = fibernetId;

        // Handle three scenarios:
        // 1. DishHome customer converting to combo (existing DishHome + new Fibernet service)
        // 2. Fibernet customer converting to combo (existing Fibernet + new DishHome service) 
        // 3. New combo customer (new customer getting both services)

        if (upgradeType && sourceService) {
            // SCENARIO 1: DishHome customer converting to combo
            if (sourceService === 'dishhome' && dishhomeId) {
                // Get existing DishHome customer details
                const [dishhomeCustomer] = await db.query(
                    `SELECT name, phoneNumber, address, package, casId FROM dishhome WHERE customerId = ?`,
                    [dishhomeId]
                );
                
                if (dishhomeCustomer.length > 0) {
                    const customer = dishhomeCustomer[0];
                    customerName = customer.name;
                    customerAddress = customer.address;
                    dishhomePackage = customer.package;
                    finalPhoneNumber = finalPhoneNumber || customer.phoneNumber;
                    finalCasId = finalCasId || customer.casId;
                }
                
                // For conversion: Keep DishHome ID, set Fibernet ID to null (new service)
                finalDishhomeId = dishhomeId;
                finalFibernetId = null; // New Fibernet service for this customer
                
                // Set default fibernet package for combo
                if (!fibernetPackage) {
                    fibernetPackage = `${upgradeType} Internet Service`;
                }
            }
            
            // SCENARIO 2: Fibernet customer converting to combo
            else if (sourceService === 'fibernet' && fibernetId) {
                // Get existing Fibernet customer details
                const [fibernetCustomer] = await db.query(
                    `SELECT name, phoneNumber, address, package FROM fibernet WHERE customerId = ?`,
                    [fibernetId]
                );
                
                if (fibernetCustomer.length > 0) {
                    const customer = fibernetCustomer[0];
                    customerName = customer.name;
                    customerAddress = customer.address;
                    fibernetPackage = customer.package;
                    finalPhoneNumber = finalPhoneNumber || customer.phoneNumber;
                }
                
                // For conversion: Keep Fibernet ID, set DishHome ID to null (new service)
                finalFibernetId = fibernetId;
                finalDishhomeId = null; // New DishHome service for this customer
                
                // Generate CAS ID for new DishHome service
                if (!finalCasId) {
                    finalCasId = `CAS-COMBO-${Date.now()}`;
                }
                
                // Set default dishhome package for combo
                if (!dishhomePackage) {
                    dishhomePackage = `${upgradeType} TV Service`;
                }
            }
        } else {
            // SCENARIO 3: New combo customer or manual creation
            // This could be a completely new customer or linking existing separate customers
            
            if (dishhomeId) {
                // Get DishHome customer details if ID provided
                const [dishhomeCustomer] = await db.query(
                    `SELECT name, phoneNumber, address, package, casId FROM dishhome WHERE customerId = ?`,
                    [dishhomeId]
                );
                
                if (dishhomeCustomer.length > 0) {
                    const customer = dishhomeCustomer[0];
                    if (!customerName) customerName = customer.name;
                    if (!customerAddress) customerAddress = customer.address;
                    if (!dishhomePackage) dishhomePackage = customer.package;
                    if (!finalPhoneNumber) finalPhoneNumber = customer.phoneNumber;
                    if (!finalCasId) finalCasId = customer.casId;
                }
            }

            if (fibernetId) {
                // Get Fibernet customer details if ID provided
                const [fibernetCustomer] = await db.query(
                    `SELECT name, phoneNumber, address, package FROM fibernet WHERE customerId = ?`,
                    [fibernetId]
                );
                
                if (fibernetCustomer.length > 0) {
                    const customer = fibernetCustomer[0];
                    if (!customerName) customerName = customer.name;
                    if (!customerAddress) customerAddress = customer.address;
                    if (!fibernetPackage) fibernetPackage = customer.package;
                    if (!finalPhoneNumber) finalPhoneNumber = customer.phoneNumber;
                }
            }
            
            // Generate CAS ID if not provided and DishHome service is involved
            if (!finalCasId && (dishhomeId || upgradeType === 'DTH')) {
                finalCasId = `CAS-COMBO-${Date.now()}`;
            }
        }

        // Insert combo customer record
        // Use transaction to ensure data consistency
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Insert combo customer record
            const insertResult = await connection.query(
                `INSERT INTO dishhome_fibernet_combo 
                 (dishhomeId, fibernetId, totalPrice, status, category, phoneNumber, casId, month, upgradeType, sourceService, customerName, customerAddress, dishhomePackage, fibernetPackage)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    finalDishhomeId || null, 
                    finalFibernetId || null, 
                    parseInt(totalPrice), 
                    status || 1, 
                    category || 'combo', 
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

            const comboId = insertResult[0].insertId;

                            // Remove original customer records after successful combo creation
                if (upgradeType === 'dishhome-to-combo' && dishhomeId) {
                    await db.execute('DELETE FROM dishhome_customers WHERE id = ?', [dishhomeId]);
                }
                
                if (upgradeType === 'fibernet-to-combo' && fibernetId) {
                    await db.execute('DELETE FROM fibernet_customers WHERE id = ?', [fibernetId]);
                }

            // Commit the transaction
            await connection.commit();
            
            res.status(201).send({
                success: true,
                message: (upgradeType && upgradeType !== '') && (sourceService && sourceService !== '')
                    ? `${sourceService} customer successfully converted to combo and removed from original table`
                    : 'Combo customer created successfully',
                data: {
                    comboId,
                    customerName: customerName || 'New Customer',
                    dishhomeId: finalDishhomeId,
                    fibernetId: finalFibernetId,
                    totalPrice: parseInt(totalPrice),
                    upgradeType,
                    sourceService,
                    createdAt: new Date().toISOString(),
                    originalRecordRemoved: !!((upgradeType && upgradeType !== '') && (sourceService && sourceService !== ''))
                }
            });

        } catch (transactionError) {
            // Rollback the transaction if anything fails
            await connection.rollback();
            throw transactionError;
        } finally {
            // Release the connection
            connection.release();
        }

    } catch (err) {
        console.error('Error creating combo customer:', err);
        console.error('Error details:', {
            message: err.message,
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            sqlMessage: err.sqlMessage
        });
        res.status(500).send({
            success: false,
            message: 'Error in creating combo customer',
            err: err.message,
            details: err.sqlMessage || err.message
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
        
        // First, get the combo details before deletion
        const [comboDetails] = await db.query(
            'SELECT * FROM dishhome_fibernet_combo WHERE comboId = ?', 
            [comboId]
        );

        if (comboDetails.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'Combo customer not found'
            });
        }

        const combo = comboDetails[0];
        
        // Delete the combo record
        const result = await db.query('DELETE FROM dishhome_fibernet_combo WHERE comboId = ?', [comboId]);

        let restorationMessage = '';
        
        // Note: Restoring original customer records is optional and depends on business logic
        // This implementation provides the option but doesn't automatically restore
        // You might want to restore original customers in some cases:
        /*
        if (combo.upgradeType && combo.sourceService) {
            try {
                if (combo.sourceService === 'dishhome' && combo.dishhomeId) {
                    // Restore to DishHome table
                    await db.query(
                        `INSERT INTO dishhome (customerId, name, phoneNumber, address, package, price, month, casId, status, category)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            combo.dishhomeId,
                            combo.customerName,
                            combo.phoneNumber,
                            combo.customerAddress,
                            combo.dishhomePackage || 'Standard Package',
                            Math.floor(combo.totalPrice * 0.6), // Estimate DishHome portion
                            combo.month,
                            combo.casId,
                            combo.status,
                            'DTH'
                        ]
                    );
                    restorationMessage = ' and restored to DishHome table';
                } else if (combo.sourceService === 'fibernet' && combo.fibernetId) {
                    // Restore to Fibernet table
                    await db.query(
                        `INSERT INTO fibernet (customerId, name, phoneNumber, address, package, price, month, status)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            combo.fibernetId,
                            combo.customerName,
                            combo.phoneNumber,
                            combo.customerAddress,
                            combo.fibernetPackage || 'Standard Package',
                            Math.floor(combo.totalPrice * 0.4), // Estimate Fibernet portion
                            combo.month,
                            combo.status
                        ]
                    );
                    restorationMessage = ' and restored to Fibernet table';
                }
            } catch (restoreError) {
                console.error('Error restoring original customer record:', restoreError);
                restorationMessage = ' (original record restoration failed)';
            }
        }
        */

        res.status(200).send({
            success: true,
            message: `Combo customer deleted successfully${restorationMessage}`,
            deletedCombo: {
                comboId: combo.comboId,
                customerName: combo.customerName,
                sourceService: combo.sourceService,
                upgradeType: combo.upgradeType
            }
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

// ===================== GENERATE COMBO BILL =====================
const generateComboBill = async (req, res) => {
    try {
        const { comboId } = req.params;
        const { month, year, notes } = req.body;

        // Get combo customer details
        const [comboDetails] = await db.query(`
            SELECT 
                dfc.*,
                d.name as dishhome_customer_name,
                d.phoneNumber as dishhome_phone,
                d.address as dishhome_address,
                d.package as dishhome_package,
                d.price as dishhome_price,
                f.name as fibernet_customer_name,
                f.phoneNumber as fibernet_phone,
                f.address as fibernet_address,
                f.package as fibernet_package,
                f.price as fibernet_price
            FROM dishhome_fibernet_combo dfc
            LEFT JOIN dishhome d ON dfc.dishhomeId = d.customerId
            LEFT JOIN fibernet f ON dfc.fibernetId = f.customerId
            WHERE dfc.comboId = ?
        `, [comboId]);

        if (comboDetails.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'Combo customer not found'
            });
        }

        const combo = comboDetails[0];
        const customerName = combo.dishhome_customer_name || combo.fibernet_customer_name || combo.customerName || 'Unknown Customer';
        const customerAddress = combo.dishhome_address || combo.fibernet_address || combo.customerAddress || '';
        const customerPhone = combo.dishhome_phone || combo.fibernet_phone || combo.phoneNumber || '';

        // Generate invoice number
        const invoiceNumber = `DHI-${comboId}-${Date.now()}`;
        
        // Prepare bill items
        const items = [];
        
        if (combo.dishhome_package && combo.dishhome_price) {
            items.push({
                productName: `DishHome - ${combo.dishhome_package}`,
                quantity: 1,
                price: combo.dishhome_price,
                total: combo.dishhome_price
            });
        }
        
        if (combo.fibernet_package && combo.fibernet_price) {
            items.push({
                productName: `Fibernet - ${combo.fibernet_package}`,
                quantity: 1,
                price: combo.fibernet_price,
                total: combo.fibernet_price
            });
        }

        const invoiceData = {
            customerName: customerName,
            invoiceNumber: invoiceNumber,
            invoiceDate: new Date().toLocaleDateString(),
            items: items,
            subtotal: combo.totalPrice,
            vatRate: 0,
            vatAmount: 0,
            grandTotal: combo.totalPrice,
            serviceType: 'DishHome + Fibernet Combo Service',
            customerPhone: customerPhone,
            customerAddress: customerAddress,
            casId: combo.casId || 'N/A',
            notes: notes || 'DHI Combo Service Bill'
        };

        // Generate PDF using VAT bill logic with DHI bill type
        const pdfBuffer = await generateVATBillBuffer(invoiceData, {
            title: 'DHI Combo Invoice',
            billType: 'dhi',
            serviceBased: true
        });

        // Convert buffer to base64 for frontend
        const pdfBase64 = pdfBuffer.toString('base64');

        res.status(200).send({
            success: true,
            message: 'DHI Combo bill generated successfully',
            pdf: pdfBase64,
            data: {
                invoiceNumber,
                totalAmount: combo.totalPrice,
                customerName: customerName
            }
        });

    } catch (error) {
        console.error('Error generating DHI combo bill:', error);
        res.status(500).send({
            success: false,
            message: 'Error generating DHI combo bill',
            error: error.message
        });
    }
};

module.exports = {
    getCustomers,
    getCustomersWithDetails,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    generateComboBill
};
