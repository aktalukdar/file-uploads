const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    let authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.userId, email: decoded.email };
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Token invalid or expired' });
    }
}

module.exports = authMiddleware;
