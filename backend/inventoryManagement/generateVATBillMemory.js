const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Generate VAT Bill PDF in memory (returns buffer without saving to disk)
 * @param {Object} billData - The data to overlay on the VAT bill
 * @param {Object} options - Additional options for positioning and styling
 * @returns {Buffer} - PDF buffer
 */
async function generateVATBillBuffer(billData, options = {}) {
  let browser;
  
  try {
    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set page size to A4
    await page.setViewport({
      width: 794,  // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      deviceScaleFactor: 1
    });

    // Generate HTML content with the VAT template as background
    const htmlContent = generateHTMLContent(billData, options);
    
    // Set the HTML content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF as buffer (in memory)
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });

    console.log('✅ VAT Bill PDF generated in memory');
    return pdfBuffer;

  } catch (error) {
    console.error('❌ Error generating VAT Bill PDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate HTML content with VAT template structure matching the provided format
 * @param {Object} billData - The data to overlay
 * @param {Object} options - Additional options for customization
 * @returns {string} HTML content
 */
function generateHTMLContent(billData, options = {}) {
  // Generate invoice number if not provided
  const invoiceId = billData.invoiceId || generateInvoiceNumber();
  const invoiceDate = billData.invoiceDate || new Date().toLocaleDateString('en-GB');
  
  // Determine border color and background color based on bill type or title
  let borderColor = '#000'; // Default black
  let backgroundColor = 'white'; // Default white background
  const billType = options.billType || options.title || '';
  
  if (billType.toLowerCase().includes('inventory')) {
    borderColor = '#800080'; // Purple for Inventory bills
    backgroundColor = '#E6D7FF'; // Light purple background for Inventory bills
  } else if (billType.toLowerCase().includes('dhi') || billType.toLowerCase().includes('combo')) {
    borderColor = '#0066CC'; // Blue for DHI/Combo bills
    backgroundColor = '#E6F3FF'; // Light blue background for DHI/Combo bills
  } else if (billType.toLowerCase().includes('dishhome')) {
    borderColor = '#FF0000'; // Red for DishHome bills
    backgroundColor = '#FFE6E6'; // Light red background for DishHome bills
  } else if (billType.toLowerCase().includes('fibernet')) {
    borderColor = '#000000'; // Black for Fibernet bills
    backgroundColor = '#F5F5F5'; // Light gray background for Fibernet bills
  } else if (billType.toLowerCase().includes('purchase')) {
    borderColor = '#FFA500'; // Orange for purchase bills
    backgroundColor = '#FFF4E6'; // Light orange background for Purchase bills
  } else {
    borderColor = '#008000'; // Green for other bills
    backgroundColor = '#E6FFE6'; // Light green background for other bills
  }
  
  // Calculate totals if items are provided
  let subtotal = 0;
  if (billData.items && billData.items.length > 0) {
    subtotal = billData.items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  } else if (billData.subtotal) {
    subtotal = parseFloat(billData.subtotal);
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bill</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                width: 794px;
                height: 1123px;
                padding: 40px;
                background: ${backgroundColor};
            }
            
            .invoice-container {
                width: 100%;
                height: 100%;
                border: 2px solid ${borderColor};
                padding: 20px;
                position: relative;
                background: white;
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .nepali-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 20px;
                font-family: 'Devanagari MT', 'Noto Sans Devanagari', serif;
            }
            
            .invoice-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                font-size: 14px;
            }
            
            .customer-info {
                margin-bottom: 30px;
                font-size: 14px;
            }
            
            .items-section {
                margin-bottom: 30px;
            }
            
            .items-title {
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            
            .items-table th,
            .items-table td {
                border: 2px solid #000000;
                padding: 8px;
                text-align: center;
                font-size: 12px;
            }
            
            .items-table th {
                background-color: #f8f9fa;
                font-weight: bold;
            }
            
            .items-table td:nth-child(2) {
                text-align: left;
                padding-left: 10px;
            }
            
            .items-table td:nth-child(3),
            .items-table td:nth-child(4),
            .items-table td:nth-child(5) {
                text-align: right;
                padding-right: 10px;
            }
            
            .subtotal-section {
                text-align: right;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header with Nepali Title -->
            <div class="header">
                <div class="nepali-title">ॐ श्री गणेशाय नमः</div>
            </div>
            
            <!-- Invoice Information -->
            <div class="invoice-info">
                <div>
                    <strong>Invoice id: ${invoiceId}</strong>
                </div>
                <div>
                    <strong>Date: ${invoiceDate}</strong>
                </div>
            </div>
            
            <!-- Customer Information -->
            <div class="customer-info">
                <strong>Customer Name: ${billData.customerName || '_'.repeat(50)}</strong>
            </div>
            
            <!-- Items Section -->
            <div class="items-section">
                <div class="items-title">Items Purchased</div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>S.N</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${billData.items && billData.items.length > 0 
                          ? billData.items.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${item.productName || item.name || ''}</td>
                                <td>Rs. ${parseFloat(item.price || item.unit_price || 0).toFixed(2)}</td>
                                <td>${item.quantity || 1}</td>
                                <td>Rs. ${parseFloat(item.total || (item.price * item.quantity) || 0).toFixed(2)}</td>
                            </tr>
                          `).join('')
                          : `
                            <tr>
                                <td>1</td>
                                <td>${billData.itemName || ''}</td>
                                <td>Rs. ${parseFloat(billData.price || 0).toFixed(2)}</td>
                                <td>${billData.quantity || 1}</td>
                                <td>Rs. ${parseFloat(billData.total || billData.price || 0).toFixed(2)}</td>
                            </tr>
                          `
                        }
                    </tbody>
                </table>
            </div>
            
            <!-- Subtotal Section -->
            <div class="subtotal-section">
                Sub Total: Rs. ${parseFloat(subtotal).toFixed(2)}
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generate placeholder background when template image is not available
 */
function generatePlaceholderBackground() {
  return `
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border: 2px solid #cbd5e0;
    background-image: 
      radial-gradient(circle at 25% 25%, #e2e8f0 2px, transparent 2px),
      radial-gradient(circle at 75% 75%, #e2e8f0 2px, transparent 2px);
    background-size: 50px 50px;
  `;
}

/**
 * Generate a simple invoice number
 */
function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
  return `INV-${year}${month}${day}-${time}`;
}

/**
 * Calculate VAT amount (13% in Nepal)
 * @param {number} amount - The amount to calculate VAT for
 * @returns {number} VAT amount
 */
function calculateVAT(amount) {
  return parseFloat(amount) * 0.13;
}

/**
 * Calculate total with VAT
 * @param {number} subtotal - The subtotal amount
 * @param {number} discount - The discount amount (optional)
 * @returns {Object} Calculation breakdown
 */
function calculateTotalWithVAT(subtotal, discount = 0) {
  const discountedSubtotal = parseFloat(subtotal) - parseFloat(discount);
  const vatAmount = calculateVAT(discountedSubtotal);
  const grandTotal = discountedSubtotal + vatAmount;
  
  return {
    subtotal: parseFloat(subtotal),
    discount: parseFloat(discount),
    discountedSubtotal,
    vatAmount,
    grandTotal
  };
}

module.exports = {
  generateVATBillBuffer,
  generateInvoiceNumber,
  calculateVAT,
  calculateTotalWithVAT
};
