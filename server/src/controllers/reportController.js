/**
 * Report controller: aggregated views of the inventory.
 */

const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

/**
 * GET /api/reports/inventory
 * Returns top-value products + totals + out-of-stock items.
 */
async function inventory(req, res, next) {
  try {
    const orgId = req.auth.organizationId;
    const products = await Product.find({ organization: orgId })
      .populate('category', 'name color')
      .populate('supplier', 'name');

    const withValue = products.map((p) => ({
      id: p._id,
      name: p.name,
      sku: p.sku,
      quantityOnHand: p.quantityOnHand,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      category: p.category ? { id: p.category._id, name: p.category.name, color: p.category.color } : null,
      supplier: p.supplier ? { id: p.supplier._id, name: p.supplier.name } : null,
      inventoryValue: (p.costPrice || 0) * (p.quantityOnHand || 0),
      retailValue: (p.sellingPrice || 0) * (p.quantityOnHand || 0),
    }));

    const totalInventoryValue = withValue.reduce((s, p) => s + p.inventoryValue, 0);
    const totalRetailValue = withValue.reduce((s, p) => s + p.retailValue, 0);
    const outOfStock = withValue.filter((p) => p.quantityOnHand === 0);
    const topByValue = [...withValue]
      .sort((a, b) => b.inventoryValue - a.inventoryValue)
      .slice(0, 10);

    return res.json({
      totalInventoryValue,
      totalRetailValue,
      potentialMargin: totalRetailValue - totalInventoryValue,
      outOfStockCount: outOfStock.length,
      outOfStock: outOfStock.slice(0, 20),
      topByValue,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/reports/movements?limit=50
 * Latest stock movements for the org.
 */
async function movements(req, res, next) {
  try {
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const items = await StockMovement.find({ organization: req.auth.organizationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('product', 'name sku')
      .populate('user', 'email');

    return res.json(
      items.map((m) => ({
        id: m._id,
        product: m.product ? { id: m.product._id, name: m.product.name, sku: m.product.sku } : null,
        user: m.user ? { id: m.user._id, email: m.user.email } : null,
        delta: m.delta,
        resultingQty: m.resultingQty,
        reason: m.reason,
        note: m.note,
        createdAt: m.createdAt,
      })),
    );
  } catch (err) {
    return next(err);
  }
}

module.exports = { inventory, movements };
