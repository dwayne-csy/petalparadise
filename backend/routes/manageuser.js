const express = require('express');
const router = express.Router();
const ManageUserController = require('../controllers/ManageUserController');

const admin = require('../middlewares/admin');

const auth = require('../middlewares/auth');

router.get('/users', auth, admin, ManageUserController.getAllUsers);
router.get('/users/:id',  auth, admin, ManageUserController.getUserById);
router.put('/users/:id', auth, admin, ManageUserController.updateUserRoleStatus);

// for download pdf
router.get('/manageuser/download/pdf', auth, admin, ManageUserController.downloadUsersPDF);



module.exports = router;
