const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { overview } = require('../controllers/dashboardController');

router.get('/vendor', auth(['Vendor']), overview);

module.exports = router;
