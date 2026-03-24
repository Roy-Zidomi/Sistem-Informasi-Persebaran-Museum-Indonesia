const { query } = require('../config/db');

/**
 * Ambil semua museum dengan support filter, search, pagination, dan sorting.
 * Semua query menggunakan parameterized query untuk keamanan dari SQL injection.
 */
const getAllMuseums = async ({ page = 1, limit = 10, offset = 0, sort = 'id', order = 'ASC', provinsi, kabupaten, kategori, search }) => {
  // Whitelist kolom yang bisa di-sort untuk mencegah SQL injection
  const allowedSortColumns = ['id', 'nama_museum', 'latitude', 'longitude'];
  const allowedOrder = ['ASC', 'DESC'];

  const sortColumn = allowedSortColumns.includes(sort) ? sort : 'id';
  const sortOrder = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

  // Bangun WHERE clause secara dinamis
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (provinsi) {
    conditions.push(`p.nama_provinsi ILIKE $${paramIndex}`);
    params.push(`%${provinsi}%`);
    paramIndex++;
  }

  if (kabupaten) {
    conditions.push(`k.nama_kabupaten ILIKE $${paramIndex}`);
    params.push(`%${kabupaten}%`);
    paramIndex++;
  }

  if (kategori) {
    conditions.push(`kt.nama_kategori ILIKE $${paramIndex}`);
    params.push(`%${kategori}%`);
    paramIndex++;
  }

  if (search) {
    conditions.push(`m.nama_museum ILIKE $${paramIndex}`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Query untuk menghitung total data (untuk pagination)
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM museum m
    LEFT JOIN provinsi p ON m.provinsi_id = p.id
    LEFT JOIN kabupaten k ON m.kabupaten_id = k.id
    LEFT JOIN kategori kt ON m.kategori_id = kt.id
    ${whereClause}
  `;

  const countResult = await query(countQuery, params);
  const totalData = parseInt(countResult.rows[0].total, 10);

  // Query untuk mengambil data museum dengan JOIN
  const dataQuery = `
    SELECT 
      m.id,
      m.source_id,
      m.nama_museum,
      m.latitude,
      m.longitude,
      m.provinsi_id,
      p.nama_provinsi,
      m.kabupaten_id,
      k.nama_kabupaten,
      m.kategori_id,
      kt.nama_kategori
    FROM museum m
    LEFT JOIN provinsi p ON m.provinsi_id = p.id
    LEFT JOIN kabupaten k ON m.kabupaten_id = k.id
    LEFT JOIN kategori kt ON m.kategori_id = kt.id
    ${whereClause}
    ORDER BY m.${sortColumn} ${sortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  const dataResult = await query(dataQuery, params);

  return {
    data: dataResult.rows,
    totalData,
    totalPages: Math.ceil(totalData / limit),
    page,
    limit,
  };
};

/**
 * Ambil detail museum berdasarkan ID
 */
const getMuseumById = async (id) => {
  const sql = `
    SELECT 
      m.id,
      m.source_id,
      m.nama_museum,
      m.latitude,
      m.longitude,
      m.provinsi_id,
      p.nama_provinsi,
      m.kabupaten_id,
      k.nama_kabupaten,
      m.kategori_id,
      kt.nama_kategori
    FROM museum m
    LEFT JOIN provinsi p ON m.provinsi_id = p.id
    LEFT JOIN kabupaten k ON m.kabupaten_id = k.id
    LEFT JOIN kategori kt ON m.kategori_id = kt.id
    WHERE m.id = $1
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

/**
 * Cari museum terdekat dari lokasi user menggunakan rumus Haversine.
 * Rumus Haversine menghitung jarak antara dua titik koordinat di permukaan bumi.
 * 
 * @param {number} lat - Latitude lokasi user
 * @param {number} lng - Longitude lokasi user
 * @param {number} radius - Radius pencarian dalam kilometer
 * @param {number} limit - Jumlah hasil maksimal
 */
const getNearbyMuseums = async (lat, lng, radius, limit = 20) => {
  const sql = `
    SELECT 
      m.id,
      m.source_id,
      m.nama_museum,
      m.latitude,
      m.longitude,
      m.provinsi_id,
      p.nama_provinsi,
      m.kabupaten_id,
      k.nama_kabupaten,
      m.kategori_id,
      kt.nama_kategori,
      (
        6371 * acos(
          LEAST(1.0, 
            cos(radians($1)) * cos(radians(m.latitude)) *
            cos(radians(m.longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(m.latitude))
          )
        )
      ) AS distance_km
    FROM museum m
    LEFT JOIN provinsi p ON m.provinsi_id = p.id
    LEFT JOIN kabupaten k ON m.kabupaten_id = k.id
    LEFT JOIN kategori kt ON m.kategori_id = kt.id
    WHERE m.latitude IS NOT NULL AND m.longitude IS NOT NULL
    AND (
      6371 * acos(
        LEAST(1.0,
          cos(radians($1)) * cos(radians(m.latitude)) *
          cos(radians(m.longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(m.latitude))
        )
      )
    ) <= $3
    ORDER BY distance_km ASC
    LIMIT $4
  `;

  // Catatan: Menggunakan LEAST(1.0, ...) untuk menghindari error acos 
  // ketika floating point menghasilkan nilai sedikit > 1
  const result = await query(sql, [lat, lng, radius, limit]);

  // Bulatkan distance_km ke 2 desimal
  return result.rows.map((row) => ({
    ...row,
    distance_km: parseFloat(parseFloat(row.distance_km).toFixed(2)),
  }));
};

module.exports = {
  getAllMuseums,
  getMuseumById,
  getNearbyMuseums,
};
