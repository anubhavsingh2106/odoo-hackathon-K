const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get token from header (Format: "Bearer <token>")
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach user info (id, role) to the request object
        next(); // Continue to the next step
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};