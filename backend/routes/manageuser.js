const express = require('express');
const router = express.Router();
const ManageUserController = require('../controllers/ManageUserController');

const admin = require('../middlewares/admin');
const isAuthenticatedUser = require('../middlewares/auth');

router.get('/users', isAuthenticatedUser, admin, ManageUserController.getAllUsers);
router.get('/users/:id',  isAuthenticatedUser, admin, ManageUserController.getUserById);
router.put('/users/:id',  isAuthenticatedUser, admin, ManageUserController.updateUserRoleStatus);

module.exports = router;
