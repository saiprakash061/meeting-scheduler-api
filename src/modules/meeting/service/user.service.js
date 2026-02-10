const User = require('../model/user.model');
const { CreateUserDTO, UserResponseDTO } = require('../dto/user.dto');
const { AppError } = require('../../../utils/error.util');
const logger = require('../../../utils/logger.util');

class UserService {
    async createUser(userData) {
        try {
            const createUserDTO = new CreateUserDTO(userData);
            const validation = createUserDTO.validate();

            if (!validation.isValid) {
                throw new AppError(validation.errors.join(', '), 400);
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: createUserDTO.email }).notDeleted();

            if (existingUser) {
                throw new AppError('User with this email already exists', 400);
            }

            const user = await User.create({
                name: createUserDTO.name,
                email: createUserDTO.email,
                password: createUserDTO.password,
                timezone: createUserDTO.timezone
            });

            logger.info(`User created: ${user._id}`);
            return new UserResponseDTO(user.toSafeObject());
        } catch (error) {
            logger.error(`Error creating user: ${error.message}`);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            const user = await User.findById(userId).notDeleted();

            if (!user) {
                throw new AppError('User not found', 404);
            }

            return new UserResponseDTO(user.toSafeObject());
        } catch (error) {
            if (error.name === 'CastError') {
                throw new AppError('Invalid user ID', 400);
            }
            logger.error(`Error fetching user: ${error.message}`);
            throw error;
        }
    }

    async getAllUsers(page = 1, limit = 1) {
        try {
            const skip = (page - 1) * limit;

            const [users, total] = await Promise.all([
                User.find().notDeleted()
                    .select('-password')
                    .limit(parseInt(limit))
                    .skip(skip)
                    .sort({ createdAt: -1 }),
                User.countDocuments({ deletedAt: null })
            ]);

            return {
                users: users.map(user => new UserResponseDTO(user.toObject())),
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error(`Error fetching users: ${error.message}`);
            throw error;
        }
    }

    async updateUser(userId, updateData) {
        try {
            const user = await User.findById(userId).notDeleted();

            if (!user) {
                throw new AppError('User not found', 404);
            }

            // Don't allow email update if it's taken by another user
            if (updateData.email && updateData.email !== user.email) {
                const existingUser = await User.findOne({
                    email: updateData.email,
                    _id: { $ne: userId }
                }).notDeleted();

                if (existingUser) {
                    throw new AppError('Email already in use', 400);
                }
            }

            // Update user fields
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    user[key] = updateData[key];
                }
            });

            await user.save();
            logger.info(`User updated: ${userId}`);

            return new UserResponseDTO(user.toSafeObject());
        } catch (error) {
            if (error.name === 'CastError') {
                throw new AppError('Invalid user ID', 400);
            }
            logger.error(`Error updating user: ${error.message}`);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const user = await User.findById(userId).notDeleted();

            if (!user) {
                throw new AppError('User not found', 404);
            }

            await user.softDelete();
            logger.info(`User deleted: ${userId}`);

            return { message: 'User deleted successfully' };
        } catch (error) {
            if (error.name === 'CastError') {
                throw new AppError('Invalid user ID', 400);
            }
            logger.error(`Error deleting user: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new UserService();
