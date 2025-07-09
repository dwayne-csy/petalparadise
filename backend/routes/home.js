// backend/routes/home.js

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/HomeController');

router.get('/home', homeController);

module.exports = router;
