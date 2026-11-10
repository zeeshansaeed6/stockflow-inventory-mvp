/**
 * Product controller: CRUD scoped to the caller's organization.
 */

const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

const Category = require('../models/Category');
const Supplier = require('../models/Supplier');

function isObjectId(v) {
  return typeof v === 'string' && /^[0-9a-f]{24}$/i.test(v);
}

// category/supplier must be valid ids that belong to the caller's organization
// (otherwise one tenant could attach, and read back, another tenant's records).
async function validateRefs(orgId, body) {
  for (const [key, Model] of [['category', Category], ['supplier', Supplier]]) {
    const v = body[key];
    if (v === undefined || v === null || v === '') continue;
    if (!isObjectId(v)) return `${key} is invalid`;
    if (!(await Model.exists({ _id: v, organization: orgId }))) return `${key} not found`;
  }
  return null;
}

// Helper: record a stock movement if the quantity actually changed.
async function logMovement({ orgId, userId, product, delta, reason, note = '' }) {
  if (delta === 0) return;
  await StockMovement.create({
    organization: orgId,
    user: userId,
    product: product._id,
    delta,
    resultingQty: product.quantityOnHand,
    reason,
    note,
  });
}

// Shape product for API responses.
function toDTO(p) {
  // Mongoose docs populate() yields nested docs; normalise to flat refs.
  const cat = p.category && p.category.name
    ? { id: p.category._id, name: p.category.name, color: p.category.color }
    : p.category || null;
  const sup = p.supplier && p.supplier.name
    ? { id: p.supplier._id, name: p.supplier.name }
    : p.supplier || null;

  return {
    id: p._id,
    name: p.name,
    sku: p.sku,
    description: p.description,
    imageUrl: p.imageUrl,
    quantityOnHand: p.quantityOnHand,
    costPrice: p.costPrice,
    sellingPrice: p.sellingPrice,
    lowStockThreshold: p.lowStockThreshold,
    category: cat,
    supplier: sup,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// GET /api/products?q=&page=&pageSize=
// Returns a paginated, searchable list. Defaults keep backwards-compat
// for existing clients that don't send pagination params.
async function list(req, res, next) {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
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

    // Map client sort keys to schema fields; reject anything else.
    const sortFields = {
      name: 'name',
      sku: 'sku',
      qty: 'quantityOnHand',
      updated: 'updatedAt',
      created: 'createdAt',
    };
    const sortBy = sortFields[req.query.sortBy] || 'createdAt';
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1;

    // Optional category/supplier filters.
    for (const key of ['category', 'supplier']) {
      const v = req.query[key];
      if (v === undefined || v === '') continue;
      if (!isObjectId(v)) return res.status(400).json({ message: `${key} is invalid` });
      filter[key] = v;
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate('category', 'name color')
        .populate('supplier', 'name')
        .sort({ [sortBy]: sortDir })
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
    })
      .populate('category', 'name color')
      .populate('supplier', 'name');
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

    const refError = await validateRefs(req.auth.organizationId, req.body);
    if (refError) return res.status(400).json({ message: refError });

    const payload = {
      ...req.body,
      // Empty-string refs come from unselected dropdowns; store null.
      category: req.body.category || null,
      supplier: req.body.supplier || null,
      organization: req.auth.organizationId,
      lastUpdatedBy: req.auth.userId,
    };

    const product = await Product.create(payload);
    if (product.quantityOnHand > 0) {
      await logMovement({
        orgId: req.auth.organizationId,
        userId: req.auth.userId,
        product,
        delta: product.quantityOnHand,
        reason: 'create',
        note: 'Initial stock',
      });
    }
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

    const refError = await validateRefs(req.auth.organizationId, req.body);
    if (refError) return res.status(400).json({ message: refError });

    const updatable = [
      'name',
      'sku',
      'description',
      'imageUrl',
      'quantityOnHand',
      'costPrice',
      'sellingPrice',
      'lowStockThreshold',
      'category',
      'supplier',
    ];
    const patch = { lastUpdatedBy: req.auth.userId };
    for (const key of updatable) {
      if (req.body[key] !== undefined) {
        // Normalise empty refs to null.
        if ((key === 'category' || key === 'supplier') && !req.body[key]) {
          patch[key] = null;
        } else {
          patch[key] = req.body[key];
        }
      }
    }

    // Pre-fetch so we can compute the qty delta for the audit log.
    const before = await Product.findOne({
      _id: req.params.id,
      organization: req.auth.organizationId,
    });
    if (!before) return res.status(404).json({ message: 'Product not found' });

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, organization: req.auth.organizationId },
      patch,
      { new: true, runValidators: true },
    )
      .populate('category', 'name color')
      .populate('supplier', 'name');

    if (patch.quantityOnHand !== undefined && patch.quantityOnHand !== before.quantityOnHand) {
      await logMovement({
        orgId: req.auth.organizationId,
        userId: req.auth.userId,
        product,
        delta: patch.quantityOnHand - before.quantityOnHand,
        reason: 'edit',
        note: 'Edited via product form',
      });
    }
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
// Body: { delta: integer, note?: string }
// Adjusts quantityOnHand by the signed delta, clamped at 0. The update is a
// single atomic operation so concurrent adjustments never overwrite each other.
async function adjust(req, res, next) {
  try {
    const delta = req.body.delta;
    if (typeof delta !== 'number' || !Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 1e9) {
      return res.status(400).json({ message: 'delta must be a non-zero whole number' });
    }

    const note = typeof req.body.note === 'string' ? req.body.note.slice(0, 500) : '';
    const mongoose = require('mongoose');

    // Returns the document as it was BEFORE the change; the new value is derived
    // with the same formula the database applied, on the same atomic snapshot.
    const before = await Product.findOneAndUpdate(
      { _id: req.params.id, organization: req.auth.organizationId },
      [
        {
          $set: {
            quantityOnHand: { $max: [0, { $add: [{ $ifNull: ['$quantityOnHand', 0] }, delta] }] },
            lastUpdatedBy: new mongoose.Types.ObjectId(req.auth.userId),
            updatedAt: '$$NOW',
          },
        },
      ],
      { new: false },
    );
    if (!before) return res.status(404).json({ message: 'Product not found' });

    const prev = before.quantityOnHand || 0;
    const nextQty = Math.max(0, prev + delta);
    const appliedDelta = nextQty - prev;

    const product = await Product.findById(before._id)
      .populate('category', 'name color')
      .populate('supplier', 'name');

    await logMovement({
      orgId: req.auth.organizationId,
      userId: req.auth.userId,
      product: { _id: before._id, quantityOnHand: nextQty },
      delta: appliedDelta,
      reason: 'adjust',
      note,
    });

    return res.json(toDTO(product));
  } catch (err) {
    return next(err);
  }
}

// Escape a cell so commas, quotes and newlines survive the CSV round-trip.
function csvCell(v) {
  if (v === null || v === undefined) return '';
  let s = String(v);
  // Neutralise spreadsheet formula injection (text starting with = + - @ tab CR).
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
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
