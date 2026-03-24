// Load environment variables sebelum import yang lain
require('dotenv').config();

const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Start server dan test koneksi database
 */
const startServer = async () => {
  try {
    // Test koneksi database
    const client = await pool.connect();
    console.log('✅ Database connection established successfully');
    client.release();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🏛️  Museum API Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📋 Museums:      http://localhost:${PORT}/api/museums`);
      console.log(`📋 Provinces:    http://localhost:${PORT}/api/provinces`);
      console.log(`📋 Regencies:    http://localhost:${PORT}/api/regencies`);
      console.log(`📋 Categories:   http://localhost:${PORT}/api/categories`);
      console.log('-------------------------------------------');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
