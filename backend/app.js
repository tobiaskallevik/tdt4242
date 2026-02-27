// Express application factory – no server start, no DB sync
// Separated from server.js for testability
const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

module.exports = app;
