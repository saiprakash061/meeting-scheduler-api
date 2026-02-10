const express = require('express');
const router = express.Router();
const userController = require('../interface/user.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

router.post('/login', userController.login);

router.get('/me', authenticate, userController.getCurrentUser);

module.exports = router;


