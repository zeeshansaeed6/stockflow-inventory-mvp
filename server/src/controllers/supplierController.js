/**
 * Supplier controller: CRUD for per-org suppliers.
 */

const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

function toDTO(s) {
  return {
    id: s._id,
    name: s.name,
    contactName: s.contactName,
    email: s.email,
    phone: s.phone,
    notes: s.notes,
    createdAt: s.createdAt,
  };
}

async function list(req, res, next) {
  try {
    const items = await Supplier.find({
      organization: req.auth.organizationId,
    }).sort({ name: 1 });
    return res.json(items.map(toDTO));
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (typeof name !== 'string' || !name.trim() || name.length > 100) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const payload = { organization: req.auth.organizationId };
    for (const key of ['name', 'contactName', 'email', 'phone', 'notes']) {
      if (req.body[key] === undefined) continue;
      if (typeof req.body[key] !== 'string') {
        return res.status(400).json({ message: `${key} must be text` });
      }
      payload[key] = req.body[key];
    }
    const item = await Supplier.create(payload);
    return res.status(201).json(toDTO(item));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Supplier already exists' });
    }
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const updatable = ['name', 'contactName', 'email', 'phone', 'notes'];
    const patch = {};
    for (const key of updatable) {
      if (req.body[key] === undefined) continue;
      if (typeof req.body[key] !== 'string' || (key === 'name' && !req.body[key].trim())) {
        return res.status(400).json({ message: `${key} is invalid` });
      }
      patch[key] = req.body[key];
    }

    const item = await Supplier.findOneAndUpdate(
      { _id: req.params.id, organization: req.auth.organizationId },
      patch,
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ message: 'Supplier not found' });
    return res.json(toDTO(item));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Supplier already exists' });
    }
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await Supplier.deleteOne({
      _id: req.params.id,
      organization: req.auth.organizationId,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    await Product.updateMany(
      { organization: req.auth.organizationId, supplier: req.params.id },
      { $set: { supplier: null } },
    );
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove };
