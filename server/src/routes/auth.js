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
    body('email').isString().isEmail().withMessage('Valid email required'),
    body('password')
      .isString()
      .isLength({ min: 6, max: 72 })
      .withMessage('Password must be 6-72 characters'),
    body('organizationName')
      .isString()
      .trim()
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage('Organization name required (max 100 characters)'),
  ],
  signup,
);

router.post(
  '/login',
  [
    body('email').isString().isEmail().withMessage('Valid email required'),
    body('password').isString().notEmpty().withMessage('Password required'),
  ],
  login,
);

router.get('/me', authRequired, me);

module.exports = router;
