/**
 * Category controller: CRUD for per-org categories.
 */

const Category = require('../models/Category');
const Product = require('../models/Product');

function toDTO(c) {
  return { id: c._id, name: c.name, color: c.color, createdAt: c.createdAt };
}

async function list(req, res, next) {
  try {
    const items = await Category.find({ organization: req.auth.organizationId }).sort({
      name: 1,
    });
    return res.json(items.map(toDTO));
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, color } = req.body;
    if (typeof name !== 'string' || !name.trim() || name.length > 100) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const item = await Category.create({
      organization: req.auth.organizationId,
      name: name.trim(),
      color: typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color) ? color : '#3b82f6',
    });
    return res.status(201).json(toDTO(item));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Category already exists' });
    }
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const patch = {};
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.length > 100) {
        return res.status(400).json({ message: 'Name is invalid' });
      }
      patch.name = req.body.name.trim();
    }
    if (req.body.color !== undefined) {
      if (typeof req.body.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(req.body.color)) {
        return res.status(400).json({ message: 'Color must be a hex value like #3b82f6' });
      }
      patch.color = req.body.color;
    }

    const item = await Category.findOneAndUpdate(
      { _id: req.params.id, organization: req.auth.organizationId },
      patch,
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ message: 'Category not found' });
    return res.json(toDTO(item));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Category already exists' });
    }
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await Category.deleteOne({
      _id: req.params.id,
      organization: req.auth.organizationId,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    // Unassign deleted category from any product that was using it.
    await Product.updateMany(
      { organization: req.auth.organizationId, category: req.params.id },
      { $set: { category: null } },
    );
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove };
