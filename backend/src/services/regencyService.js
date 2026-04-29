const { query } = require('../config/db');

/**
 * Ambil semua kabupaten, opsional filter berdasarkan provinsi_id
 * @param {number|null} provinsiId - Filter berdasarkan provinsi (opsional)
 */
const getAllRegencies = async (provinsiId = null) => {
  let sql = `
    SELECT
      k.id,
      k.provinsi_id,
      k.nama_kabupaten,
      k.nama_kabupaten_en,
      p.nama_provinsi,
      p.nama_provinsi_en
    FROM kabupaten k
    LEFT JOIN provinsi p ON k.provinsi_id = p.id
  `;

  const params = [];

  if (provinsiId) {
    sql += ` WHERE k.provinsi_id = $1`;
    params.push(provinsiId);
  }

  sql += ` ORDER BY k.nama_kabupaten ASC`;

  const result = await query(sql, params);
  return result.rows;
};

module.exports = {
  getAllRegencies,
};
