const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token = null;
    console.log(req)
    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }
    if (!token) return res.status(401).json({ message: 'Not authorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return res.status(401).json({ message: 'User not found' });
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

exports.requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    next();
};
