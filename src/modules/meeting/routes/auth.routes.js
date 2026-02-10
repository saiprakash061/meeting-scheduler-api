const express = require('express');
const router = express.Router();
const userController = require('../interface/user.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', userController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get('/me', authenticate, userController.getCurrentUser);

module.exports = router;
