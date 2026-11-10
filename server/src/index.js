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
const morgan = require('morgan');

const connectDB = require('./config/db');

// Route modules
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');

const app = express();

// ---- Middleware ---------------------------------------------------------
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

// ---- Health check -------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'stockflow-api' });
});

// ---- API routes ---------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

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

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`StockFlow API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
