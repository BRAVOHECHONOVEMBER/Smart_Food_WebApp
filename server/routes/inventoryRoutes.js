const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { listInventory, updateInventory } = require('../controllers/inventoryController');

router.get('/', auth(['Vendor']), listInventory);
router.patch('/:productId', auth(['Vendor']), updateInventory);

module.exports = router;
