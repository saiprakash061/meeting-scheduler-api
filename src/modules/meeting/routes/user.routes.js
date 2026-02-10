const express = require('express');
const router = express.Router();
const userController = require('../interface/user.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 */
router.post('/', userController.createUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', userController.getUser);

/**
 * @route   GET /api/users
 * @desc    Get all users (with pagination)
 * @access  Public
 * @query   page, limit
 */
router.get('/', userController.getAllUsers);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (requires authentication)
 */
router.put('/:id', authenticate, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private (requires authentication)
 */
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;
