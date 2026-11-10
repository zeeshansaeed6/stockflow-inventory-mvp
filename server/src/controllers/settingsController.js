/**
 * Settings controller: read/update organization-level settings.
 * MVP: just the default low-stock threshold.
 */

const { validationResult } = require('express-validator');
const Organization = require('../models/Organization');

// GET /api/settings
async function get(req, res, next) {
  try {
    const org = await Organization.findById(req.auth.organizationId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    return res.json({
      organizationName: org.name,
      defaultLowStockThreshold: org.defaultLowStockThreshold,
    });
  } catch (err) {
    return next(err);
  }
}

// PUT /api/settings
async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const patch = {};
    if (req.body.defaultLowStockThreshold !== undefined) {
      patch.defaultLowStockThreshold = req.body.defaultLowStockThreshold;
    }
    if (req.body.organizationName !== undefined) {
      patch.name = req.body.organizationName;
    }

    const org = await Organization.findByIdAndUpdate(req.auth.organizationId, patch, {
      new: true,
      runValidators: true,
    });
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    return res.json({
      organizationName: org.name,
      defaultLowStockThreshold: org.defaultLowStockThreshold,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { get, update };
