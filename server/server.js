const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const posRoutes = require('./routes/posRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN || '*',
        methods: ['GET', 'POST', 'PATCH']
    }
});

app.set('io', io);
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
//app.use(express.json());
app.use(express.json({
limit:'20mb'
}));

app.use(express.urlencoded({

extended:true,

limit:'20mb'

}));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/src', express.static(path.join(__dirname, '..', 'src')));

app.get('/health', (req, res) => {
    res.json({ ok: true, service: 'smart-food-ordering-system' });
});

app.use('/auth', authRoutes);
app.use('/vendors', vendorRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/orders', orderRoutes);
app.use('/pos', posRoutes);
app.use('/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message || 'Server error'
    });
});

initSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`2P Grill server running on http://localhost:${PORT}`);
});
