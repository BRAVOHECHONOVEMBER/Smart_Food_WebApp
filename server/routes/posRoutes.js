const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { createSale, salesHistory, salesSummary } = require('../controllers/posController');

router.post('/sales', auth(['Vendor']), createSale);
router.get('/sales', auth(['Vendor']), salesHistory);
router.get('/summary', auth(['Vendor']), salesSummary);

module.exports = router;
