const express = require('express');
const { authRequired } = require('../middleware/auth');
const { inventory, movements } = require('../controllers/reportController');

const router = express.Router();
router.use(authRequired);

router.get('/inventory', inventory);
router.get('/movements', movements);

module.exports = router;
