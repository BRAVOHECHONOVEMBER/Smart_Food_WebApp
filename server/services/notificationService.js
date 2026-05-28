const vendorRoom = (vendorId) => `vendor:${vendorId}`;
const customerRoom = (customerId) => `customer:${customerId}`;

const emitVendorEvent = (io, vendorId, event, payload) => {
    if (!io || !vendorId) return;
    io.to(vendorRoom(vendorId)).emit(event, payload);
};

const notifyNewOrder = (io, order) => emitVendorEvent(io, order.vendorId, 'vendor:new-order', order);
const notifyLowStock = (io, item) => emitVendorEvent(io, item.vendorId, 'vendor:low-stock', item);
const notifyOrderStatus = (io, order) => emitVendorEvent(io, order.vendorId, 'vendor:order-status', order);
const notifyCustomerOrderStatus = (io, order) => {
    if (!io || !order.customerId) return;
    io.to(customerRoom(order.customerId)).emit('customer:order-status', order);
};

module.exports = {
    vendorRoom,
    customerRoom,
    emitVendorEvent,
    notifyNewOrder,
    notifyLowStock,
    notifyOrderStatus,
    notifyCustomerOrderStatus
};
