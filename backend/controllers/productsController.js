const db = require('../database/db');

const getProducts = async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM products');
        if (!data || data[0].length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No products found'
            });
        }
        res.status(200).send({
            success: true,
            message: 'Product retrived successfully',
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
        const data = await db.query(
            'UPDATE products SET name = ?, category = ?, price = ?, modelNo = ?, hsCode = ?, total_stock = ? WHERE id = ?',
            [name, category, price, modelNo, hsCode, total_stock, id]
        );
        if (data[0].affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'product not found or no changes made'
            })
        }
        res.status(200).send({
            success: true,
            message: 'Product updated successfully'
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: 'Error in updating product',
            err
        })
    }

}

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
