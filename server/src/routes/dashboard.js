/**
 * /api/dashboard routes
 */

const express = require('express');
const { authRequired } = require('../middleware/auth');
const { overview } = require('../controllers/dashboardController');

const router = express.Router();

router.use(authRequired);
router.get('/', overview);

module.exports = router;
