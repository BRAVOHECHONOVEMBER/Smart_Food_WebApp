const { createOrder, updateOrderStatus } = require('../services/inventoryService');

const placeOrder = async (req, res, next) => {
    try {
        const order = await createOrder({
            customerId: req.user?.uid || req.body.customerId || 'guest',
            customerName: req.body.customerName || 'Customer',
            vendorId: req.body.vendorId,
            items: req.body.items || [],
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

module.exports = { placeOrder, patchOrderStatus };
