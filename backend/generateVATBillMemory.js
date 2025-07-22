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
 * Generate HTML content with VAT template background and overlaid text
 * @param {Object} billData - The data to overlay
 * @param {Object} options - Additional options for customization
 * @returns {string} HTML content
 */
function generateHTMLContent(billData, options = {}) {
  // Get the absolute path to the VAT template image
  const templateImagePath = path.join(__dirname, 'assets', 'vat-template.jpg');
  
  // Check if template exists and create base64 or use placeholder
  let backgroundStyle = '';
  if (fs.existsSync(templateImagePath)) {
    try {
      const imageBuffer = fs.readFileSync(templateImagePath);
      const imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
      backgroundStyle = `background-image: url('${imageBase64}');`;
      console.log('📷 Using VAT template image from assets/vat-template.jpg');
    } catch (error) {
      console.warn('⚠️  Error reading template image, using placeholder');
      backgroundStyle = generatePlaceholderBackground();
    }
  } else {
    console.warn('⚠️  VAT template image not found at assets/vat-template.jpg, using placeholder');
    backgroundStyle = generatePlaceholderBackground();
  }

  // Default positions (can be overridden via options)
  const positions = {
    customerName: { top: '150px', left: '100px' },
    invoiceDate: { top: '190px', left: '100px' },
    itemName: { top: '230px', left: '100px' },
    price: { top: '270px', left: '100px' },
    vatAmount: { top: '310px', left: '100px' },
    total: { top: '350px', left: '100px' },
    ...options.positions // Override with custom positions if provided
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VAT Bill</title>
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
                position: relative;
                overflow: hidden;
            }
            
            .vat-bill-container {
                position: relative;
                width: 100%;
                height: 100%;
                ${backgroundStyle}
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
            }
            
            .overlay-text {
                position: absolute;
                font-size: 14px;
                font-weight: 600;
                color: #000;
                z-index: 10;
                white-space: nowrap;
            }
            
            .customer-name {
                top: ${positions.customerName.top};
                left: ${positions.customerName.left};
            }
            
            .invoice-date {
                top: ${positions.invoiceDate.top};
                left: ${positions.invoiceDate.left};
            }
            
            .item-name {
                top: ${positions.itemName.top};
                left: ${positions.itemName.left};
                max-width: 600px;
            }
            
            .items-table {
                position: absolute;
                top: 250px;
                left: 50px;
                right: 50px;
                font-size: 12px;
            }
            
            .items-table table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            
            .items-table th,
            .items-table td {
                border: 1px solid #d1d5db;
                padding: 8px;
                text-align: left;
            }
            
            .items-table th {
                background-color: #f3f4f6;
                font-weight: bold;
            }
            
            .items-table td:last-child,
            .items-table th:last-child {
                text-align: right;
            }
            
            .price {
                top: ${positions.price.top};
                left: ${positions.price.left};
            }
            
            .summary-section {
                position: absolute;
                bottom: 150px;
                right: 50px;
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border: 2px solid #d1d5db;
                border-radius: 8px;
                min-width: 250px;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
            }
            
            .summary-row.total {
                border-top: 2px solid #374151;
                padding-top: 10px;
                font-size: 16px;
                font-weight: bold;
                color: #059669;
            }
            
            .vat-amount {
                top: ${positions.vatAmount.top};
                left: ${positions.vatAmount.left};
            }
            
            .total {
                top: ${positions.total.top};
                left: ${positions.total.left};
                font-weight: bold;
                font-size: 16px;
                color: #d97706;
            }
            
            .field-label {
                font-weight: normal;
                color: #374151;
                margin-right: 8px;
            }
            
            .field-value {
                font-weight: bold;
                color: #111827;
            }

            /* Invoice number and company info */
            .invoice-header {
                position: absolute;
                top: 50px;
                right: 50px;
                text-align: right;
                font-size: 12px;
                color: #6b7280;
            }

            .invoice-number {
                font-size: 14px;
                font-weight: bold;
                color: #111827;
                margin-bottom: 5px;
            }
        </style>
    </head>
    <body>
        <div class="vat-bill-container">
            <!-- Invoice Header -->
            <div class="invoice-header">
                <div class="invoice-number">Invoice #${billData.invoiceNumber || generateInvoiceNumber()}</div>
                <div>Management System</div>
                <div>${billData.invoiceDate || new Date().toLocaleDateString()}</div>
            </div>

            <!-- Customer Name -->
            <div class="overlay-text customer-name">
                <span class="field-label">Customer:</span>
                <span class="field-value">${billData.customerName || 'N/A'}</span>
            </div>
            
            <!-- Invoice Date -->
            <div class="overlay-text invoice-date">
                <span class="field-label">Date:</span>
                <span class="field-value">${billData.invoiceDate || new Date().toLocaleDateString()}</span>
            </div>
            
            ${billData.items && billData.items.length > 1 ? 
              // Multiple items - use table format
              `<div class="items-table">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>HS Code</th>
                      <th style="text-align: center;">Qty</th>
                      <th style="text-align: right;">Unit Price</th>
                      <th style="text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${billData.items.map(item => `
                      <tr>
                        <td>${item.productName || 'N/A'}</td>
                        <td>${item.hsCode || '0000.00'}</td>
                        <td style="text-align: center;">${item.quantity || 1}</td>
                        <td style="text-align: right;">Rs. ${parseFloat(item.price || 0).toFixed(2)}</td>
                        <td style="text-align: right;">Rs. ${parseFloat(item.total || 0).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              
              <div class="summary-section">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>Rs. ${parseFloat(billData.subtotal || 0).toFixed(2)}</span>
                </div>
                <div class="summary-row">
                  <span>VAT (${billData.vatRate || 13}%):</span>
                  <span>Rs. ${parseFloat(billData.vatAmount || 0).toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                  <span>TOTAL:</span>
                  <span>Rs. ${parseFloat(billData.grandTotal || 0).toFixed(2)}</span>
                </div>
              </div>`
              :
              // Single item - use original format
              `<!-- Item Name -->
              <div class="overlay-text item-name">
                  <span class="field-label">Item:</span>
                  <span class="field-value">${billData.itemName || (billData.items && billData.items[0] ? billData.items[0].productName : 'N/A')}</span>
              </div>
              
              <!-- Price -->
              <div class="overlay-text price">
                  <span class="field-label">Price:</span>
                  <span class="field-value">${billData.price || (billData.items && billData.items[0] ? `Rs. ${parseFloat(billData.items[0].total || 0).toFixed(2)}` : 'N/A')}</span>
              </div>
              
              <!-- VAT Amount -->
              <div class="overlay-text vat-amount">
                  <span class="field-label">VAT (${billData.vatRate || 13}%):</span>
                  <span class="field-value">${billData.vat || `Rs. ${parseFloat(billData.vatAmount || 0).toFixed(2)}`}</span>
              </div>
              
              <!-- Total -->
              <div class="overlay-text total">
                  <span class="field-label">TOTAL:</span>
                  <span class="field-value">${billData.total || `Rs. ${parseFloat(billData.grandTotal || 0).toFixed(2)}`}</span>
              </div>`
            }
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

module.exports = {
  generateVATBillBuffer
};
