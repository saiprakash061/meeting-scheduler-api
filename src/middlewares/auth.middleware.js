const authService = require('../modules/meeting/service/auth.service');
const { AppError } = require('../utils/error.util');

const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided. Access denied', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token and get user
        const user = await authService.verifyToken(token);

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

// Optional authentication - doesn't fail if no token
const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const user = await authService.verifyToken(token);
            req.user = user;
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuthenticate
};
