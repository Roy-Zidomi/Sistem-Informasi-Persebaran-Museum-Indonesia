// Force nodemon restart
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
    const server = app.listen(PORT, () => {
      console.log(`🏛️  Museum API Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📋 Museums:      http://localhost:${PORT}/api/museums`);
      console.log(`📋 Provinces:    http://localhost:${PORT}/api/provinces`);
      console.log(`📋 Regencies:    http://localhost:${PORT}/api/regencies`);
      console.log(`📋 Categories:   http://localhost:${PORT}/api/categories`);
      console.log('-------------------------------------------');
    });

    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} sedang dipakai proses lain. Tutup server lama atau ubah PORT di .env.`);
      } else {
        console.error('Server gagal berjalan:', error.message);
      }

      await pool.end().catch(() => {});
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
