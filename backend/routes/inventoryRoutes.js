const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Helper to calculate stock
async function executeStockUpdate(connection, productId, type, fromLoc, toLoc, qty) {
    const updateQuery = `INSERT INTO stock_levels (product_id, location_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?`;
    
    if (type === 'IN') {
        await connection.query(updateQuery, [productId, toLoc, qty, qty]);
    } else if (type === 'OUT') {
        await connection.query(`UPDATE stock_levels SET quantity = quantity - ? WHERE product_id = ? AND location_id = ?`, [qty, productId, fromLoc]);
    } else if (type === 'TRANSFER') {
        await connection.query(`UPDATE stock_levels SET quantity = quantity - ? WHERE product_id = ? AND location_id = ?`, [qty, productId, fromLoc]);
        await connection.query(updateQuery, [productId, toLoc, qty, qty]);
    }
}

// 1. REQUEST MOVEMENT (Staff = Pending, Manager = Completed)
router.post('/move', auth, async (req, res) => {
    const { productId, type, fromLocation, toLocation, quantity, reference } = req.body;
    const userId = req.user.id;
    
    // If Manager, auto-approve. If Staff, pending.
    const status = req.user.role === 'manager' ? 'COMPLETED' : 'PENDING';

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Log Movement
        await connection.query(
            `INSERT INTO movements (product_id, type, from_location_id, to_location_id, quantity, user_id, reference_doc, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [productId, type, fromLocation || null, toLocation || null, quantity, userId, reference, status]
        );

        // If Manager, update stock immediately
        if (status === 'COMPLETED') {
            await executeStockUpdate(connection, productId, type, fromLocation, toLocation, quantity);
        }

        await connection.commit();
        res.json({ message: status === 'PENDING' ? 'Request sent to Manager.' : 'Stock updated successfully.' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally { connection.release(); }
});

// 2. GET PENDING REQUESTS (Manager Only)
router.get('/pending', auth, checkRole(['manager']), async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT m.*, p.name as product_name, u.name as user_name, l1.name as from_loc, l2.name as to_loc
            FROM movements m
            JOIN products p ON m.product_id = p.id
            JOIN users u ON m.user_id = u.id
            LEFT JOIN locations l1 ON m.from_location_id = l1.id
            LEFT JOIN locations l2 ON m.to_location_id = l2.id
            WHERE m.status = 'PENDING'
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. APPROVE/REJECT REQUEST (Manager Only)
router.put('/approve/:id', auth, checkRole(['manager']), async (req, res) => {
    const { action } = req.body; // 'approve' or 'reject'
    const moveId = req.params.id;
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [rows] = await connection.query('SELECT * FROM movements WHERE id = ?', [moveId]);
        if (rows.length === 0) throw new Error("Movement not found");
        const move = rows[0];

        if (action === 'approve') {
            await executeStockUpdate(connection, move.product_id, move.type, move.from_location_id, move.to_location_id, move.quantity);
            await connection.query('UPDATE movements SET status = "COMPLETED" WHERE id = ?', [moveId]);
        } else {
            await connection.query('UPDATE movements SET status = "REJECTED" WHERE id = ?', [moveId]);
        }

        await connection.commit();
        res.json({ message: `Request ${action}d` });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally { connection.release(); }
});

// 4. GET HISTORY (All)
router.get('/history', auth, async (req, res) => {
    // ... (Use previous history code) ...
    // For brevity, assume standard select * from movements
    const [rows] = await db.query(`SELECT m.*, p.name as product_name, u.name as user_name, status FROM movements m JOIN products p ON m.product_id = p.id JOIN users u ON m.user_id = u.id ORDER BY created_at DESC`);
    res.json(rows);
});

module.exports = router;