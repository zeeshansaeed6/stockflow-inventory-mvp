/**
 * /api/auth routes
 */

const express = require('express');
const { body } = require('express-validator');

const { signup, login, me } = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('organizationName').trim().notEmpty().withMessage('Organization name required'),
  ],
  signup,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  login,
);

router.get('/me', authRequired, me);

module.exports = router;
