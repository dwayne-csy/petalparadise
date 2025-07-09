const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');

//for verify user authentication
const { isAuthenticatedUser } = require('../middlewares/auth');

//for VerifyAdmin
const { verifyAdmin } = require('../middlewares/VerifyAdmin');

// Controllers (separated)
const { registerUser } = require('../controllers/RegisterController');
const { loginUser } = require('../controllers/LoginController');
const { updateUser, getProfile } = require('../controllers/ProfileController');
const { deactivateUser } = require('../controllers/DeactivateUserController');
const verifyToken = require('../middlewares/VerifyToken');



//User routes



// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/update-profile', isAuthenticatedUser, upload.single('image'), updateUser);

router.get('/profile/:id', verifyToken, getProfile);


// Admin routes
router.put('/deactivate', verifyAdmin, deactivateUser);


module.exports = router;
