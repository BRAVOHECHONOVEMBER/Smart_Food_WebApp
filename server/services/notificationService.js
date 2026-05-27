const vendorRoom = (vendorId) => `vendor:${vendorId}`;

const emitVendorEvent = (io, vendorId, event, payload) => {
    if (!io || !vendorId) return;
    io.to(vendorRoom(vendorId)).emit(event, payload);
};

const notifyNewOrder = (io, order) => emitVendorEvent(io, order.vendorId, 'vendor:new-order', order);
const notifyLowStock = (io, item) => emitVendorEvent(io, item.vendorId, 'vendor:low-stock', item);
const notifyOrderStatus = (io, order) => emitVendorEvent(io, order.vendorId, 'vendor:order-status', order);

module.exports = {
    vendorRoom,
    emitVendorEvent,
    notifyNewOrder,
    notifyLowStock,
    notifyOrderStatus
};
