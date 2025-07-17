const db = require('../database/db');
const { logStockChange } = require('./stockController');

const getProducts = async (req, res) => {
    try {
        // Get products with calculated available stock
        const data = await db.query(`
            SELECT 
                p.*,
                COALESCE(p.total_stock - COALESCE(s.total_sold, 0), p.total_stock) AS available_stock
            FROM products p
            LEFT JOIN (
                SELECT 
                    product_id, 
                    SUM(quantity_sold) AS total_sold 
                FROM sales 
                GROUP BY product_id
            ) s ON p.id = s.product_id
        `);
        
        if (!data || data[0].length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No products found'
            });
        }
        res.status(200).send({
            success: true,
            message: 'Product retrieved successfully',
            totalProduct: data[0].length,
            data: data[0]
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: 'Error in getting products',
            err
        });
    }
};

const createProducts = async (req, res) => {
    try {
        const { name, category, price, modelNo, hsCode, total_stock } = req.body;
        if (!name || !category || !price || !modelNo || !hsCode || !total_stock) {
            return res.status(400).send({
                success: false,
                message: 'please provide all fields',

            });
        }
        await db.query(
            'INSERT INTO products (name, category, price, modelNo, hsCode, total_stock) VALUES (?,?,?,?,?,?)',
            [name, category, price, modelNo, hsCode, total_stock]
        );
        res.status(201).send({
            success: true,
            message: 'Product created successfully',

        })
    }
    catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: 'error in creating products',
            err
        });
    }

}

const updateProducts = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, category, price, modelNo, hsCode, total_stock } = req.body;
        if (!name || !category || !price || !modelNo || !hsCode || !total_stock) {
            return res.status(400).send({
                success: false,
                message: 'please provide all fields'
            });
        }

        // Get current product data including old stock
        const [[currentProduct]] = await db.query(
            'SELECT total_stock, name FROM products WHERE id = ?',
            [id]
        );

        if (!currentProduct) {
            return res.status(404).send({
                success: false,
                message: 'product not found'
            });
        }

        const old_stock = parseInt(currentProduct.total_stock);
        const new_stock = parseInt(total_stock);

        // Update the product
        const data = await db.query(
            'UPDATE products SET name = ?, category = ?, price = ?, modelNo = ?, hsCode = ?, total_stock = ? WHERE id = ?',
            [name, category, price, modelNo, hsCode, total_stock, id]
        );

        if (data[0].affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'product not found or no changes made'
            });
        }

        // Log stock change if stock was modified
        if (old_stock !== new_stock) {
            await logStockChange(
                id, 
                old_stock, 
                new_stock, 
                'manual_update', 
                `Stock updated from ${old_stock} to ${new_stock} units for ${currentProduct.name}`
            );
        }

        res.status(200).send({
            success: true,
            message: 'Product updated successfully',
            stockChanged: old_stock !== new_stock,
            stockChange: old_stock !== new_stock ? {
                oldStock: old_stock,
                newStock: new_stock,
                difference: new_stock - old_stock
            } : null
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: 'Error in updating product',
            err
        });
    }
};

const deleteProducts = async (req, res) => {
    try{
        const id = req.params.id;
        const data = await db.query('DELETE FROM products WHERE id = ?', [id]);
        if (data[0].affectedRows === 0){
            return res.status(404).send({
                success: false,
                message: 'product not found'
            });
        }
        res.status(200).send({
            success: true,
            message: 'Product deleted successfully'
        })
    }
    catch(err){
        console.log(err);
        res.status(500).send({
            success: false,
            message: 'error in deleting product',
            err
        })
    }
 }


module.exports = {
    getProducts,
    createProducts,
    updateProducts,
    deleteProducts
}
