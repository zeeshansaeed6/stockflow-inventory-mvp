/**
 * Product controller: CRUD scoped to the caller's organization.
 */

const { validationResult } = require('express-validator');
const Product = require('../models/Product');

// Shape product for API responses.
function toDTO(p) {
  return {
    id: p._id,
    name: p.name,
    sku: p.sku,
    description: p.description,
    quantityOnHand: p.quantityOnHand,
    costPrice: p.costPrice,
    sellingPrice: p.sellingPrice,
    lowStockThreshold: p.lowStockThreshold,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// GET /api/products?q=&page=&pageSize=
// Returns a paginated, searchable list. Defaults keep backwards-compat
// for existing clients that don't send pagination params.
async function list(req, res, next) {
  try {
    const { q } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(200, Math.max(1, parseInt(req.query.pageSize, 10) || 50));

    const filter = { organization: req.auth.organizationId };

    if (q && q.trim()) {
      const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { sku: regex }];
    }

    // Low-stock filter: a product is low if its own threshold (or the
    // organization default when null) is >= its current qty.
    if (req.query.lowOnly === 'true') {
      const Organization = require('../models/Organization');
      const org = await Organization.findById(req.auth.organizationId);
      const defaultT = org ? org.defaultLowStockThreshold : 5;
      // $expr lets us compare fields within a document.
      filter.$expr = {
        $lte: [
          '$quantityOnHand',
          { $ifNull: ['$lowStockThreshold', defaultT] },
        ],
      };
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
    ]);

    // Legacy clients expect an array; paginated clients can send ?page=
    // and get the envelope. Pick based on whether page was explicit.
    if (req.query.page || req.query.pageSize) {
      return res.json({
        items: products.map(toDTO),
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      });
    }
    return res.json(products.map(toDTO));
  } catch (err) {
    return next(err);
  }
}

// GET /api/products/:id
async function getOne(req, res, next) {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      organization: req.auth.organizationId,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(toDTO(product));
  } catch (err) {
    return next(err);
  }
}

// POST /api/products
async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const payload = {
      ...req.body,
      organization: req.auth.organizationId,
      lastUpdatedBy: req.auth.userId,
    };

    const product = await Product.create(payload);
    return res.status(201).json(toDTO(product));
  } catch (err) {
    // Duplicate SKU within same org.
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'SKU already exists in this organization' });
    }
    return next(err);
  }
}

// PUT /api/products/:id
async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const updatable = [
      'name',
      'sku',
      'description',
      'quantityOnHand',
      'costPrice',
      'sellingPrice',
      'lowStockThreshold',
    ];
    const patch = { lastUpdatedBy: req.auth.userId };
    for (const key of updatable) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, organization: req.auth.organizationId },
      patch,
      { new: true, runValidators: true },
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(toDTO(product));
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'SKU already exists in this organization' });
    }
    return next(err);
  }
}

// DELETE /api/products/:id
async function remove(req, res, next) {
  try {
    const result = await Product.deleteOne({
      _id: req.params.id,
      organization: req.auth.organizationId,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

// POST /api/products/:id/adjust
// Body: { delta: number, note?: string }
// Adjusts quantityOnHand by the signed delta, clamped at 0.
async function adjust(req, res, next) {
  try {
    const delta = Number(req.body.delta);
    if (!Number.isFinite(delta) || delta === 0) {
      return res.status(400).json({ message: 'delta must be a non-zero number' });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      organization: req.auth.organizationId,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const next = Math.max(0, (product.quantityOnHand || 0) + delta);
    product.quantityOnHand = next;
    product.lastUpdatedBy = req.auth.userId;
    await product.save();

    return res.json(toDTO(product));
  } catch (err) {
    return next(err);
  }
}

// Escape a cell so commas, quotes and newlines survive the CSV round-trip.
function csvCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// GET /api/products/export.csv
// Streams a CSV of all products in the caller's organization.
async function exportCsv(req, res, next) {
  try {
    const products = await Product.find({ organization: req.auth.organizationId }).sort({
      name: 1,
    });

    const header = [
      'Name',
      'SKU',
      'Description',
      'QuantityOnHand',
      'CostPrice',
      'SellingPrice',
      'LowStockThreshold',
      'UpdatedAt',
    ].join(',');

    const rows = products.map((p) =>
      [
        p.name,
        p.sku,
        p.description,
        p.quantityOnHand,
        p.costPrice,
        p.sellingPrice,
        p.lowStockThreshold,
        p.updatedAt?.toISOString(),
      ]
        .map(csvCell)
        .join(','),
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    return res.send([header, ...rows].join('\n'));
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getOne, create, update, remove, adjust, exportCsv };
