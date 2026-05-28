const { vendorRoom, customerRoom } = require('../services/notificationService');

const initSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('vendor:join', ({ vendorId }) => {
            if (vendorId) socket.join(vendorRoom(vendorId));
        });

        socket.on('vendor:leave', ({ vendorId }) => {
            if (vendorId) socket.leave(vendorRoom(vendorId));
        });

        socket.on('customer:join', ({ customerId }) => {
            if (customerId) socket.join(customerRoom(customerId));
        });

        socket.on('customer:leave', ({ customerId }) => {
            if (customerId) socket.leave(customerRoom(customerId));
        });
    });
};

module.exports = { initSocket };
