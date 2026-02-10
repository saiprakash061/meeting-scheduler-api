const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const { LoginDTO, UserResponseDTO } = require('../dto/user.dto');
const { AppError } = require('../../../utils/error.util');
const logger = require('../../../utils/logger.util');
const config = require('../../../config/app.config');

class AuthService {
    generateToken(userId) {
        return jwt.sign(
            { userId },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
    }

    async login(credentials) {
        try {
            const loginDTO = new LoginDTO(credentials);
            const validation = loginDTO.validate();

            if (!validation.isValid) {
                throw new AppError(validation.errors.join(', '), 400);
            }

            // Find user by email (Mongoose syntax)
            const user = await User.findOne({ email: loginDTO.email }).notDeleted();

            if (!user) {
                throw new AppError('Invalid email or password', 401);
            }

            // Verify password
            const isPasswordValid = await user.comparePassword(loginDTO.password);

            if (!isPasswordValid) {
                throw new AppError('Invalid email or password', 401);
            }

            // Generate JWT token
            const token = this.generateToken(user._id);

            logger.info(`User logged in: ${user._id}`);

            return {
                user: new UserResponseDTO(user.toSafeObject()),
                token
            };
        } catch (error) {
            logger.error(`Login error: ${error.message}`);
            throw error;
        }
    }

    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret);

            // Mongoose syntax
            const user = await User.findById(decoded.userId).notDeleted();

            if (!user) {
                throw new AppError('User not found', 404);
            }

            return user;
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new AppError('Invalid token', 401);
            }
            if (error.name === 'TokenExpiredError') {
                throw new AppError('Token expired', 401);
            }
            throw error;
        }
    }
}

module.exports = new AuthService();
