const { vendorRoom } = require('../services/notificationService');

const initSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('vendor:join', ({ vendorId }) => {
            if (vendorId) socket.join(vendorRoom(vendorId));
        });

        socket.on('vendor:leave', ({ vendorId }) => {
            if (vendorId) socket.leave(vendorRoom(vendorId));
        });
    });
};

module.exports = { initSocket };
