const express = require('express');
const router = express.Router();
const db = require('../database/db');

/**
 * GET /api/ledger
 * Fetch all ledger entries ordered by date and id
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        entry_date,
        name,
        particulars,
        dr_amount,
        cr_amount,
        balance,
        created_at
      FROM ledger_entries 
      ORDER BY entry_date ASC, id ASC
    `;
    
    const [rows] = await db.execute(query);
    
    // Recalculate running balance to ensure accuracy
    // Business rule: credit increases balance, debit decreases balance
    let runningBalance = 0;
    const entriesWithBalance = rows.map(entry => {
      runningBalance += parseFloat(entry.cr_amount) - parseFloat(entry.dr_amount);
      return {
        ...entry,
        dr_amount: parseFloat(entry.dr_amount),
        cr_amount: parseFloat(entry.cr_amount),
        balance: runningBalance
      };
    });
    
    res.json({
      success: true,
      data: entriesWithBalance
    });
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ledger entries',
      error: error.message
    });
  }
});

/**
 * POST /api/ledger
 * Add a new ledger entry
 */
router.post('/', async (req, res) => {
  try {
  const { entry_date, name, particulars, dr_amount, cr_amount } = req.body;
    
    // Validation
    if (!entry_date || !particulars) {
      return res.status(400).json({
        success: false,
        message: 'Entry date and particulars are required'
      });
    }
    
    const drAmount = parseFloat(dr_amount) || 0;
    const crAmount = parseFloat(cr_amount) || 0;
    
    if (drAmount === 0 && crAmount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Either Dr Amount or Cr Amount must be greater than 0'
      });
    }
    
    if (drAmount > 0 && crAmount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot have both Dr Amount and Cr Amount in the same entry'
      });
    }
    
    if (drAmount < 0 || crAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amounts cannot be negative'
      });
    }
    
    // Get current balance from last entry
    const [lastEntryRows] = await db.execute(`
      SELECT balance FROM ledger_entries 
      ORDER BY entry_date DESC, id DESC 
      LIMIT 1
    `);
    
  const lastBalance = lastEntryRows.length > 0 ? parseFloat(lastEntryRows[0].balance) : 0;
  // Business rule: credit increases balance, debit decreases balance
  const newBalance = lastBalance + crAmount - drAmount;
    
    // Insert new entry
    const insertQuery = `
      INSERT INTO ledger_entries (entry_date, name, particulars, dr_amount, cr_amount, balance)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(insertQuery, [
      entry_date,
      name ? name.trim() : null,
      particulars.trim(),
      drAmount,
      crAmount,
      newBalance
    ]);
    
    // After inserting, recalculate all balances to ensure consistency
    await recalculateAllBalances();
    
    // Return the new entry
    const [newEntryRows] = await db.execute(`
      SELECT * FROM ledger_entries WHERE id = ?
    `, [result.insertId]);
    
    res.json({
      success: true,
      message: 'Ledger entry added successfully',
      data: {
        ...newEntryRows[0],
        dr_amount: parseFloat(newEntryRows[0].dr_amount),
        cr_amount: parseFloat(newEntryRows[0].cr_amount),
        balance: parseFloat(newEntryRows[0].balance)
      }
    });
    
  } catch (error) {
    console.error('Error adding ledger entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add ledger entry',
      error: error.message
    });
  }
});

/**
 * GET /api/ledger/summary
 * Get ledger summary (totals)
 */
router.get('/summary', async (req, res) => {
  try {
    const query = `
      SELECT 
        SUM(dr_amount) as total_dr,
        SUM(cr_amount) as total_cr,
        COUNT(*) as total_entries
      FROM ledger_entries
    `;
    
    const [rows] = await db.execute(query);
    const summary = rows[0];
    
  const totalDr = parseFloat(summary.total_dr) || 0;
  const totalCr = parseFloat(summary.total_cr) || 0;
  // Business rule: current balance = total credits - total debits
  const currentBalance = totalCr - totalDr;
    
    res.json({
      success: true,
      data: {
        totalDr,
        totalCr,
        currentBalance,
        totalEntries: summary.total_entries
      }
    });
    
  } catch (error) {
    console.error('Error fetching ledger summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ledger summary',
      error: error.message
    });
  }
});

/**
 * DELETE /api/ledger/:id
 * Delete a ledger entry
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if entry exists
    const [existingRows] = await db.execute(
      'SELECT id FROM ledger_entries WHERE id = ?',
      [id]
    );
    
    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ledger entry not found'
      });
    }
    
    // Delete the entry
    await db.execute('DELETE FROM ledger_entries WHERE id = ?', [id]);
    
    // Recalculate all balances after deletion
    await recalculateAllBalances();
    
    res.json({
      success: true,
      message: 'Ledger entry deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting ledger entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ledger entry',
      error: error.message
    });
  }
});

/**
 * Helper function to recalculate all balances
 * This ensures data consistency after any modifications
 */
async function recalculateAllBalances() {
  try {
    // Get all entries ordered by date and id
    const [entries] = await db.execute(`
      SELECT id, dr_amount, cr_amount 
      FROM ledger_entries 
      ORDER BY entry_date ASC, id ASC
    `);
    
    let runningBalance = 0;

    // Update each entry with correct balance (credit increases, debit decreases)
    for (const entry of entries) {
      runningBalance += parseFloat(entry.cr_amount) - parseFloat(entry.dr_amount);

      await db.execute(
        'UPDATE ledger_entries SET balance = ? WHERE id = ?',
        [runningBalance, entry.id]
      );
    }
    
  } catch (error) {
    console.error('Error recalculating balances:', error);
    throw error;
  }
}

module.exports = router;