/**
 * Supplier model.
 * Represents a vendor you buy products from.
 */

const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    contactName: { type: String, default: '' },
    email: { type: String, default: '', lowercase: true, trim: true },
    phone: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

supplierSchema.index({ organization: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Supplier', supplierSchema);
