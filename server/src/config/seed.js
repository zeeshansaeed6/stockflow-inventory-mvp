/**
 * Dev-only seed data.
 *
 * Builds a handful of fictional businesses, each with multiple users,
 * categories, suppliers, products, and a backlog of stock movements
 * dated over the past two weeks — so Reports and Stock history pages
 * feel realistic on first boot.
 *
 * Runs only when SEED_DEMO=true (default when MONGO_URI is unset).
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const StockMovement = require('../models/StockMovement');

// A single plaintext password across every demo account — demo only.
const DEMO_PASSWORD = 'demo1234';

// Curated Unsplash photo IDs per SKU. Using Source URLs so the
// client can lazy-load the right size; cards request 400x300 crops.
const PRODUCT_IMAGES = {
  // Blue Spark Electronics
  'BS-CASE-15C': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop',
  'BS-CASE-15L': 'https://images.unsplash.com/photo-1512499617640-c2f999098c01?w=400&h=300&fit=crop',
  'BS-CHG-65C':  'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=400&h=300&fit=crop',
  'BS-CBL-1M':   'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=300&fit=crop',
  'BS-CBL-LT2':  'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=400&h=300&fit=crop',
  'BS-AUD-EBP':  'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop',
  'BS-AUD-OEH':  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
  'BS-LPT-STD':  'https://images.unsplash.com/photo-1587613864521-9ef8dfe617cc?w=400&h=300&fit=crop',
  'BS-LPT-HUB':  'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop',
  'BS-ACC-GSP':  'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=400&h=300&fit=crop',
  // Rooted Coffee
  'RC-BEAN-ETH': 'https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=400&h=300&fit=crop',
  'RC-BEAN-COL': 'https://images.unsplash.com/photo-1559525839-d9acfd50ae1b?w=400&h=300&fit=crop',
  'RC-BEAN-ESP': 'https://images.unsplash.com/photo-1518057111178-44a106bad636?w=400&h=300&fit=crop',
  'RC-BEAN-DEC': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop',
  'RC-EQP-GRND': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
  'RC-EQP-V60':  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
  'RC-ACC-FLT':  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
  'RC-ACC-TMB':  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
  // Bloom & Vine
  'BV-FLW-RSE':  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=300&fit=crop',
  'BV-FLW-HYD':  'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400&h=300&fit=crop',
  'BV-FLW-LAV':  'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=300&fit=crop',
  'BV-POT-VASM': 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=400&h=300&fit=crop',
  'BV-POT-SOIL': 'https://images.unsplash.com/photo-1416664806563-bb6be3be8ef5?w=400&h=300&fit=crop',
  'BV-FLW-SUC':  'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop',
  'BV-SUP-RBN':  'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&h=300&fit=crop',
  // Trailhead
  'TH-PCK-40L':  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
  'TH-PCK-65L':  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=300&fit=crop',
  'TH-CMP-POLE': 'https://images.unsplash.com/photo-1600697277406-8e5a5fcf98de?w=400&h=300&fit=crop',
  'TH-CMP-SLB5': 'https://images.unsplash.com/photo-1526585772182-ab79aa8b4d13?w=400&h=300&fit=crop',
  'TH-HYD-B2L':  'https://images.unsplash.com/photo-1523362289600-a70b4a0e09aa?w=400&h=300&fit=crop',
  'TH-HYD-B750': 'https://images.unsplash.com/photo-1523362289600-a70b4a0e09aa?w=400&h=300&fit=crop',
  'TH-LGT-HL35': 'https://images.unsplash.com/photo-1572978464031-6b9ad8d26c8e?w=400&h=300&fit=crop',
  'TH-LGT-LAN':  'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&h=300&fit=crop',
  'TH-CMP-DRY':  'https://images.unsplash.com/photo-1455614018203-f0580fd1e6cf?w=400&h=300&fit=crop',
};

// Fallback when no curated image exists for an SKU: a deterministic
// photo via picsum, so the UI never shows a broken image on new products.
function fallbackImage(sku) {
  return `https://picsum.photos/seed/${encodeURIComponent(sku)}/400/300`;
}

/**
 * Compact description of every seeded organization.
 * Each entry: users[], categories[], suppliers[], products[]
 *   - products reference categories/suppliers by their key (name).
 *   - products.history is an array of {days_ago, delta, reason, note}
 *     applied in reverse-chronological order.
 */
const BUSINESSES = [
  {
    name: 'Blue Spark Electronics',
    defaultLowStockThreshold: 5,
    users: [
      { email: 'owner@bluespark.demo', displayName: 'Mia Chen (Owner)' },
      { email: 'staff@bluespark.demo', displayName: 'Tom Ward (Store staff)' },
    ],
    categories: [
      { name: 'Phone accessories', color: '#3b82f6' },
      { name: 'Audio', color: '#8b5cf6' },
      { name: 'Charging', color: '#f59e0b' },
      { name: 'Laptop gear', color: '#10b981' },
    ],
    suppliers: [
      { name: 'TechTrade Ltd', contactName: 'Harold Nguyen', email: 'orders@techtrade.demo', phone: '+1-415-555-0133' },
      { name: 'AllChargers Inc', contactName: 'Priya Patel', email: 'sales@allchargers.demo', phone: '+1-646-555-0199' },
      { name: 'AudioPro', contactName: 'Jonas Weber', email: 'b2b@audiopro.demo', phone: '+49-30-555-0177' },
    ],
    products: [
      { name: 'iPhone 15 Clear Case', sku: 'BS-CASE-15C', category: 'Phone accessories', supplier: 'TechTrade Ltd', quantityOnHand: 48, costPrice: 3.5, sellingPrice: 19.99 },
      { name: 'iPhone 15 Leather Case', sku: 'BS-CASE-15L', category: 'Phone accessories', supplier: 'TechTrade Ltd', quantityOnHand: 12, costPrice: 9.0, sellingPrice: 44.99, lowStockThreshold: 15 },
      { name: 'USB-C 65W Charger', sku: 'BS-CHG-65C', category: 'Charging', supplier: 'AllChargers Inc', quantityOnHand: 22, costPrice: 8.5, sellingPrice: 29.99 },
      { name: 'USB-C 1m Braided Cable', sku: 'BS-CBL-1M', category: 'Charging', supplier: 'AllChargers Inc', quantityOnHand: 3, costPrice: 1.2, sellingPrice: 9.99, lowStockThreshold: 10 },
      { name: 'Lightning 2m Cable', sku: 'BS-CBL-LT2', category: 'Charging', supplier: 'AllChargers Inc', quantityOnHand: 0, costPrice: 1.4, sellingPrice: 11.99 },
      { name: 'Wireless Earbuds Pro', sku: 'BS-AUD-EBP', category: 'Audio', supplier: 'AudioPro', quantityOnHand: 7, costPrice: 24.0, sellingPrice: 79.99, lowStockThreshold: 8 },
      { name: 'Over-Ear Headphones', sku: 'BS-AUD-OEH', category: 'Audio', supplier: 'AudioPro', quantityOnHand: 15, costPrice: 42.0, sellingPrice: 129.99 },
      { name: 'Laptop Stand Aluminum', sku: 'BS-LPT-STD', category: 'Laptop gear', supplier: 'TechTrade Ltd', quantityOnHand: 9, costPrice: 12.0, sellingPrice: 39.99 },
      { name: 'USB-C Hub 7-in-1', sku: 'BS-LPT-HUB', category: 'Laptop gear', supplier: 'TechTrade Ltd', quantityOnHand: 18, costPrice: 15.0, sellingPrice: 49.99 },
      { name: 'Glass Screen Protector', sku: 'BS-ACC-GSP', category: 'Phone accessories', supplier: 'TechTrade Ltd', quantityOnHand: 60, costPrice: 1.1, sellingPrice: 7.99 },
    ],
    movements: [
      // { sku, delta, reason, note, daysAgo, byIndex }
      { sku: 'BS-CASE-15C', delta: 24, reason: 'adjust', note: 'PO #1021 received', daysAgo: 12, byIndex: 0 },
      { sku: 'BS-AUD-EBP', delta: 12, reason: 'adjust', note: 'PO #1022 received', daysAgo: 11, byIndex: 0 },
      { sku: 'BS-CASE-15C', delta: -2, reason: 'adjust', note: 'In-store sale', daysAgo: 10, byIndex: 1 },
      { sku: 'BS-CASE-15L', delta: -3, reason: 'adjust', note: 'Online orders 1104-1106', daysAgo: 9, byIndex: 1 },
      { sku: 'BS-CBL-1M', delta: -5, reason: 'adjust', note: 'Walk-in bundle sale', daysAgo: 8, byIndex: 1 },
      { sku: 'BS-CHG-65C', delta: -4, reason: 'adjust', note: 'Online orders', daysAgo: 7, byIndex: 1 },
      { sku: 'BS-CBL-LT2', delta: -6, reason: 'adjust', note: 'Clearance', daysAgo: 6, byIndex: 0 },
      { sku: 'BS-AUD-EBP', delta: -5, reason: 'adjust', note: 'Order 1137', daysAgo: 5, byIndex: 1 },
      { sku: 'BS-LPT-HUB', delta: 10, reason: 'adjust', note: 'PO #1030 received', daysAgo: 4, byIndex: 0 },
      { sku: 'BS-ACC-GSP', delta: -4, reason: 'adjust', note: 'Counter sale', daysAgo: 3, byIndex: 1 },
      { sku: 'BS-CASE-15L', delta: -1, reason: 'adjust', note: 'Customer walk-in', daysAgo: 2, byIndex: 1 },
      { sku: 'BS-CBL-1M', delta: -1, reason: 'adjust', note: 'In-store', daysAgo: 1, byIndex: 1 },
    ],
  },
  {
    name: 'Rooted Coffee Co',
    defaultLowStockThreshold: 6,
    users: [
      { email: 'owner@rooted.demo', displayName: 'Luca Rossi (Owner)' },
      { email: 'barista@rooted.demo', displayName: 'Priya Shah (Barista)' },
    ],
    categories: [
      { name: 'Beans', color: '#f59e0b' },
      { name: 'Equipment', color: '#10b981' },
      { name: 'Accessories', color: '#06b6d4' },
    ],
    suppliers: [
      { name: 'Highland Coffee', contactName: 'Mesfin Alemu', email: 'export@highland.demo', phone: '+251-11-555-0101' },
      { name: 'Café Sourcing Co', contactName: 'Isabel Marquez', email: 'hello@cafesource.demo', phone: '+1-312-555-0144' },
    ],
    products: [
      { name: 'Ethiopia Yirgacheffe 250g', sku: 'RC-BEAN-ETH', category: 'Beans', supplier: 'Highland Coffee', quantityOnHand: 34, costPrice: 7.2, sellingPrice: 18.0 },
      { name: 'Colombia Supremo 500g', sku: 'RC-BEAN-COL', category: 'Beans', supplier: 'Café Sourcing Co', quantityOnHand: 21, costPrice: 11.0, sellingPrice: 25.0 },
      { name: 'House Espresso Blend 1kg', sku: 'RC-BEAN-ESP', category: 'Beans', supplier: 'Café Sourcing Co', quantityOnHand: 18, costPrice: 16.0, sellingPrice: 36.0 },
      { name: 'Decaf Peru 250g', sku: 'RC-BEAN-DEC', category: 'Beans', supplier: 'Highland Coffee', quantityOnHand: 4, costPrice: 7.5, sellingPrice: 19.0, lowStockThreshold: 6 },
      { name: 'Hand Grinder Pro', sku: 'RC-EQP-GRND', category: 'Equipment', supplier: 'Café Sourcing Co', quantityOnHand: 9, costPrice: 42.0, sellingPrice: 99.0 },
      { name: 'V60 Drip Kit', sku: 'RC-EQP-V60', category: 'Equipment', supplier: 'Café Sourcing Co', quantityOnHand: 12, costPrice: 18.0, sellingPrice: 44.0 },
      { name: 'Paper Filters x100', sku: 'RC-ACC-FLT', category: 'Accessories', supplier: 'Café Sourcing Co', quantityOnHand: 55, costPrice: 1.2, sellingPrice: 6.0 },
      { name: 'Insulated Tumbler 350ml', sku: 'RC-ACC-TMB', category: 'Accessories', supplier: 'Café Sourcing Co', quantityOnHand: 2, costPrice: 6.5, sellingPrice: 22.0, lowStockThreshold: 5 },
    ],
    movements: [
      { sku: 'RC-BEAN-ETH', delta: 20, reason: 'adjust', note: 'Shipment arrived', daysAgo: 13, byIndex: 0 },
      { sku: 'RC-BEAN-COL', delta: 15, reason: 'adjust', note: 'Shipment arrived', daysAgo: 13, byIndex: 0 },
      { sku: 'RC-BEAN-ESP', delta: 20, reason: 'adjust', note: 'Weekly delivery', daysAgo: 10, byIndex: 0 },
      { sku: 'RC-BEAN-ETH', delta: -4, reason: 'adjust', note: 'Retail sales', daysAgo: 9, byIndex: 1 },
      { sku: 'RC-BEAN-COL', delta: -3, reason: 'adjust', note: 'Retail sales', daysAgo: 9, byIndex: 1 },
      { sku: 'RC-ACC-TMB', delta: -3, reason: 'adjust', note: 'Walk-in', daysAgo: 8, byIndex: 1 },
      { sku: 'RC-EQP-GRND', delta: -2, reason: 'adjust', note: 'Order #RC-442', daysAgo: 6, byIndex: 1 },
      { sku: 'RC-BEAN-DEC', delta: -2, reason: 'adjust', note: 'Retail sales', daysAgo: 5, byIndex: 1 },
      { sku: 'RC-BEAN-ESP', delta: -2, reason: 'adjust', note: 'Café usage', daysAgo: 4, byIndex: 1 },
      { sku: 'RC-ACC-FLT', delta: -6, reason: 'adjust', note: 'Pack bundles', daysAgo: 3, byIndex: 1 },
      { sku: 'RC-BEAN-ETH', delta: -2, reason: 'adjust', note: 'Retail sales', daysAgo: 1, byIndex: 1 },
    ],
  },
  {
    name: 'Bloom & Vine Florist',
    defaultLowStockThreshold: 4,
    users: [{ email: 'owner@bloom.demo', displayName: 'Hannah Novak (Owner)' }],
    categories: [
      { name: 'Flowers', color: '#ec4899' },
      { name: 'Pots & Soil', color: '#84cc16' },
      { name: 'Supplies', color: '#6366f1' },
    ],
    suppliers: [
      { name: 'Fresh Petals', contactName: 'Vivian Grey', email: 'orders@freshpetals.demo', phone: '+1-213-555-0188' },
      { name: 'Terra Supplies', contactName: 'Marco Bianchi', email: 'hello@terra.demo', phone: '+1-203-555-0121' },
    ],
    products: [
      { name: 'Red Rose (single stem)', sku: 'BV-FLW-RSE', category: 'Flowers', supplier: 'Fresh Petals', quantityOnHand: 46, costPrice: 0.8, sellingPrice: 3.5 },
      { name: 'Hydrangea Bunch', sku: 'BV-FLW-HYD', category: 'Flowers', supplier: 'Fresh Petals', quantityOnHand: 8, costPrice: 4.5, sellingPrice: 14.0 },
      { name: 'Dried Lavender Bundle', sku: 'BV-FLW-LAV', category: 'Flowers', supplier: 'Fresh Petals', quantityOnHand: 14, costPrice: 2.2, sellingPrice: 9.0 },
      { name: 'Ceramic Vase M', sku: 'BV-POT-VASM', category: 'Pots & Soil', supplier: 'Terra Supplies', quantityOnHand: 6, costPrice: 3.0, sellingPrice: 12.0 },
      { name: 'Potting Soil 5L', sku: 'BV-POT-SOIL', category: 'Pots & Soil', supplier: 'Terra Supplies', quantityOnHand: 20, costPrice: 2.4, sellingPrice: 8.5 },
      { name: 'Succulent Mini', sku: 'BV-FLW-SUC', category: 'Flowers', supplier: 'Terra Supplies', quantityOnHand: 3, costPrice: 1.5, sellingPrice: 6.0, lowStockThreshold: 5 },
      { name: 'Silk Ribbon 2m', sku: 'BV-SUP-RBN', category: 'Supplies', supplier: 'Terra Supplies', quantityOnHand: 30, costPrice: 0.5, sellingPrice: 2.5 },
    ],
    movements: [
      { sku: 'BV-FLW-RSE', delta: 50, reason: 'adjust', note: 'Weekly delivery', daysAgo: 10, byIndex: 0 },
      { sku: 'BV-FLW-HYD', delta: 12, reason: 'adjust', note: 'Weekly delivery', daysAgo: 10, byIndex: 0 },
      { sku: 'BV-FLW-RSE', delta: -4, reason: 'adjust', note: 'Wedding order', daysAgo: 8, byIndex: 0 },
      { sku: 'BV-FLW-HYD', delta: -2, reason: 'adjust', note: 'Event centrepieces', daysAgo: 7, byIndex: 0 },
      { sku: 'BV-POT-VASM', delta: -2, reason: 'adjust', note: 'Shop sales', daysAgo: 5, byIndex: 0 },
      { sku: 'BV-FLW-SUC', delta: -5, reason: 'adjust', note: 'Workshop supplies', daysAgo: 4, byIndex: 0 },
      { sku: 'BV-SUP-RBN', delta: -3, reason: 'adjust', note: 'Shop sales', daysAgo: 2, byIndex: 0 },
    ],
  },
  {
    name: 'Trailhead Outfitters',
    defaultLowStockThreshold: 5,
    users: [
      { email: 'owner@trailhead.demo', displayName: 'Diego Alvarez (Owner)' },
      { email: 'store@trailhead.demo', displayName: 'Sam Patel (Store lead)' },
    ],
    categories: [
      { name: 'Packs', color: '#0ea5e9' },
      { name: 'Camping', color: '#22c55e' },
      { name: 'Lights', color: '#eab308' },
      { name: 'Hydration', color: '#06b6d4' },
    ],
    suppliers: [
      { name: 'NorthRidge Gear', contactName: 'Ava Lindström', email: 'wholesale@northridge.demo', phone: '+1-503-555-0177' },
      { name: 'Alpine Imports', contactName: 'Matteo Russo', email: 'orders@alpineimports.demo', phone: '+39-02-555-0146' },
    ],
    products: [
      { name: '40L Daypack', sku: 'TH-PCK-40L', category: 'Packs', supplier: 'NorthRidge Gear', quantityOnHand: 11, costPrice: 42.0, sellingPrice: 119.0 },
      { name: '65L Expedition Pack', sku: 'TH-PCK-65L', category: 'Packs', supplier: 'NorthRidge Gear', quantityOnHand: 4, costPrice: 78.0, sellingPrice: 189.0, lowStockThreshold: 5 },
      { name: 'Trekking Poles (pair)', sku: 'TH-CMP-POLE', category: 'Camping', supplier: 'Alpine Imports', quantityOnHand: 16, costPrice: 18.0, sellingPrice: 59.0 },
      { name: 'Down Sleeping Bag -5C', sku: 'TH-CMP-SLB5', category: 'Camping', supplier: 'Alpine Imports', quantityOnHand: 6, costPrice: 95.0, sellingPrice: 219.0 },
      { name: '2L Water Bladder', sku: 'TH-HYD-B2L', category: 'Hydration', supplier: 'NorthRidge Gear', quantityOnHand: 22, costPrice: 8.0, sellingPrice: 24.0 },
      { name: 'Insulated Bottle 750ml', sku: 'TH-HYD-B750', category: 'Hydration', supplier: 'NorthRidge Gear', quantityOnHand: 9, costPrice: 7.5, sellingPrice: 21.0 },
      { name: '350lm Headlamp', sku: 'TH-LGT-HL35', category: 'Lights', supplier: 'Alpine Imports', quantityOnHand: 14, costPrice: 12.0, sellingPrice: 34.0 },
      { name: 'Camp Lantern USB', sku: 'TH-LGT-LAN', category: 'Lights', supplier: 'Alpine Imports', quantityOnHand: 0, costPrice: 15.0, sellingPrice: 44.0 },
      { name: 'Dry Bag 20L', sku: 'TH-CMP-DRY', category: 'Camping', supplier: 'NorthRidge Gear', quantityOnHand: 25, costPrice: 4.5, sellingPrice: 14.0 },
    ],
    movements: [
      { sku: 'TH-PCK-40L', delta: 6, reason: 'adjust', note: 'PO #TH-71 received', daysAgo: 14, byIndex: 0 },
      { sku: 'TH-PCK-65L', delta: 4, reason: 'adjust', note: 'PO #TH-71 received', daysAgo: 14, byIndex: 0 },
      { sku: 'TH-CMP-POLE', delta: 10, reason: 'adjust', note: 'Season restock', daysAgo: 12, byIndex: 0 },
      { sku: 'TH-LGT-LAN', delta: -3, reason: 'adjust', note: 'Clearance event', daysAgo: 10, byIndex: 1 },
      { sku: 'TH-CMP-SLB5', delta: -2, reason: 'adjust', note: 'Store sales', daysAgo: 8, byIndex: 1 },
      { sku: 'TH-HYD-B2L', delta: -3, reason: 'adjust', note: 'Group hike order', daysAgo: 7, byIndex: 1 },
      { sku: 'TH-PCK-40L', delta: -1, reason: 'adjust', note: 'Walk-in sale', daysAgo: 6, byIndex: 1 },
      { sku: 'TH-HYD-B750', delta: -4, reason: 'adjust', note: 'Walk-in sales', daysAgo: 5, byIndex: 1 },
      { sku: 'TH-LGT-HL35', delta: -2, reason: 'adjust', note: 'Walk-in sales', daysAgo: 4, byIndex: 1 },
      { sku: 'TH-CMP-DRY', delta: -2, reason: 'adjust', note: 'Walk-in sales', daysAgo: 3, byIndex: 1 },
      { sku: 'TH-PCK-65L', delta: -1, reason: 'adjust', note: 'Store sale', daysAgo: 2, byIndex: 1 },
      { sku: 'TH-LGT-LAN', delta: -1, reason: 'adjust', note: 'Store sale', daysAgo: 1, byIndex: 1 },
    ],
  },
];

// Backwards-compat export: the old single demo login still exists for anyone
// who was using it from an earlier commit.
const DEMO_EMAIL = 'demo@stockflow.local';

async function seedBusiness(biz) {
  // One password hash reused across all seeded users (dev only).
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const org = await Organization.create({
    name: biz.name,
    defaultLowStockThreshold: biz.defaultLowStockThreshold,
  });

  // Users: everyone in this list shares the same organization.
  const users = [];
  for (const u of biz.users) {
    const user = await User.create({
      email: u.email,
      passwordHash,
      organization: org._id,
    });
    users.push({ ...user.toObject(), displayName: u.displayName });
  }

  // Categories and suppliers, keyed by name for later lookup.
  const catByName = {};
  for (const c of biz.categories) {
    const cat = await Category.create({ organization: org._id, name: c.name, color: c.color });
    catByName[c.name] = cat;
  }
  const supByName = {};
  for (const s of biz.suppliers) {
    const sup = await Supplier.create({ organization: org._id, ...s });
    supByName[s.name] = sup;
  }

  // Products: reserve a reference by SKU so movements can target them.
  const prodBySku = {};
  for (const p of biz.products) {
    const product = await Product.create({
      organization: org._id,
      name: p.name,
      sku: p.sku,
      imageUrl: PRODUCT_IMAGES[p.sku] || fallbackImage(p.sku),
      quantityOnHand: p.quantityOnHand,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      lowStockThreshold: p.lowStockThreshold ?? null,
      category: catByName[p.category]?._id || null,
      supplier: supByName[p.supplier]?._id || null,
      lastUpdatedBy: users[0]._id,
    });
    prodBySku[p.sku] = product;
  }

  // Movements: write with historical createdAt so timelines look real.
  // The resultingQty we record is derived from the product's *current* qty
  // (what the seed declared) — we're reconstructing a log retrospectively,
  // so this trades perfect precision for realism and simplicity.
  for (const m of biz.movements) {
    const product = prodBySku[m.sku];
    if (!product) continue;
    const when = new Date(Date.now() - m.daysAgo * 24 * 3600 * 1000);
    await StockMovement.create({
      organization: org._id,
      product: product._id,
      user: users[m.byIndex]?._id || users[0]._id,
      delta: m.delta,
      resultingQty: product.quantityOnHand,
      reason: m.reason,
      note: m.note,
      createdAt: when,
      updatedAt: when,
    });
  }

  return { org, users };
}

async function seedDemo() {
  // Skip if anything is already seeded (idempotent-ish for restarts).
  const existing = await Organization.findOne();
  if (existing) return;

  // Keep the original simple demo login working for backwards-compat.
  const legacyOrg = await Organization.create({
    name: 'Demo Store',
    defaultLowStockThreshold: 5,
  });
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await User.create({
    email: DEMO_EMAIL,
    passwordHash,
    organization: legacyOrg._id,
  });

  // Seed every full-featured business.
  const seeded = [];
  for (const biz of BUSINESSES) {
    seeded.push(await seedBusiness(biz));
  }

  console.log('--------------------------------------------------------');
  console.log('StockFlow demo logins (password for every account: demo1234):');
  console.log(`  [Simple]  ${DEMO_EMAIL}     (empty catalogue)`);
  for (const biz of BUSINESSES) {
    console.log(`  [${biz.name}]`);
    for (const u of biz.users) {
      console.log(`    - ${u.email}   — ${u.displayName}`);
    }
  }
  console.log('--------------------------------------------------------');
}

module.exports = { seedDemo, DEMO_EMAIL, DEMO_PASSWORD };
