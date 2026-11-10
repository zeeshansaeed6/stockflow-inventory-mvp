/**
 * StockFlow API entry point.
 * - Loads env config
 * - Connects to MongoDB
 * - Mounts REST routes
 * - Starts the HTTP server
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { seedDemo } = require('./config/seed');

// Route modules
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const reportRoutes = require('./routes/reports');

const app = express();

// Behind a proxy/load balancer (Render, etc.): trust X-Forwarded-* so
// rate limiting sees real client IPs.
app.set('trust proxy', 1);

// ---- Middleware ---------------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
// Compact request log in dev, hidden during automated tests.
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Throttle auth endpoints: slows down brute-force login attempts.
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many auth attempts, please try again later.' },
  }),
);

// ---- Health check -------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'stockflow-api' });
});

// ---- API routes ---------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/reports', reportRoutes);

// ---- 404 for unknown API routes ----------------------------------------
app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---- Centralised error handler -----------------------------------------
app.use((err, _req, res, _next) => {
  console.error('[API error]', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
});

// ---- Boot ---------------------------------------------------------------
const PORT = process.env.PORT || 5000;

// Seed demo data when the in-memory MongoDB is used (so login works
// immediately after a fresh `npm run dev`). Also honours SEED_DEMO=true.
async function maybeSeed() {
  const shouldSeed = !process.env.MONGO_URI || process.env.SEED_DEMO === 'true';
  if (shouldSeed) await seedDemo();
}

connectDB()
  .then(maybeSeed)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`StockFlow API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
