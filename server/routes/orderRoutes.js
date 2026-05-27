const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { placeOrder, patchOrderStatus } = require('../controllers/orderController');

router.post('/', auth(['Customer', 'Vendor']), placeOrder);
router.patch('/:orderId/status', auth(['Vendor']), patchOrderStatus);

module.exports = router;
