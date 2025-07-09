const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const upload = require('../utils/multer');

router.post('/product', upload.single('image'), ProductController.createProduct);
router.get('/product', ProductController.getProducts);
router.get('/product/:id', ProductController.getProductById);
router.put('/product/:id', upload.single('image'), ProductController.updateProduct);
router.delete('/product/:id', ProductController.deleteProduct);

module.exports = router;
