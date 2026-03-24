const { Pool } = require('pg');

// Konfigurasi koneksi PostgreSQL menggunakan environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Connection pool settings
  max: 20,               // Maksimal koneksi dalam pool
  idleTimeoutMillis: 30000, // Timeout koneksi idle (30 detik)
  connectionTimeoutMillis: 5000, // Timeout saat membuat koneksi baru (5 detik)
});

// Log ketika pool berhasil connect
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database');
});

// Log error pada pool
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err);
  process.exit(-1);
});

/**
 * Helper function untuk menjalankan query
 * @param {string} text - SQL query string
 * @param {Array} params - Parameter untuk parameterized query
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
};
