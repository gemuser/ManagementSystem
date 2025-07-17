const db = require('../database/db');

// Function to log stock changes
const logStockChange = async (product_id, old_stock, new_stock, change_type = 'manual_update', notes = '') => {
  try {
    const quantity_changed = new_stock - old_stock;
    
    await db.query(
      `INSERT INTO stock_changes 
       (product_id, old_stock, new_stock, quantity_changed, change_type, notes, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [product_id, old_stock, new_stock, quantity_changed, change_type, notes]
    );
  } catch (err) {
    console.error('Error logging stock change:', err);
  }
};

// Get all stock changes
const getStockChanges = async (req, res) => {
  try {
    const query = `
      SELECT 
        sc.*,
        p.name as product_name,
        p.category
      FROM stock_changes sc
      LEFT JOIN products p ON sc.product_id = p.id
      ORDER BY sc.created_at DESC
      LIMIT 100
    `;
    
    const [data] = await db.query(query);
    
    res.status(200).send({
      success: true,
      message: 'Stock changes retrieved successfully',
      data: data
    });
  } catch (err) {
    console.error('Error fetching stock changes:', err);
    res.status(500).send({
      success: false,
      message: 'Error in getting stock changes',
      error: err.message
    });
  }
};

// Create stock adjustment entry
const createStockAdjustment = async (req, res) => {
  try {
    const { product_id, new_stock, notes = 'Manual stock adjustment' } = req.body;
    
    if (!product_id || new_stock === undefined) {
      return res.status(400).send({
        success: false,
        message: 'Please provide product_id and new_stock'
      });
    }

    // Get current stock
    const [[product]] = await db.query(
      'SELECT total_stock, name FROM products WHERE id = ?',
      [product_id]
    );

    if (!product) {
      return res.status(404).send({
        success: false,
        message: 'Product not found'
      });
    }

    const old_stock = parseInt(product.total_stock);
    const updated_stock = parseInt(new_stock);

    // Update product stock
    await db.query(
      'UPDATE products SET total_stock = ? WHERE id = ?',
      [updated_stock, product_id]
    );

    // Log the stock change
    await logStockChange(product_id, old_stock, updated_stock, 'manual_adjustment', notes);

    res.status(201).send({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        product_name: product.name,
        old_stock,
        new_stock: updated_stock,
        quantity_changed: updated_stock - old_stock
      }
    });
  } catch (err) {
    console.error('Error creating stock adjustment:', err);
    res.status(500).send({
      success: false,
      message: 'Error in stock adjustment',
      error: err.message
    });
  }
};

module.exports = {
  logStockChange,
  getStockChanges,
  createStockAdjustment
};
