const db = require('../../database/db');
const { generateVATBillBuffer } = require('../generateVATBillMemory');
const { logStockChange } = require('./stockController');

// Function to update inventory when items are purchased
const updateInventoryOnPurchase = async (productName, quantityPurchased, pricePerUnit) => {
  try {
    // First, try to find existing product by name (case-insensitive)
    const [existingProducts] = await db.query(
      'SELECT id, total_stock, price FROM products WHERE LOWER(name) = LOWER(?)',
      [productName]
    );

    if (existingProducts.length > 0) {
      // Product exists - update stock
      const product = existingProducts[0];
      const oldStock = parseInt(product.total_stock || 0);
      const newStock = oldStock + parseInt(quantityPurchased);

      await db.query(
        'UPDATE products SET total_stock = ?, price = ? WHERE id = ?',
        [newStock, pricePerUnit, product.id]
      );

      // Log stock change
      await logStockChange(
        product.id,
        oldStock,
        newStock,
        'purchase_addition',
        `Added ${quantityPurchased} units from purchase. Product: ${productName}`
      );

      return {
        action: 'updated',
        productId: product.id,
        oldStock,
        newStock,
        quantityAdded: parseInt(quantityPurchased)
      };
    } else {
      // Product doesn't exist - create new product
      const [result] = await db.query(
        'INSERT INTO products (name, category, price, modelNo, hsCode, total_stock) VALUES (?, ?, ?, ?, ?, ?)',
        [productName, 'General', pricePerUnit, 'N/A', 'N/A', quantityPurchased]
      );

      // Log initial stock
      await logStockChange(
        result.insertId,
        0,
        parseInt(quantityPurchased),
        'initial_stock',
        `Initial stock from purchase. Product: ${productName}`
      );

      return {
        action: 'created',
        productId: result.insertId,
        oldStock: 0,
        newStock: parseInt(quantityPurchased),
        quantityAdded: parseInt(quantityPurchased)
      };
    }
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

// Get all purchases
const getAllPurchases = async (req, res) => {
  const query = `
    SELECT p.*
    FROM purchases p 
    ORDER BY p.purchase_date DESC
  `;
  
  try {
    const [results] = await db.query(query);
    
    res.json({ 
      success: true, 
      data: results,
      message: 'Purchases fetched successfully' 
    });
  } catch (err) {
    console.error('Error fetching purchases:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching purchases' 
    });
  }
};

// Add new purchase (supports both single and multiple items)
const addPurchase = async (req, res) => {
  const { 
    invoice_no, 
    supplier_name, 
    items, // New: array of items for multiple items purchase
    product_name, // Keep for backward compatibility
    quantity_purchased, // Keep for backward compatibility
    price_per_unit, // Keep for backward compatibility
    notes 
  } = req.body;

  // Check if it's multiple items or single item
  if (items && Array.isArray(items) && items.length > 0) {
    // Multiple items purchase
    if (!invoice_no || !supplier_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invoice number and supplier name are required' 
      });
    }

    // Validate each item
    for (let item of items) {
      if (!item.product_name || !item.quantity_purchased || !item.price_per_unit) {
        return res.status(400).json({ 
          success: false, 
          message: 'All items must have product name, quantity, and price per unit' 
        });
      }
    }

    try {
      // Calculate total for all items
      let total_amount = 0;
      const purchaseItems = items.map(item => {
        const itemTotal = parseFloat(item.quantity_purchased) * parseFloat(item.price_per_unit);
        total_amount += itemTotal;
        return {
          ...item,
          total_amount: itemTotal
        };
      });

      // Insert each item as a separate purchase record AND update inventory
      const insertPromises = purchaseItems.map(async (item) => {
        // Insert purchase record
        const query = `
          INSERT INTO purchases (invoice_no, supplier_name, product_name, quantity_purchased, price_per_unit, total_amount, notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const purchaseResult = await db.query(query, [invoice_no, supplier_name, item.product_name, item.quantity_purchased, item.price_per_unit, item.total_amount, notes]);
        
        // Update inventory
        const inventoryUpdate = await updateInventoryOnPurchase(item.product_name, item.quantity_purchased, item.price_per_unit);
        
        return {
          purchaseId: purchaseResult[0].insertId,
          inventoryUpdate
        };
      });

      const results = await Promise.all(insertPromises);

      res.status(201).json({ 
        success: true, 
        message: 'Multi-item purchase added successfully and inventory updated',
        data: { 
          invoice_no,
          supplier_name,
          items: purchaseItems,
          total_items: items.length,
          grand_total: total_amount,
          notes,
          inventoryUpdates: results.map(r => r.inventoryUpdate)
        }
      });
    } catch (err) {
      console.error('Error adding multi-item purchase:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Error adding multi-item purchase',
        error: err.message 
      });
    }
  } else {
    // Single item purchase (backward compatibility)
    if (!invoice_no || !supplier_name || !product_name || !quantity_purchased || !price_per_unit) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided (invoice_no, supplier_name, product_name, quantity_purchased, price_per_unit)' 
      });
    }

    const total_amount = parseFloat(quantity_purchased) * parseFloat(price_per_unit);

    const query = `
      INSERT INTO purchases (invoice_no, supplier_name, product_name, quantity_purchased, price_per_unit, total_amount, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await db.query(query, [invoice_no, supplier_name, product_name, quantity_purchased, price_per_unit, total_amount, notes]);

      // Update inventory
      const inventoryUpdate = await updateInventoryOnPurchase(product_name, quantity_purchased, price_per_unit);

      res.status(201).json({ 
        success: true, 
        message: 'Purchase added successfully and inventory updated',
        data: { 
          id: result.insertId,
          invoice_no,
          supplier_name,
          product_name,
          quantity_purchased,
          price_per_unit,
          total_amount,
          notes,
          inventoryUpdate
        }
      });
    } catch (err) {
      console.error('Error adding purchase:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Error adding purchase',
        error: err.message 
      });
    }
  }
};

// Generate purchase invoice
const generatePurchaseInvoice = async (req, res) => {
  try {
    const { invoice_no } = req.params;

    // Get all purchases with the same invoice number
    const query = `SELECT * FROM purchases WHERE invoice_no = ? ORDER BY id`;
    const [purchases] = await db.query(query, [invoice_no]);

    if (purchases.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No purchases found for this invoice number'
      });
    }

    // Get supplier name from first purchase (all should have same supplier)
    const supplierName = purchases[0].supplier_name;
    
    // Prepare data for invoice generation
    const items = purchases.map(purchase => ({
      productName: purchase.product_name,
      price: parseFloat(purchase.price_per_unit),
      quantity: parseInt(purchase.quantity_purchased),
      total: parseFloat(purchase.total_amount)
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);

    const billData = {
      customerName: supplierName,
      invoiceNumber: invoice_no,
      invoiceDate: new Date(purchases[0].purchase_date).toLocaleDateString(),
      items: items,
      subtotal: subtotal,
      vatRate: 0, // No VAT for purchases typically
      vatAmount: 0,
      grandTotal: subtotal
    };

    // Generate the invoice PDF in memory
    const pdfBuffer = await generateVATBillBuffer(billData, {
      billType: 'inventory',
      title: 'Purchase Invoice'
    });

    // Send the PDF file as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Suggested-Filename', `Purchase-Invoice-${invoice_no}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating purchase invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate purchase invoice',
      error: error.message
    });
  }
};

// Update purchase
const updatePurchase = async (req, res) => {
  const { id } = req.params;
  const { 
    invoice_no, 
    supplier_name, 
    product_name, 
    quantity_purchased, 
    price_per_unit, 
    notes 
  } = req.body;

  if (!invoice_no || !supplier_name || !product_name || !quantity_purchased || !price_per_unit) {
    return res.status(400).json({ 
      success: false, 
      message: 'All required fields must be provided' 
    });
  }

  const total_amount = quantity_purchased * price_per_unit;

  const query = `
    UPDATE purchases 
    SET invoice_no = ?, supplier_name = ?, product_name = ?, quantity_purchased = ?, price_per_unit = ?, total_amount = ?, notes = ?
    WHERE id = ?
  `;

  try {
    const [result] = await db.query(query, [invoice_no, supplier_name, product_name, quantity_purchased, price_per_unit, total_amount, notes, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Purchase not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Purchase updated successfully' 
    });
  } catch (err) {
    console.error('Error updating purchase:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating purchase' 
    });
  }
};

// Delete purchase
const deletePurchase = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the purchase
    const [result] = await db.query('DELETE FROM purchases WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Purchase not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Purchase deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting purchase:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting purchase' 
    });
  }
};

// Get purchase by ID
const getPurchaseById = async (req, res) => {
  const { id } = req.params;
  
  const query = `SELECT * FROM purchases WHERE id = ?`;
  
  try {
    const [results] = await db.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Purchase not found' 
      });
    }

    res.json({ 
      success: true, 
      data: results[0],
      message: 'Purchase fetched successfully' 
    });
  } catch (err) {
    console.error('Error fetching purchase:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching purchase' 
    });
  }
};

// Generate next invoice number
const generateInvoiceNumber = async (req, res) => {
  const query = 'SELECT invoice_no FROM purchases ORDER BY id DESC LIMIT 1';
  
  try {
    const [results] = await db.query(query);

    let nextInvoiceNo = 'PUR-001';
    
    if (results.length > 0) {
      const lastInvoice = results[0].invoice_no;
      const match = lastInvoice.match(/PUR-(\d+)/);
      if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        nextInvoiceNo = `PUR-${nextNumber.toString().padStart(3, '0')}`;
      }
    }

    res.json({ 
      success: true, 
      data: { invoice_no: nextInvoiceNo },
      message: 'Invoice number generated successfully' 
    });
  } catch (err) {
    console.error('Error generating invoice number:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating invoice number' 
    });
  }
};

module.exports = {
  getAllPurchases,
  addPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseById,
  generateInvoiceNumber,
  generatePurchaseInvoice
};
