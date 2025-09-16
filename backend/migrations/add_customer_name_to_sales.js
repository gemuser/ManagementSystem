const db = require('../database/db');

async function addCustomerNameToSales() {
    try {
        console.log('Adding customer_name column to sales table...');
        
        // Check if column already exists
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'inventory_system' 
            AND TABLE_NAME = 'sales' 
            AND COLUMN_NAME = 'customer_name'
        `);
        
        if (columns.length > 0) {
            console.log('customer_name column already exists in sales table');
            return;
        }
        
        // Add customer_name column
        await db.query(`
            ALTER TABLE sales 
            ADD COLUMN customer_name VARCHAR(100) 
            AFTER invoice_no
        `);
        
        console.log('Successfully added customer_name column to sales table');
        
    } catch (error) {
        console.error('Error adding customer_name column:', error);
        throw error;
    }
}

// Run migration if called directly
if (require.main === module) {
    addCustomerNameToSales()
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = addCustomerNameToSales;