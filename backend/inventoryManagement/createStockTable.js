const db = require('./database/db');

async function createStockChangesTable() {
  try {
    console.log('Creating stock_changes table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS stock_changes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        old_stock INT NOT NULL,
        new_stock INT NOT NULL,
        quantity_changed INT NOT NULL,
        change_type ENUM('manual_update', 'manual_adjustment', 'sale_reduction', 'restock', 'correction') DEFAULT 'manual_update',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `;
    
    await db.query(createTableQuery);
    console.log('✅ stock_changes table created successfully!');
    
    // Close connection
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating stock_changes table:', err);
    process.exit(1);
  }
}

createStockChangesTable();
