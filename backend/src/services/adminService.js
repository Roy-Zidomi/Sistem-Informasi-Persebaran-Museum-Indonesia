const { query } = require('../config/db');

/**
 * Helper: bangun WHERE clause dari filter global
 */
const buildFilterClause = (filters, startIndex = 1) => {
  const conditions = [];
  const params = [];
  let idx = startIndex;

  if (filters.provinsi_id) {
    conditions.push(`m.provinsi_id = $${idx}`);
    params.push(filters.provinsi_id);
    idx++;
  }
  if (filters.kabupaten_id) {
    conditions.push(`m.kabupaten_id = $${idx}`);
    params.push(filters.kabupaten_id);
    idx++;
  }
  if (filters.kategori_id) {
    conditions.push(`m.kategori_id = $${idx}`);
    params.push(filters.kategori_id);
    idx++;
  }

  return { conditions, params, nextIndex: idx };
};

/**
 * Dashboard statistik cards
 */
const getDashboardStats = async (filters = {}) => {
  const { conditions, params } = buildFilterClause(filters);
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Total museum (dengan filter)
  const museumCount = await query(
    `SELECT COUNT(*) AS total FROM museum m ${whereClause}`, params
  );

  // Total provinsi yang punya museum
  const provCount = await query(
    `SELECT COUNT(DISTINCT m.provinsi_id) AS total FROM museum m ${whereClause}`, params
  );

  // Total kabupaten yang punya museum
  const kabCount = await query(
    `SELECT COUNT(DISTINCT m.kabupaten_id) AS total FROM museum m ${whereClause}`, params
  );

  // Total kategori yang dipakai museum
  const katConditions = [...conditions, 'm.kategori_id IS NOT NULL'];
  const katWhere = `WHERE ${katConditions.join(' AND ')}`;
  const katCount = await query(
    `SELECT COUNT(DISTINCT m.kategori_id) AS total FROM museum m ${katWhere}`,
    params
  );

  // Museum tanpa kategori
  const noKatConditions = [...conditions, 'm.kategori_id IS NULL'];
  const noKatWhere = `WHERE ${noKatConditions.join(' AND ')}`;
  const noKatCount = await query(
    `SELECT COUNT(*) AS total FROM museum m ${noKatWhere}`, params
  );

  return {
    total_museum: parseInt(museumCount.rows[0].total, 10),
    total_provinsi: parseInt(provCount.rows[0].total, 10),
    total_kabupaten: parseInt(kabCount.rows[0].total, 10),
    total_kategori: parseInt(katCount.rows[0].total, 10),
    museum_tanpa_kategori: parseInt(noKatCount.rows[0].total, 10),
  };
};

/**
 * Jumlah museum per provinsi (untuk bar chart)
 */
const getMuseumsByProvince = async (filters = {}) => {
  const { conditions, params } = buildFilterClause(filters);
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT p.nama_provinsi AS label, COUNT(m.id) AS value
    FROM museum m
    LEFT JOIN provinsi p ON m.provinsi_id = p.id
    ${whereClause}
    GROUP BY p.nama_provinsi
    ORDER BY value DESC
  `;

  const result = await query(sql, params);
  return result.rows.map(r => ({ ...r, value: parseInt(r.value, 10) }));
};

/**
 * Jumlah museum per kategori (untuk pie chart)
 */
const getMuseumsByCategory = async (filters = {}) => {
  const { conditions, params } = buildFilterClause(filters);
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT COALESCE(kt.nama_kategori, 'Tidak Dikategorikan') AS label, COUNT(m.id) AS value
    FROM museum m
    LEFT JOIN kategori kt ON m.kategori_id = kt.id
    ${whereClause}
    GROUP BY kt.nama_kategori
    ORDER BY value DESC
  `;

  const result = await query(sql, params);
  return result.rows.map(r => ({ ...r, value: parseInt(r.value, 10) }));
};

/**
 * Top kabupaten berdasarkan jumlah museum (untuk bar chart)
 */
const getTopRegencies = async (filters = {}, limit = 15) => {
  const { conditions, params, nextIndex } = buildFilterClause(filters);
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT k.nama_kabupaten AS label, COUNT(m.id) AS value
    FROM museum m
    LEFT JOIN kabupaten k ON m.kabupaten_id = k.id
    ${whereClause}
    GROUP BY k.nama_kabupaten
    ORDER BY value DESC
    LIMIT $${nextIndex}
  `;

  params.push(limit);
  const result = await query(sql, params);
  return result.rows.map(r => ({ ...r, value: parseInt(r.value, 10) }));
};

/**
 * Daftar museum dengan pagination, search, dan filter (untuk tabel kelola)
 */
const getMuseumsAdmin = async ({ page = 1, limit = 10, offset = 0, search, provinsi_id, kabupaten_id, kategori_id }) => {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (provinsi_id) { conditions.push(`m.provinsi_id = $${idx}`); params.push(provinsi_id); idx++; }
  if (kabupaten_id) { conditions.push(`m.kabupaten_id = $${idx}`); params.push(kabupaten_id); idx++; }
  if (kategori_id) { conditions.push(`m.kategori_id = $${idx}`); params.push(kategori_id); idx++; }
  if (search) { conditions.push(`m.nama_museum ILIKE $${idx}`); params.push(`%${search}%`); idx++; }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count
  const countRes = await query(`SELECT COUNT(*) AS total FROM museum m ${whereClause}`, params);
  const totalData = parseInt(countRes.rows[0].total, 10);

  // Data
  const sql = `
    SELECT m.id, m.source_id, m.nama_museum, m.latitude, m.longitude,
           m.provinsi_id, p.nama_provinsi,
           m.kabupaten_id, k.nama_kabupaten,
           m.kategori_id, kt.nama_kategori
    FROM museum m
    LEFT JOIN provinsi p ON m.provinsi_id = p.id
    LEFT JOIN kabupaten k ON m.kabupaten_id = k.id
    LEFT JOIN kategori kt ON m.kategori_id = kt.id
    ${whereClause}
    ORDER BY m.id DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  params.push(limit, offset);

  const dataRes = await query(sql, params);

  return {
    data: dataRes.rows,
    totalData,
    totalPages: Math.ceil(totalData / limit),
    page,
    limit,
  };
};

/**
 * Tambah museum baru
 */
const createMuseum = async ({ nama_museum, latitude, longitude, provinsi_id, kabupaten_id, kategori_id }) => {
  const sql = `
    INSERT INTO museum (nama_museum, latitude, longitude, provinsi_id, kabupaten_id, kategori_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const params = [nama_museum, latitude, longitude, provinsi_id, kabupaten_id, kategori_id || null];
  const result = await query(sql, params);
  return result.rows[0];
};

/**
 * Update museum
 */
const updateMuseum = async (id, { nama_museum, latitude, longitude, provinsi_id, kabupaten_id, kategori_id }) => {
  const sql = `
    UPDATE museum
    SET nama_museum = $1, latitude = $2, longitude = $3,
        provinsi_id = $4, kabupaten_id = $5, kategori_id = $6
    WHERE id = $7
    RETURNING *
  `;
  const params = [nama_museum, latitude, longitude, provinsi_id, kabupaten_id, kategori_id || null, id];
  const result = await query(sql, params);
  return result.rows[0] || null;
};

/**
 * Hapus museum
 */
const deleteMuseum = async (id) => {
  const result = await query('DELETE FROM museum WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
};

module.exports = {
  getDashboardStats,
  getMuseumsByProvince,
  getMuseumsByCategory,
  getTopRegencies,
  getMuseumsAdmin,
  createMuseum,
  updateMuseum,
  deleteMuseum,
};
