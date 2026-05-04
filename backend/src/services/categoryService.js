const { query } = require('../config/db');

/**
 * Ambil semua data kategori museum
 */
const getAllCategories = async () => {
  const sql = `
    SELECT id, nama_kategori, nama_kategori_en
    FROM kategori
    ORDER BY nama_kategori ASC
  `;

  const result = await query(sql);
  return result.rows;
};

module.exports = {
  getAllCategories,
};
