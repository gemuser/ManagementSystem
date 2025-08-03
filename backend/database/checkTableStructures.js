const db = require('../database/db');

async function checkTableStructures() {
    try {
        console.log('Dishhome table structure:');
        const dishhomeStructure = await db.query('DESCRIBE dishhome');
        console.table(dishhomeStructure[0]);
        
        console.log('\nFibernet table structure:');
        const fibernetStructure = await db.query('DESCRIBE fibernet');
        console.table(fibernetStructure[0]);
        
    } catch (error) {
        console.error('Error checking table structures:', error.message);
    } finally {
        process.exit(0);
    }
}

checkTableStructures();
