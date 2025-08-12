const db = require('./database/db.js');
const fs = require('fs');

async function createInvoiceTables() {
  try {
    // Read the SQL file
    const sqlFile = fs.readFileSync('./database/invoice_tables.sql', 'utf8');

    // Split by semicolon and filter out empty statements
    const statements = sqlFile.split(';').filter(stmt => stmt.trim().length > 0);

    console.log('Creating invoice tables...');

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const cleanStatement = statements[i].trim();
      if (cleanStatement) {
        try {
          await db.execute(cleanStatement);
          console.log(`Statement ${i + 1} executed successfully`);
        } catch (err) {
          console.error(`Error executing statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('All invoice tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createInvoiceTables();
