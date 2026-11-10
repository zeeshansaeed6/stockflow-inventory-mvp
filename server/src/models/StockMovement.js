/**
 * StockMovement model.
 * One row per inventory change (adjust / create / set).
 * Gives us the audit trail the PRD explicitly left out of MVP but
 * is cheap to add and very useful in practice.
 */

const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Signed delta applied; +N for increase, -N for decrease.
    delta: { type: Number, required: true },
    // Quantity after the change was applied.
    resultingQty: { type: Number, required: true },
    reason: {
      type: String,
      enum: ['create', 'adjust', 'edit'],
      default: 'adjust',
    },
    note: { type: String, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);
