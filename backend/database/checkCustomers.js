const db = require('../database/db');

async function checkExistingCustomers() {
    try {
        console.log('Checking existing customers...\n');
        
        console.log('Dishhome customers:');
        const dishhome = await db.query('SELECT customerId, name FROM dishhome LIMIT 5');
        if (dishhome[0].length > 0) {
            console.table(dishhome[0]);
        } else {
            console.log('No dishhome customers found');
        }
        
        console.log('\nFibernet customers:');
        const fibernet = await db.query('SELECT customerId, name FROM fibernet LIMIT 5');
        if (fibernet[0].length > 0) {
            console.table(fibernet[0]);
        } else {
            console.log('No fibernet customers found');
        }
        
        console.log('\nCombo customers:');
        const combo = await db.query('SELECT * FROM dishhome_fibernet_combo LIMIT 5');
        if (combo[0].length > 0) {
            console.table(combo[0]);
        } else {
            console.log('No combo customers found');
        }
        
    } catch (error) {
        console.error('Error checking customers:', error.message);
    } finally {
        process.exit(0);
    }
}

checkExistingCustomers();
