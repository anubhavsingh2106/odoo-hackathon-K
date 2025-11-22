module.exports = (roles) => {
    return (req, res, next) => {
        // req.user humare authMiddleware se aaya hai
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied: You do not have permission." });
        }
        next();
    };
};