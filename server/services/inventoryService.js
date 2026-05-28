const { admin, db, collections } = require('../config/firebase');
const { notifyLowStock, notifyNewOrder, notifyOrderStatus, notifyCustomerOrderStatus } = require('./notificationService');

const assertItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        const error = new Error('At least one item is required.');
        error.status = 400;
        throw error;
    }
};

const getInventoryRef = (productId) => collections.inventory.doc(productId);

const reduceStockForItems = async ({ transaction, items, vendorId }) => {
    const refs = items.map(item => getInventoryRef(item.productId));
    const docs = [];

    for (const ref of refs) {
        docs.push(await transaction.get(ref));
    }

    const hydrated = [];

    items.forEach((item, index) => {
        const doc = docs[index];

        if (!doc.exists) {
            const error = new Error(`Inventory not found for ${item.productId}.`);
            error.status = 404;
            throw error;
        }

        const inventory = doc.data();
        if (inventory.vendorId !== vendorId) {
            const error = new Error('Cart contains an item from a different vendor.');
            error.status = 400;
            throw error;
        }

        if (inventory.stock < item.quantity) {
            const error = new Error(`Insufficient stock for ${item.name || item.productId}.`);
            error.status = 409;
            throw error;
        }

        const nextStock = inventory.stock - item.quantity;
        transaction.update(refs[index], {
            stock: nextStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        hydrated.push({ ...inventory, ...item, stock: nextStock });
    });

    return hydrated;
};

const createOrder = async ({ customerId, customerName, vendorId, items, payment, delivery, io }) => {
    assertItems(items);

    const orderRef = collections.orders.doc();
    const order = await db.runTransaction(async (transaction) => {
        const reducedItems = await reduceStockForItems({ transaction, items, vendorId });
        const total = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        const payload = {
            id: orderRef.id,
            customerId,
            customerName,
            vendorId,
            items,
            total,
            delivery: delivery || null,
            payment: {
                transactionId: payment?.transactionId || `TXN-${orderRef.id.toUpperCase()}`,
                receipt: payment?.receipt || `RCP-${orderRef.id.slice(0, 8).toUpperCase()}`,
                status: payment?.status || 'paid',
                method: payment?.method || 'Card',
                provider: payment?.provider || 'simulated'
            },
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        transaction.set(orderRef, payload);
        transaction.set(collections.transactions.doc(payload.payment.transactionId), {
            id: payload.payment.transactionId,
            transactionId: payload.payment.transactionId,
            receiptNumber: payload.payment.receipt,
            vendorId,
            customerId,
            orderId: orderRef.id,
            amount: total,
            paymentMethod: payload.payment.method,
            status: payload.payment.status,
            source: 'Checkout',
            items,
            createdAt: payload.createdAt
        });
        payload.lowStockItems = reducedItems.filter(item => item.stock <= item.threshold);
        return payload;
    });

    notifyNewOrder(io, order);
    order.lowStockItems.forEach(item => notifyLowStock(io, item));
    io?.emit('inventory:updated', { vendorId, orderId: order.id });
    return order;
};

const updateInventoryStock = async ({ productId, vendorId, stock, reason, io }) => {
    if (!Number.isFinite(stock) || stock < 0) {
        const error = new Error('Stock must be a non-negative number.');
        error.status = 400;
        throw error;
    }

    const ref = getInventoryRef(productId);
    const payload = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(ref);
        const current = doc.exists ? doc.data() : { productId, vendorId, threshold: 5 };

        if (current.vendorId && vendorId && current.vendorId !== vendorId) {
            const error = new Error('Vendor cannot update another vendor inventory.');
            error.status = 403;
            throw error;
        }

        const next = {
            ...current,
            productId,
            vendorId: current.vendorId || vendorId,
            stock,
            reason,
            updatedAt: new Date().toISOString()
        };

        transaction.set(ref, next, { merge: true });
        return next;
    });

    if (payload.stock <= payload.threshold) {
        notifyLowStock(io, payload);
    }

    io?.emit('inventory:updated', { vendorId: payload.vendorId, productId, stock: payload.stock });

    return payload;
};

const updateOrderStatus = async ({ orderId, status, io }) => {
    const allowed = new Set(['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled']);
    if (!allowed.has(status)) {
        const error = new Error('Invalid order status.');
        error.status = 400;
        throw error;
    }

    const ref = collections.orders.doc(orderId);
    const doc = await ref.get();
    if (!doc.exists) {
        const error = new Error('Order not found.');
        error.status = 404;
        throw error;
    }

    const order = {
        ...doc.data(),
        status,
        updatedAt: new Date().toISOString()
    };

    await ref.update({ status, updatedAt: order.updatedAt });
    notifyOrderStatus(io, order);
    notifyCustomerOrderStatus(io, order);
    return order;
};

module.exports = {
    createOrder,
    updateInventoryStock,
    updateOrderStatus,
    reduceStockForItems
};
