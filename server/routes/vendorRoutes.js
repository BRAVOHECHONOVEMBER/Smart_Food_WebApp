const router = require('express').Router();
const { listVendors, listVendorProducts } = require('../controllers/vendorController');

router.get('/', listVendors);
router.get('/:vendorId/products', listVendorProducts);

module.exports = router;
