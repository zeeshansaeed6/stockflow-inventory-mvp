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

// ---- Health check -------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'stockflow-api' });
});

// ---- API routes ---------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

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
