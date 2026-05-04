const { query } = require('../config/db');

/**
 * Ambil semua data provinsi
 */
const getAllProvinces = async () => {
  const sql = `
    SELECT id, nama_provinsi, nama_provinsi_en
    FROM provinsi
    ORDER BY nama_provinsi ASC
  `;

  const result = await query(sql);
  return result.rows;
};

module.exports = {
  getAllProvinces,
};
