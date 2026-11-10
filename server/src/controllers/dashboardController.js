/**
 * Dashboard controller: aggregated summary for the home page.
 */

const Product = require('../models/Product');
const Organization = require('../models/Organization');

// GET /api/dashboard
async function overview(req, res, next) {
  try {
    const orgId = req.auth.organizationId;
    const org = await Organization.findById(orgId);
    const defaultThreshold = org ? org.defaultLowStockThreshold : 5;

    const products = await Product.find({ organization: orgId });

    const totalProducts = products.length;
    const totalUnits = products.reduce((sum, p) => sum + (p.quantityOnHand || 0), 0);

    // A product is "low stock" if qty <= (its threshold OR the org default).
    const lowStockItems = products
      .filter((p) => {
        const threshold =
          p.lowStockThreshold === null || p.lowStockThreshold === undefined
            ? defaultThreshold
            : p.lowStockThreshold;
        return p.quantityOnHand <= threshold;
      })
      .map((p) => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        quantityOnHand: p.quantityOnHand,
        lowStockThreshold:
          p.lowStockThreshold === null || p.lowStockThreshold === undefined
            ? defaultThreshold
            : p.lowStockThreshold,
      }));

    return res.json({
      totalProducts,
      totalUnits,
      lowStockCount: lowStockItems.length,
      defaultLowStockThreshold: defaultThreshold,
      lowStockItems,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { overview };
