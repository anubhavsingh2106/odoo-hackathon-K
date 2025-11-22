const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// GET USERS (Pending/All)
router.get('/users', auth, checkRole(['admin']), async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, status, created_at FROM users WHERE role != "admin" ORDER BY created_at DESC');
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// APPROVE/REJECT USER
router.put('/users/:id', auth, checkRole(['admin']), async (req, res) => {
    const { status } = req.body; 
    const userId = req.params.id;

    try {
        await db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
        res.json({ message: `User ${status} successfully.` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;