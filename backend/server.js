// Express server entry point
// Brings together all routes, middleware, and database sync
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const consentRoutes = require('./routes/consent');
const usageLogRoutes = require('./routes/usageLogs');

const app = express();

// Global middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/usage-logs', usageLogRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);

// Start server & sync database
const PORT = process.env.PORT || 4000;

sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = app;
