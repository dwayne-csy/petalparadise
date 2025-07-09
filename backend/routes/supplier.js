const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/SupplierController');



router.post('/supplier', SupplierController.createSupplier);
router.get('/supplier', SupplierController.getSuppliers);
router.get('/supplier/:id', SupplierController.getSupplierById);      
router.put('/supplier/:id', SupplierController.updateSupplier);       
router.delete('/supplier/:id', SupplierController.deleteSupplier);

module.exports = router;
