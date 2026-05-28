const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { placeOrder, patchOrderStatus, listCustomerOrders, getOrderStatus } = require('../controllers/orderController');

router.post('/', auth(['Customer', 'Vendor']), placeOrder);
router.get('/history', auth(['Customer']), listCustomerOrders);
router.get('/:orderId/status', auth(['Customer', 'Vendor']), getOrderStatus);
router.patch('/:orderId/status', auth(['Vendor']), patchOrderStatus);

module.exports = router;
