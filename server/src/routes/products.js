/**
 * /api/products routes
 */

const express = require('express');
const { body } = require('express-validator');

const { authRequired } = require('../middleware/auth');
const ctrl = require('../controllers/productController');

const router = express.Router();

// Shared validation for create/update bodies.
const productValidators = [
  body('name').optional().isString().trim().notEmpty().withMessage('Name cannot be blank'),
  body('sku').optional().isString().trim().notEmpty().withMessage('SKU cannot be blank'),
  body('quantityOnHand').optional().isInt({ min: 0 }).withMessage('Quantity must be >= 0'),
  body('costPrice').optional({ nullable: true }).isFloat({ min: 0 }),
  body('sellingPrice').optional({ nullable: true }).isFloat({ min: 0 }),
  body('lowStockThreshold').optional({ nullable: true }).isInt({ min: 0 }),
];

const createValidators = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('sku').isString().trim().notEmpty().withMessage('SKU is required'),
  ...productValidators,
];

router.use(authRequired);

// CSV export must come before '/:id' so Express doesn't treat it as an id.
router.get('/export.csv', ctrl.exportCsv);

router.get('/', ctrl.list);
router.post('/', createValidators, ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', productValidators, ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/adjust', ctrl.adjust);

module.exports = router;
