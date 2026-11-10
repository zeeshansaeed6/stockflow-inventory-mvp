/**
 * Dev-only seed data.
 *
 * Creates a predictable demo user + sample products so the app is usable
 * immediately after `npm run dev` with the in-memory MongoDB fallback.
 * Runs only when SEED_DEMO=true (default when MONGO_URI is unset).
 */

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Product = require('../models/Product');

const DEMO_EMAIL = 'demo@stockflow.local';
const DEMO_PASSWORD = 'demo1234';
const DEMO_ORG = 'Demo Store';

async function seedDemo() {
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) return;

  const org = await Organization.create({
    name: DEMO_ORG,
    defaultLowStockThreshold: 5,
  });

  const user = await User.create({
    email: DEMO_EMAIL,
    passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
    organization: org._id,
  });

  // A small catalogue so the Dashboard and Products pages are not empty.
  await Product.insertMany([
    {
      organization: org._id,
      name: 'Blue T-Shirt (M)',
      sku: 'TSHIRT-BLU-M',
      description: 'Classic blue tee, medium.',
      quantityOnHand: 42,
      costPrice: 4.5,
      sellingPrice: 14.99,
      lastUpdatedBy: user._id,
    },
    {
      organization: org._id,
      name: 'Leather Wallet',
      sku: 'WALLET-BRN',
      description: 'Brown bifold.',
      quantityOnHand: 3,
      costPrice: 8.0,
      sellingPrice: 29.99,
      lowStockThreshold: 5,
      lastUpdatedBy: user._id,
    },
    {
      organization: org._id,
      name: 'Water Bottle',
      sku: 'BOTTLE-500',
      description: '500 ml stainless steel.',
      quantityOnHand: 0,
      costPrice: 3.0,
      sellingPrice: 9.5,
      lastUpdatedBy: user._id,
    },
  ]);

  console.log(
    `Seeded demo account -> email: ${DEMO_EMAIL}  password: ${DEMO_PASSWORD}`,
  );
}

module.exports = { seedDemo, DEMO_EMAIL, DEMO_PASSWORD };
