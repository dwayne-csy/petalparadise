const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const upload = require('../utils/multer');
const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');

router.post('/product', auth, admin, upload.single('image'), ProductController.createProduct);
router.get('/product', auth, admin, ProductController.getProducts);
router.get('/product/:id', auth, admin, ProductController.getProductById);
router.put('/product/:id', auth, admin, upload.single('image'), ProductController.updateProduct);
router.delete('/product/:id', auth, admin, ProductController.deleteProduct);

module.exports = router;