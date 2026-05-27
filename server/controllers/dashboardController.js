const { collections } = require('../config/firebase');
const { getSalesSummary } = require('../services/posService');

const overview = async (req, res, next) => {
    try {
        const vendorId = req.user.vendorId || req.query.vendorId;
        const [orders, inventory, sales] = await Promise.all([
            collections.orders.where('vendorId', '==', vendorId).limit(50).get(),
            collections.inventory.where('vendorId', '==', vendorId).get(),
            getSalesSummary(vendorId)
        ]);

        const orderList = orders.docs.map(doc => doc.data());
        const inventoryList = inventory.docs.map(doc => doc.data());

        res.json({
            overview: {
                openOrders: orderList.filter(order => ['pending', 'accepted', 'preparing'].includes(order.status)).length,
                completedOrders: orderList.filter(order => order.status === 'completed').length,
                lowStockItems: inventoryList.filter(item => item.stock <= item.threshold).length,
                revenueToday: sales.daily.total
            },
            inventory: inventoryList,
            orders: orderList,
            analytics: sales,
            pos: {
                dailySales: sales.daily,
                weeklySales: sales.weekly,
                monthlySales: sales.monthly
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { overview };
