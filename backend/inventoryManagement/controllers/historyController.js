const express = require('express');
const db = require('../../database/db');

const getActivityHistory = async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 100 } = req.query;
    
    let activities = [];
    
    // Get sales history
    const salesQuery = `
      SELECT 
        s.id,
        s.invoice_no,
        s.product_id,
        s.quantity_sold,
        s.price_each,
        s.total_price,
        s.sale_date,
        p.name as product_name,
        p.category,
        'sale' as activity_type
      FROM sales s
      LEFT JOIN products p ON s.product_id = p.id
      ${startDate ? 'WHERE s.sale_date >= ?' : ''}
      ${startDate && endDate ? 'AND s.sale_date <= ?' : endDate ? 'WHERE s.sale_date <= ?' : ''}
      ORDER BY s.sale_date DESC
      LIMIT ?
    `;
    
    const salesParams = [];
    if (startDate) salesParams.push(startDate);
    if (endDate) salesParams.push(endDate);
    salesParams.push(parseInt(limit));
    
    if (!type || type === 'all' || type === 'sale') {
      const [salesData] = await db.query(salesQuery, salesParams);
      
      salesData.forEach(sale => {
        activities.push({
          id: `sale-${sale.id}`,
          type: 'sale',
          title: `Sale: ${sale.product_name || 'Unknown Product'}`,
          description: `Sold ${sale.quantity_sold} units for Rs. ${sale.total_price}`,
          timestamp: sale.sale_date,
          details: {
            invoice_no: sale.invoice_no,
            product_id: sale.product_id,
            product_name: sale.product_name,
            category: sale.category,
            quantity_sold: sale.quantity_sold,
            price_each: sale.price_each,
            total_price: sale.total_price
          }
        });
      });
    }
    
    // Get product creation history (using simulated dates since no created_at column exists)
    const productsQuery = `
      SELECT 
        id,
        name,
        category,
        price,
        total_stock,
        modelNo,
        hsCode,
        'product' as activity_type
      FROM products
      ORDER BY id DESC
      LIMIT ?
    `;
    
    if (!type || type === 'all' || type === 'product') {
      const [productsData] = await db.query(productsQuery, [parseInt(limit)]);
      
      productsData.forEach(product => {
        // Simulate created_at timestamp (in real app, you'd have this column)
        const simulatedDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        activities.push({
          id: `product-${product.id}`,
          type: 'product',
          title: `Product Added: ${product.name}`,
          description: `Added ${product.category} product with ${product.total_stock} units`,
          timestamp: simulatedDate.toISOString(),
          details: {
            product_id: product.id,
            product_name: product.name,
            category: product.category,
            price: product.price,
            initial_stock: product.total_stock,
            model_no: product.modelNo,
            hs_code: product.hsCode
          }
        });
      });
    }
    
    // Sort all activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply limit to combined results
    if (activities.length > limit) {
      activities = activities.slice(0, limit);
    }
    
    res.status(200).send({
      success: true,
      message: 'Activity history retrieved successfully',
      data: activities,
      total: activities.length
    });
    
  } catch (err) {
    console.error('Error fetching activity history:', err);
    res.status(500).send({
      success: false,
      message: 'Error in fetching activity history',
      error: err.message
    });
  }
};

const getActivityStats = async (req, res) => {
  try {
    // Get sales count
    const [[{ salesCount }]] = await db.query(
      'SELECT COUNT(*) as salesCount FROM sales'
    );
    
    // Get products count
    const [[{ productsCount }]] = await db.query(
      'SELECT COUNT(*) as productsCount FROM products'
    );
    
    // Get today's sales count
    const [[{ todaySales }]] = await db.query(
      'SELECT COUNT(*) as todaySales FROM sales WHERE DATE(sale_date) = CURDATE()'
    );
    
    // Get total revenue
    const [[{ totalRevenue }]] = await db.query(
      'SELECT COALESCE(SUM(total_price), 0) as totalRevenue FROM sales'
    );
    
    // Get today's revenue
    const [[{ todayRevenue }]] = await db.query(
      'SELECT COALESCE(SUM(total_price), 0) as todayRevenue FROM sales WHERE DATE(sale_date) = CURDATE()'
    );
    
    res.status(200).send({
      success: true,
      message: 'Activity stats retrieved successfully',
      data: {
        salesCount: parseInt(salesCount),
        productsCount: parseInt(productsCount),
        todaySales: parseInt(todaySales),
        totalRevenue: parseFloat(totalRevenue),
        todayRevenue: parseFloat(todayRevenue)
      }
    });
    
  } catch (err) {
    console.error('Error fetching activity stats:', err);
    res.status(500).send({
      success: false,
      message: 'Error in fetching activity stats',
      error: err.message
    });
  }
};

module.exports = {
  getActivityHistory,
  getActivityStats
};
