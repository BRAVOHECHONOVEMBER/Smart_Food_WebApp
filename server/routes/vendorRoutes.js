const router = require('express').Router();
const { listVendors, listVendorProducts } = require('../controllers/vendorController');
const { collections } = require('../config/firebase');
const { auth } = require('../middleware/auth');

const productPayload = (vendorId, body, productId = Date.now().toString()) => ({
    productId,
    vendorId,
    name: String(body.name || '').trim(),
    price: Number(body.price || 0),
    category: String(body.category || 'food').toLowerCase(),
    image: body.image || '',
    stock: Number(body.stock || 0),
    threshold: Number(body.threshold || 5),
    updatedAt: new Date().toISOString()
});

router.get('/', listVendors);
router.get('/:vendorId/products', listVendorProducts);

router.post('/:vendorId/products', auth(['Vendor']), async (req, res, next) => {
    try {
        if (req.user.vendorId !== req.params.vendorId) {
            return res.status(403).json({ message: 'You cannot add products for another vendor.' });
        }

        const product = {
            ...productPayload(req.params.vendorId, req.body),
            createdAt: new Date().toISOString()
        };

        await collections.inventory.doc(product.productId).set(product);
        req.app.get('io')?.emit('products:updated', { vendorId: req.params.vendorId });
        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
});

router.patch('/:vendorId/products/:productId', auth(['Vendor']), async (req, res, next) => {
    try {
        if (req.user.vendorId !== req.params.vendorId) {
            return res.status(403).json({ message: 'You cannot edit products for another vendor.' });
        }

        const update = {
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        if (update.price !== undefined) update.price = Number(update.price);
        if (update.stock !== undefined) update.stock = Number(update.stock);
        if (update.category) update.category = String(update.category).toLowerCase();

        await collections.inventory.doc(req.params.productId).set(update, { merge: true });
        req.app.get('io')?.emit('products:updated', { vendorId: req.params.vendorId, productId: req.params.productId });
        res.json({ success: true, productId: req.params.productId });
    } catch (error) {
        next(error);
    }
});

router.delete('/:vendorId/products/:productId', auth(['Vendor']), async (req, res, next) => {
    try {
        if (req.user.vendorId !== req.params.vendorId) {
            return res.status(403).json({ message: 'You cannot delete products for another vendor.' });
        }

        await collections.inventory.doc(req.params.productId).delete();
        req.app.get('io')?.emit('products:updated', { vendorId: req.params.vendorId, productId: req.params.productId });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
