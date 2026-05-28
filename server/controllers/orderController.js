const { collections } = require('../config/firebase');
const { createOrder, updateOrderStatus } = require('../services/inventoryService');

const placeOrder = async (req, res, next) => {
    try {
        const order = await createOrder({
            customerId: req.user?.uid || req.body.customerId || 'guest',
            customerName: req.body.customerName || 'Customer',
            vendorId: req.body.vendorId,
            items: req.body.items || [],
            payment: req.body.payment,
            delivery: req.body.delivery,
            io: req.app.get('io')
        });

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

const patchOrderStatus = async (req, res, next) => {
    try {
        const order = await updateOrderStatus({
            orderId: req.params.orderId,
            status: req.body.status,
            io: req.app.get('io')
        });

        res.json(order);
    } catch (error) {
        next(error);
    }
};

const listCustomerOrders = async (req, res, next) => {
    try {
        const snapshot = await collections.orders
            .where('customerId', '==', req.user.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
        next(error);
    }
};

const getOrderStatus = async (req, res, next) => {
    try {
        const doc = await collections.orders.doc(req.params.orderId).get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const order = doc.data();
        if (
            req.user.roles?.includes('Customer') &&
            order.customerId !== req.user.uid
        ) {
            return res.status(403).json({ message: 'You cannot view this order.' });
        }

        res.json({
            id: doc.id,
            status: order.status,
            paymentStatus: order.payment?.status || 'unpaid',
            receipt: order.payment?.receipt || null,
            updatedAt: order.updatedAt
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { placeOrder, patchOrderStatus, listCustomerOrders, getOrderStatus };
