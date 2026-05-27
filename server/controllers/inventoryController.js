const { updateInventoryStock } = require('../services/inventoryService');
const { collections } = require('../config/firebase');

const listInventory = async (req, res, next) => {
    try {
        let query = collections.inventory;
        if (req.query.vendorId) {
            query = query.where('vendorId', '==', req.query.vendorId);
        }

        const snapshot = await query.get();
        res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
        next(error);
    }
};

const updateInventory = async (req, res, next) => {
    try {
        const result = await updateInventoryStock({
            productId: req.params.productId,
            vendorId: req.user.vendorId || req.body.vendorId,
            stock: Number(req.body.stock),
            reason: req.body.reason || 'vendor_update',
            io: req.app.get('io')
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = { listInventory, updateInventory };
