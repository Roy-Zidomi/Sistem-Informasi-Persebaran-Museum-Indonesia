const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ========================
// Middleware
// ========================

// Enable CORS untuk semua origin (bisa dikonfigurasi lebih ketat untuk production)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// ========================
// Routes
// ========================

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Museum API is running 🏛️',
    timestamp: new Date().toISOString(),
  });
});

// Mount semua API routes di prefix /api
app.use('/api', routes);

// ========================
// Error Handling
// ========================

// Handler untuk route yang tidak ditemukan
app.use(notFoundHandler);

// Global error handler (harus paling terakhir)
app.use(errorHandler);

module.exports = app;
