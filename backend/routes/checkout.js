const express = require('express');
const router = express.Router();
const CheckoutController = require('../controllers/CheckoutController');
const auth = require('../middlewares/auth');

router.post('/checkout/solo', auth, CheckoutController.checkoutSolo);
router.post('/checkout/cart', auth, CheckoutController.checkoutCart);
router.get('/checkout', auth, CheckoutController.getCheckoutDetails);
router.post('/checkout', auth, CheckoutController.confirmCheckout);



module.exports = router;
