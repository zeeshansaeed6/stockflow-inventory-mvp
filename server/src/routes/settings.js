/**
 * /api/settings routes
 */

const express = require('express');
const { body } = require('express-validator');

const { authRequired } = require('../middleware/auth');
const { get, update } = require('../controllers/settingsController');

const router = express.Router();

router.use(authRequired);

router.get('/', get);
router.put(
  '/',
  [
    body('defaultLowStockThreshold').optional().isInt({ min: 0 }),
    body('organizationName').optional().isString().trim().notEmpty(),
  ],
  update,
);

module.exports = router;
