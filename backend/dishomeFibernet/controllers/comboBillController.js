const { generateVATBillBuffer } = require('../../inventoryManagement/generateVATBillMemory');
const db = require('../../database/db');

/**
 * Generate Combo Bill PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateComboBill = async (req, res) => {
  try {
    const { comboId } = req.params;
    
    if (!comboId) {
      return res.status(400).json({
        success: false,
        message: 'Combo ID is required'
      });
    }

    // Fetch combo details
    const [comboResult] = await db.query(
      'SELECT * FROM dishhome_fibernet_combo WHERE comboId = ?',
      [comboId]
    );

    if (comboResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Combo customer not found'
      });
    }

    const combo = comboResult[0];
    
    // Calculate bill details
    const basePrice = parseFloat(combo.totalPrice);
    const vatRate = 13; // 13% VAT rate
    const vatAmount = (basePrice * vatRate) / 100;
    const totalAmount = basePrice + vatAmount;
    const monthlyAmount = totalAmount / parseInt(combo.month || 1);

    // Determine service description based on combo type
    let serviceDescription = 'Combo Package';
    if (combo.upgradeType === 'DTH') {
      serviceDescription = 'DTH Combo Package - Direct-to-Home Television Service';
    } else if (combo.upgradeType === 'ITV') {
      serviceDescription = 'ITV Combo Package - Internet + Interactive TV Service';
    } else if (combo.dishhomeId && combo.fibernetId) {
      serviceDescription = 'Full Combo Package - DishHome + Fibernet Service';
    } else if (combo.dishhomeId) {
      serviceDescription = 'DishHome Combo Package - Television Service';
    } else if (combo.fibernetId) {
      serviceDescription = 'Fibernet Combo Package - Internet Service';
    }

    // Prepare bill data
    const billData = {
      customerName: combo.customerName || 'Combo Customer',
      customerAddress: combo.customerAddress || 'N/A',
      phoneNumber: combo.phoneNumber || 'N/A',
      invoiceDate: new Date().toISOString().split('T')[0],
      invoiceNumber: `COMBO-${combo.comboId}-${Date.now()}`,
      comboId: combo.comboId,
      serviceType: combo.upgradeType || 'Combo',
      itemName: serviceDescription,
      basePrice: `Rs. ${basePrice.toLocaleString()}`,
      duration: `${combo.month || 1} Month(s)`,
      monthlyAmount: `Rs. ${monthlyAmount.toLocaleString()}`,
      vatRate: `${vatRate}%`,
      vatAmount: `Rs. ${vatAmount.toLocaleString()}`,
      totalAmount: `Rs. ${totalAmount.toLocaleString()}`,
      // Additional combo details
      dishhomePackage: combo.dishhomePackage || 'N/A',
      fibernetPackage: combo.fibernetPackage || 'N/A',
      casId: combo.casId || 'N/A',
      status: combo.status === 1 ? 'Active' : 'Inactive'
    };

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const customerNameSafe = (combo.customerName || 'combo-customer').replace(/\s+/g, '-');
    const filename = `combo-bill-${customerNameSafe}-${combo.comboId}-${timestamp}.pdf`;

    // Generate the combo bill PDF in memory
    const pdfBuffer = await generateVATBillBuffer(billData, {
      billType: 'combo',
      title: 'Combo Service Bill',
      subtitle: `${combo.upgradeType || 'Combo'} Package Invoice`,
      showComboDetails: true
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF buffer
    res.send(pdfBuffer);

    console.log(`Combo bill generated successfully for combo ID: ${comboId}`);

  } catch (error) {
    console.error('Error generating combo bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating combo bill',
      error: error.message
    });
  }
};

/**
 * Generate Combo Bill with custom details
 * @param {Object} req - Express request object  
 * @param {Object} res - Express response object
 */
const generateCustomComboBill = async (req, res) => {
  try {
    const {
      customerName,
      customerAddress,
      phoneNumber,
      serviceType,
      basePrice,
      duration,
      vatRate = 13,
      comboId,
      dishhomePackage,
      fibernetPackage,
      casId
    } = req.body;

    // Validate required fields
    if (!customerName || !serviceType || !basePrice) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, service type, and base price are required'
      });
    }

    // Calculate bill details
    const price = parseFloat(basePrice);
    const vatAmount = (price * vatRate) / 100;
    const totalAmount = price + vatAmount;
    const months = parseInt(duration || 1);
    const monthlyAmount = totalAmount / months;

    // Prepare bill data
    const billData = {
      customerName,
      customerAddress: customerAddress || 'N/A',
      phoneNumber: phoneNumber || 'N/A',
      invoiceDate: new Date().toISOString().split('T')[0],
      invoiceNumber: `COMBO-CUSTOM-${comboId || Date.now()}`,
      comboId: comboId || 'CUSTOM',
      serviceType,
      itemName: `${serviceType} Combo Package Service`,
      basePrice: `Rs. ${price.toLocaleString()}`,
      duration: `${months} Month(s)`,
      monthlyAmount: `Rs. ${monthlyAmount.toLocaleString()}`,
      vatRate: `${vatRate}%`,
      vatAmount: `Rs. ${vatAmount.toLocaleString()}`,
      totalAmount: `Rs. ${totalAmount.toLocaleString()}`,
      dishhomePackage: dishhomePackage || 'N/A',
      fibernetPackage: fibernetPackage || 'N/A',
      casId: casId || 'N/A',
      status: 'Active'
    };

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const customerNameSafe = customerName.replace(/\s+/g, '-');
    const filename = `custom-combo-bill-${customerNameSafe}-${timestamp}.pdf`;

    // Generate the combo bill PDF in memory
    const pdfBuffer = await generateVATBillBuffer(billData, {
      billType: 'combo',
      title: 'Combo Service Bill',
      subtitle: `${serviceType} Package Invoice`,
      showComboDetails: true
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF buffer
    res.send(pdfBuffer);

    console.log(`Custom combo bill generated successfully for customer: ${customerName}`);

  } catch (error) {
    console.error('Error generating custom combo bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating custom combo bill',
      error: error.message
    });
  }
};

module.exports = {
  generateComboBill,
  generateCustomComboBill
};
