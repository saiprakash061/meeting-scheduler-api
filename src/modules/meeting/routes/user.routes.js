const express = require('express');
const router = express.Router();
const userController = require('../interface/user.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

router.post('/', userController.createUser);

router.get('/:id', userController.getUser);

router.get('/', userController.getAllUsers);

router.put('/:id', authenticate, userController.updateUser);

router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;


