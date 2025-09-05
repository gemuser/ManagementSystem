const { generateVATBillBuffer } = require('../generateVATBillMemory');
const path = require('path');
const fs = require('fs');

/**
 * Generate VAT Bill PDF for a sale
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateVATBillForSale = async (req, res) => {
  try {
    const {
      customerName,
      itemName,
      price,
      quantity = 1,
      vatRate = 13
    } = req.body;

    // Validate required fields
    if (!customerName || !itemName || !price) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, item name, and price are required'
      });
    }

    // Calculate VAT and total
    const itemPrice = parseFloat(price) * parseInt(quantity);
    const vatAmount = (itemPrice * vatRate) / 100;
    const totalAmount = itemPrice + vatAmount;

    // Prepare bill data
    const billData = {
      customerName: customerName,
      invoiceDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      itemName: `${itemName} (Qty: ${quantity})`,
      price: `Rs. ${itemPrice.toLocaleString()}`,
      vat: `Rs. ${vatAmount.toLocaleString()}`,
      total: `Rs. ${totalAmount.toLocaleString()}`
    };

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `bill-${customerName.replace(/\s+/g, '-')}-${timestamp}.pdf`;

    // Generate the VAT bill PDF in memory
    const pdfBuffer = await generateVATBillBuffer(billData, {
      billType: 'inventory',
      title: 'Inventory Bill'
    });

    // Send the PDF file as response (without attachment header to prevent auto-download)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Suggested-Filename', filename); // Custom header for filename suggestion
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating  bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate  bill',
      error: error.message
    });
  }
};

/**
 * Generate VAT Bill with custom data (for multiple items)
 * @param {Object} req - Express request object  
 * @param {Object} res - Express response object
 */
const generateVATBillMemory = async (req, res) => {
  try {
    const { 
      customerName, 
      invoiceNumber,
      invoiceDate,
      items,
      subtotal,
      vatRate = 13,
      vatAmount,
      grandTotal
    } = req.body;

    // Validate required fields
    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and cannot be empty'
      });
    }

    // Prepare bill data for multiple items
    const billData = {
      customerName: customerName,
      invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
      invoiceDate: invoiceDate || new Date().toLocaleDateString(),
      items: items,
      subtotal: subtotal || 0,
      vatRate: vatRate,
      vatAmount: vatAmount || (subtotal * vatRate / 100),
      grandTotal: grandTotal || (subtotal * (1 + vatRate / 100))
    };

    // Generate the VAT bill PDF in memory
    const pdfBuffer = await generateVATBillBuffer(billData, {
      billType: 'inventory',
      title: 'Inventory Bill'
    });

    // Send the PDF file as response (without attachment header to prevent auto-download)
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating VAT bill memory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate VAT bill',
      error: error.message
    });
  }
};

/**
 * Generate VAT Bill with custom data
 * @param {Object} req - Express request object  
 * @param {Object} res - Express response object
 */
const generateCustomVATBill = async (req, res) => {
  try {
    const billData = req.body;

    // Validate that at least customer name is provided
    if (!billData.customerName) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `custom-bill-${billData.customerName.replace(/\s+/g, '-')}-${timestamp}.pdf`;

    // Generate the VAT bill PDF in memory
    const pdfBuffer = await generateVATBillBuffer(billData, {
      billType: 'inventory',
      title: 'Custom Inventory Bill'
    });

    // Send the PDF file as response (without attachment header to prevent auto-download)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Suggested-Filename', filename); // Custom header for filename suggestion
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating custom VAT bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate custom VAT bill',
      error: error.message
    });
  }
};

/**
 * List all generated VAT bills
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const listGeneratedBills = async (req, res) => {
  try {
    const billsDir = path.join(__dirname, '../generated-bills');
    
    if (!fs.existsSync(billsDir)) {
      return res.json({
        success: true,
        data: []
      });
    }

    const files = fs.readdirSync(billsDir);
    const pdfFiles = files
      .filter(file => file.endsWith('.pdf'))
      .map(file => {
        const filePath = path.join(billsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          createdAt: stats.birthtime,
          size: stats.size
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first

    res.json({
      success: true,
      data: pdfFiles
    });

  } catch (error) {
    console.error('Error listing VAT bills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list VAT bills',
      error: error.message
    });
  }
};

/**
 * Download a specific VAT bill
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const downloadVATBill = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../generated-bills', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'VAT bill not found'
      });
    }

    // Security check - ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error downloading  bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download  bill',
      error: error.message
    });
  }
};

module.exports = {
  generateVATBillForSale,
  generateCustomVATBill,
  generateVATBillMemory,
  listGeneratedBills,
  downloadVATBill
};
