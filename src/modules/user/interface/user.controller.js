const userService = require('../service/user.service');
const authService = require('../service/auth.service');
const { asyncHandler } = require('../../../utils/async.util');

class UserController {

    createUser = asyncHandler(async (req, res) => {
        const user = await userService.createUser(req.body);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    });

    getUser = asyncHandler(async (req, res) => {
        const user = await userService.getUserById(req.params.id);

        res.status(200).json({
            success: true,
            data: user
        });
    });

    getAllUsers = asyncHandler(async (req, res) => {
        const { page = 1, limit = 1 } = req.query;
        const result = await userService.getAllUsers(page, limit);

        res.status(200).json({
            success: true,
            data: result.users,
            pagination: result.pagination
        });
    });

    updateUser = asyncHandler(async (req, res) => {
        const user = await userService.updateUser(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    });

    deleteUser = asyncHandler(async (req, res) => {
        const result = await userService.deleteUser(req.params.id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    });

    login = asyncHandler(async (req, res) => {
        const result = await authService.login(req.body);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    });

    getCurrentUser = asyncHandler(async (req, res) => {
        res.status(200).json({
            success: true,
            data: req.user
        });
    });
}

module.exports = new UserController();


