const { db, collections } = require('../config/firebase');
const { reduceStockForItems } = require('./inventoryService');
const { notifyLowStock } = require('./notificationService');

const receiptNumber = () => `RCP-${Date.now().toString().slice(-8)}`;

const recordPosSale = async ({ vendorId, cashierId, items, paymentMethod, io }) => {
    const transactionRef = collections.transactions.doc();
    const sale = await db.runTransaction(async (transaction) => {
        const reducedItems = await reduceStockForItems({ transaction, items, vendorId });
        const amount = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
        const payload = {
            id: transactionRef.id,
            transactionId: `TXN-${transactionRef.id.toUpperCase()}`,
            receiptNumber: receiptNumber(),
            vendorId,
            cashierId,
            items,
            amount,
            paymentMethod,
            source: 'POS',
            createdAt: new Date().toISOString()
        };

        transaction.set(transactionRef, payload);
        payload.lowStockItems = reducedItems.filter(item => item.stock <= item.threshold);
        return payload;
    });

    sale.lowStockItems.forEach(item => notifyLowStock(io, item));
    io?.emit('inventory:updated', { vendorId });
    return sale;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const daysAgo = (days) => {
    const date = startOfDay(new Date());
    date.setDate(date.getDate() - days);
    return date;
};

const summarize = (transactions, since) => {
    const filtered = transactions.filter(item => new Date(item.createdAt) >= since);
    return {
        count: filtered.length,
        total: filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    };
};

const getSalesSummary = async (vendorId) => {
    const snapshot = await collections.transactions.where('vendorId', '==', vendorId).get();
    const transactions = snapshot.docs.map(doc => doc.data());

    return {
        daily: summarize(transactions, daysAgo(0)),
        weekly: summarize(transactions, daysAgo(7)),
        monthly: summarize(transactions, daysAgo(30))
    };
};

module.exports = { recordPosSale, getSalesSummary };
