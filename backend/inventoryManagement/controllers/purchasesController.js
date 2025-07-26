const db = require('../../database/db');

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

// Add new purchase
const addPurchase = async (req, res) => {
  const { 
    invoice_no, 
    supplier_name, 
    product_name, 
    quantity_purchased, 
    price_per_unit, 
    notes 
  } = req.body;

  // Validate required fields
  if (!invoice_no || !supplier_name || !product_name || !quantity_purchased || !price_per_unit) {
    return res.status(400).json({ 
      success: false, 
      message: 'All required fields must be provided' 
    });
  }

  const total_amount = quantity_purchased * price_per_unit;

  const query = `
    INSERT INTO purchases (invoice_no, supplier_name, product_name, quantity_purchased, price_per_unit, total_amount, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.query(query, [invoice_no, supplier_name, product_name, quantity_purchased, price_per_unit, total_amount, notes]);

    res.status(201).json({ 
      success: true, 
      message: 'Purchase added successfully',
      data: { 
        id: result.insertId,
        invoice_no,
        supplier_name,
        product_name,
        quantity_purchased,
        price_per_unit,
        total_amount,
        notes
      }
    });
  } catch (err) {
    console.error('Error adding purchase:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding purchase' 
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
  generateInvoiceNumber
};
