/**
 * Category model.
 * A per-organization tag used to group products.
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#3b82f6' },
  },
  { timestamps: true },
);

// Category names must be unique per organization.
categorySchema.index({ organization: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
