const express = require('express');
const router = express.Router();
const { getAdminDashboard } = require('../controllers/AdminDashboardController');
const verifyToken = require('../middlewares/VerifyToken');
const { verifyAdmin } = require('../middlewares/VerifyAdmin');

router.get('/admindashboard', verifyToken, verifyAdmin, getAdminDashboard);

module.exports = router;
