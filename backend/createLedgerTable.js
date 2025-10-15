const db = require('./database/db');

async function createLedgerTable() {
  try {
    console.log('Creating ledger_entries table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ledger_entries (
        id int NOT NULL AUTO_INCREMENT,
        entry_date date NOT NULL,
        name varchar(255) DEFAULT NULL,
        particulars text NOT NULL,
        dr_amount decimal(12,2) DEFAULT 0.00,
        cr_amount decimal(12,2) DEFAULT 0.00,
        balance decimal(12,2) DEFAULT 0.00,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_entry_date (entry_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    
    await db.execute(createTableQuery);
    console.log('✅ ledger_entries table created successfully');
    
    // Check if table is empty and insert sample data
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM ledger_entries');
    
    if (rows[0].count === 0) {
      console.log('Inserting sample data...');
      
      const insertQuery = `
        INSERT INTO ledger_entries (entry_date, name, particulars, dr_amount, cr_amount, balance) VALUES
        ('2024-09-13', 'System', 'Opening Balance', 50000.00, 0.00, 50000.00),
        ('2024-09-13', 'Walk-in Customer', 'Cash Sales', 15000.00, 0.00, 65000.00),
        ('2024-09-13', 'Landlord', 'Office Rent', 0.00, 12000.00, 53000.00);
      `;
      
      await db.execute(insertQuery);
      console.log('✅ Sample data inserted successfully');
    } else {
      console.log('✅ Table already contains data, skipping sample data insertion');
    }
    
    // Verify the table
    const [tableRows] = await db.execute('SELECT * FROM ledger_entries ORDER BY entry_date, id');
    console.log(`✅ Ledger table verification: ${tableRows.length} entries found`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating ledger table:', error);
    process.exit(1);
  }
}

createLedgerTable();