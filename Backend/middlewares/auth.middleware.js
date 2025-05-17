const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.'
        });
    }
};

exports.authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
    });
};

exports.authorizeOwnerOrAdmin = (req, res, next) => {
    if (req.user) {
        if (req.user.role === 'admin' || req.user.id === parseInt(req.params.userId)) {
            return next();
        }
    }

    return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
    });
};