const authService = require('../modules/meeting/service/auth.service');
const { AppError } = require('../utils/error.util');

const authenticate = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided. Access denied', 401);
        }

        const token = authHeader.substring(7);

        const user = await authService.verifyToken(token);

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

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

        next();
    }
};

module.exports = {
    authenticate,
    optionalAuthenticate
};


