const express = require('express');
const router = express.Router();
const ManageUserController = require('../controllers/ManageUserController');

router.get('/users', ManageUserController.getAllUsers);
router.get('/users/:id', ManageUserController.getUserById);
router.put('/users/:id', ManageUserController.updateUserRoleStatus);

module.exports = router;
