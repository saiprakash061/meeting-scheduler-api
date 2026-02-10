const userService = require('../service/user.service');
const authService = require('../service/auth.service');
const { asyncHandler } = require('../../../utils/async.util');

class UserController {
    // POST /users - Create a new user
    createUser = asyncHandler(async (req, res) => {
        const user = await userService.createUser(req.body);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    });

    // GET /users/:id - Get user by ID
    getUser = asyncHandler(async (req, res) => {
        const user = await userService.getUserById(req.params.id);

        res.status(200).json({
            success: true,
            data: user
        });
    });

    // GET /users - Get all users (with pagination)
    getAllUsers = asyncHandler(async (req, res) => {
        const { page = 1, limit = 10 } = req.query;
        const result = await userService.getAllUsers(page, limit);

        res.status(200).json({
            success: true,
            data: result.users,
            pagination: result.pagination
        });
    });

    // PUT /users/:id - Update user
    updateUser = asyncHandler(async (req, res) => {
        const user = await userService.updateUser(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    });

    // DELETE /users/:id - Delete user (soft delete)
    deleteUser = asyncHandler(async (req, res) => {
        const result = await userService.deleteUser(req.params.id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    });

    // POST /auth/login - User login
    login = asyncHandler(async (req, res) => {
        const result = await authService.login(req.body);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    });

    // GET /auth/me - Get current user profile
    getCurrentUser = asyncHandler(async (req, res) => {
        res.status(200).json({
            success: true,
            data: req.user
        });
    });
}

module.exports = new UserController();
