/**
 * Product model.
 * SKU is unique PER ORGANIZATION (compound index below).
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    quantityOnHand: { type: Number, default: 0, min: 0 },
    costPrice: { type: Number, default: null, min: 0 },
    sellingPrice: { type: Number, default: null, min: 0 },
    // If null, fall back to organization.defaultLowStockThreshold.
    lowStockThreshold: { type: Number, default: null, min: 0 },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true },
);

// Enforce SKU uniqueness within a single organization.
productSchema.index({ organization: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
