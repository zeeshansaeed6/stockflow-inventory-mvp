/**
 * Organization (tenant) model.
 * Every product/setting is scoped to an organization.
 */

const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Global default low-stock threshold used when a product has none.
    defaultLowStockThreshold: { type: Number, default: 5, min: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Organization', organizationSchema);
