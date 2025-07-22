const express = require('express');
const db = require('../database/db');

const getSales = async (req, res) => {
    const data = await db.query('SELECT * FROM sales');
    try{
    if(!data || data[0].length === 0){
        return res.status(404).send({
            success: false,
            message: 'No sales found'
        });
    }
    res.status(200).send({
        success: true,
        message: 'Sales retrieved successfully',
        data: data[0]
    });
}catch(err){
    console.log(err);
    res.status(500).send({
        success: false,
        message: 'Error in getting sales',
        err
    });
}
};

const createSales = async (req, res) => {
  try {
    const { invoice_no, product_id, quantity_sold, sale_price } = req.body;

    // Validate inputs
    if (!invoice_no || !product_id || !quantity_sold) {
      return res.status(400).send({
        success: false,
        message: 'Please provide invoice_no, product_id, and quantity_sold',
      });
    }

    // Get product info
    const [[product]] = await db.query(
      'SELECT price, total_stock FROM products WHERE id = ?',
      [product_id]
    );

    if (!product) {
      return res.status(404).send({
        success: false,
        message: 'Product not found',
      });
    }

    // Get total sold quantity
    const [[{ total_sold }]] = await db.query(
      'SELECT SUM(quantity_sold) AS total_sold FROM sales WHERE product_id = ?',
      [product_id]
    );

    const sold = total_sold || 0;
    const remaining_stock = product.total_stock - sold;

    // Check if there's enough stock
    if (quantity_sold > remaining_stock) {
      return res.status(400).send({
        success: false,
        message: `Not enough stock. Only ${remaining_stock} units left.`,
      });
    }

    // Use custom sale price if provided, otherwise use product's default price
    const price_each = sale_price ? parseFloat(sale_price) : product.price;
    const total_price = price_each * quantity_sold;

    // Insert into sales
    await db.query(
      'INSERT INTO sales (invoice_no, product_id, quantity_sold, price_each, total_price) VALUES (?, ?, ?, ?, ?)',
      [invoice_no, product_id, quantity_sold, price_each, total_price]
    );

    res.status(201).send({
      success: true,
      message: 'Sale recorded successfully',
      sale: {
        invoice_no,
        product_id,
        quantity_sold,
        price_each,
        total_price,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: 'Error in recording sale',
      err,
    });
  }
};


module.exports = {
    getSales,
    createSales
}