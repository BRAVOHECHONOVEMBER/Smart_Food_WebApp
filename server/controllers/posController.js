const { recordPosSale, getSalesSummary } = require('../services/posService');
const { collections } = require('../config/firebase');

const createSale = async (req, res, next) => {
    try {
        const sale = await recordPosSale({
            vendorId: req.user.vendorId || req.body.vendorId,
            cashierId: req.user.uid,
            items: req.body.items || [],
            paymentMethod: req.body.paymentMethod || 'cash',
            io: req.app.get('io')
        });

        res.status(201).json(sale);
    } catch (error) {
        next(error);
    }
};

const salesHistory = async (req, res, next) => {
    try {
        const vendorId = req.user.vendorId || req.query.vendorId;
        const snapshot = await collections.transactions
            .where('vendorId', '==', vendorId)
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
        next(error);
    }
};

const salesSummary = async (req, res, next) => {
    try {
        const summary = await getSalesSummary(req.user.vendorId || req.query.vendorId);
        res.json(summary);
    } catch (error) {
        next(error);
    }
};

module.exports = { createSale, salesHistory, salesSummary };
