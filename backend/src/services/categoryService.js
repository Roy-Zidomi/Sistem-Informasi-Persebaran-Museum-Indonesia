const { query } = require('../config/db');

/**
 * Ambil semua data kategori museum
 */
const getAllCategories = async () => {
  const sql = `
    SELECT id, nama_kategori
    FROM kategori
    ORDER BY nama_kategori ASC
  `;

  const result = await query(sql);
  return result.rows;
};

module.exports = {
  getAllCategories,
};
