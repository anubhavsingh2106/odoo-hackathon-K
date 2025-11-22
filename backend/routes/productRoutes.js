const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');

// GET ALL PRODUCTS (with current total stock)
router.get('/', auth, async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, c.name as category_name, 
            IFNULL(SUM(sl.quantity), 0) as total_stock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN stock_levels sl ON p.id = sl.product_id
            GROUP BY p.id
        `);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE PRODUCT
router.post('/', auth, async (req, res) => {
    const { sku, name, category_id, unit, min_stock_level } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO products (sku, name, category_id, unit, min_stock_level) VALUES (?, ?, ?, ?, ?)',
            [sku, name, category_id, unit, min_stock_level]
        );
        res.status(201).json({ message: 'Product created', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;