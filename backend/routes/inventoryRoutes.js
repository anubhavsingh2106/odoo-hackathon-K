const express = require('express');
const router = express.Router();
const db = require('../config/db'); // The pool
const auth = require('../middleware/authMiddleware');

// Helper: Update or Insert Stock Level
async function updateStock(connection, productId, locationId, quantity, type) {
    // Check if stock record exists for this product at this location
    const [rows] = await connection.query(
        'SELECT quantity FROM stock_levels WHERE product_id = ? AND location_id = ?',
        [productId, locationId]
    );

    if (rows.length === 0) {
        // If record doesn't exist, insert it
        // If we are subtracting from non-existent stock, throw error
        if (type === 'SUBTRACT') throw new Error('Insufficient stock or invalid location');
        
        await connection.query(
            'INSERT INTO stock_levels (product_id, location_id, quantity) VALUES (?, ?, ?)',
            [productId, locationId, quantity]
        );
    } else {
        // Update existing
        const currentQty = rows[0].quantity;
        if (type === 'SUBTRACT' && currentQty < quantity) {
            throw new Error(`Insufficient stock at location ID ${locationId}`);
        }

        const operator = type === 'ADD' ? '+' : '-';
        await connection.query(
            `UPDATE stock_levels SET quantity = quantity ${operator} ? WHERE product_id = ? AND location_id = ?`,
            [quantity, productId, locationId]
        );
    }
}

// EXECUTE MOVE (IN, OUT, TRANSFER)
router.post('/move', auth, async (req, res) => {
    const { productId, type, fromLocation, toLocation, quantity, reference } = req.body;
    const userId = req.user.id; // From Middleware

    // Get a dedicated connection for the transaction
    const connection = await db.getConnection(); 

    try {
        await connection.beginTransaction(); // START TRANSACTION

        // 1. Log the Movement (The Ledger)
        await connection.query(
            `INSERT INTO movements (product_id, type, from_location_id, to_location_id, quantity, user_id, reference_doc) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [productId, type, fromLocation || null, toLocation || null, quantity, userId, reference]
        );

        // 2. Adjust Stock Levels based on Operation Type
        switch (type) {
            case 'IN': // Vendor -> Warehouse
                if (!toLocation) throw new Error('Destination location required for Receipts');
                await updateStock(connection, productId, toLocation, quantity, 'ADD');
                break;

            case 'OUT': // Warehouse -> Customer
                if (!fromLocation) throw new Error('Source location required for Deliveries');
                await updateStock(connection, productId, fromLocation, quantity, 'SUBTRACT');
                break;

            case 'TRANSFER': // Warehouse A -> Warehouse B
                if (!fromLocation || !toLocation) throw new Error('Source and Destination required for Transfer');
                await updateStock(connection, productId, fromLocation, quantity, 'SUBTRACT');
                await updateStock(connection, productId, toLocation, quantity, 'ADD');
                break;
            
            case 'ADJUSTMENT': // Correction
                // Logic: If quantity is positive, we ADD. If negative, SUBTRACT.
                // The frontend should send absolute quantity and we determine logic here, 
                // OR frontend sends "ADD/SUBTRACT". Let's assume simple ADD logic for now.
                // For advanced adjustment, usually you send the "New Physical Count" and backend calc differences.
                // We will stick to "Add/Remove this amount" for simplicity.
                if (!fromLocation) throw new Error('Location required');
                await updateStock(connection, productId, fromLocation, quantity, 'ADD'); 
                break;
        }

        await connection.commit(); // SAVE CHANGES
        res.status(200).json({ message: 'Stock operation successful' });

    } catch (err) {
        await connection.rollback(); // UNDO CHANGES IF ERROR
        res.status(400).json({ error: err.message });
    } finally {
        connection.release(); // Release connection back to pool
    }
});

// GET MOVEMENT HISTORY
router.get('/history', auth, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT m.*, p.name as product_name, u.name as user_name,
            l1.name as from_loc, l2.name as to_loc
            FROM movements m
            JOIN products p ON m.product_id = p.id
            JOIN users u ON m.user_id = u.id
            LEFT JOIN locations l1 ON m.from_location_id = l1.id
            LEFT JOIN locations l2 ON m.to_location_id = l2.id
            ORDER BY m.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;