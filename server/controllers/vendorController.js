const { collections } = require('../config/firebase');

const listVendors = async (req, res, next) => {
    try {
        const snapshot = await collections.vendors.get();
        res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
        next(error);
    }
};

const listVendorProducts = async (req, res, next) => {
    try {
        const snapshot = await collections.products.where('vendorId', '==', req.params.vendorId).get();
        res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
        next(error);
    }
};

module.exports = { listVendors, listVendorProducts };
