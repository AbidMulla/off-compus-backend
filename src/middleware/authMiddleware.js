const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.split(' ')[1];

        console.log('Authorization Header:', authHeader);
        console.log('Extracted Token:', token);

        if (!authHeader || !authHeader.startsWith('Bearer ') || !token) {
            console.warn('Token missing or invalid format');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided or invalid format'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded JWT:', decoded);
            req.user = decoded;
            next();

        } catch (jwtError) {
            console.error('JWT Verification Error:', jwtError.message);
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

    } catch (error) {
        console.error('Unexpected Error in verifyToken:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    verifyToken
};
