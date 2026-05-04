const { query } = require('../config/db');
const { randomUUID } = require('crypto');

const sanitizeOptionalText = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

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
           m.deskripsi, m.deskripsi_en, m.tahun_dibangun,
           m.alamat_lengkap, m.alamat_lengkap_en,
           m.jam_buka, m.jam_buka_en,
           m.harga_tiket, m.website, m.sumber_informasi, m.foto_url,
           m.virtual_tour_url, m.livecam_url,
           m.provinsi_id, p.nama_provinsi, p.nama_provinsi_en,
           m.kabupaten_id, k.nama_kabupaten, k.nama_kabupaten_en,
           m.kategori_id, kt.nama_kategori, kt.nama_kategori_en
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
const createMuseum = async ({
  source_id,
  nama_museum,
  latitude,
  longitude,
  provinsi_id,
  kabupaten_id,
  kategori_id,
  deskripsi,
  deskripsi_en,
  tahun_dibangun,
  alamat_lengkap,
  alamat_lengkap_en,
  jam_buka,
  jam_buka_en,
  harga_tiket,
  website,
  sumber_informasi,
  foto_url,
  virtual_tour_url,
  livecam_url,
}) => {
  const normalizedSourceId = typeof source_id === 'string' ? source_id.trim() : '';
  const finalSourceId = normalizedSourceId || `admin/${randomUUID()}`;
  const normalizedYear = tahun_dibangun === '' || tahun_dibangun === undefined || tahun_dibangun === null
    ? null
    : parseInt(tahun_dibangun, 10);

  const sql = `
    INSERT INTO museum (
      source_id, nama_museum, latitude, longitude, provinsi_id, kabupaten_id, kategori_id,
      deskripsi, deskripsi_en, tahun_dibangun, alamat_lengkap, alamat_lengkap_en,
      jam_buka, jam_buka_en, harga_tiket, website, sumber_informasi, foto_url,
      virtual_tour_url, livecam_url
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    RETURNING *
  `;
  const params = [
    finalSourceId,
    nama_museum,
    latitude,
    longitude,
    provinsi_id,
    kabupaten_id,
    kategori_id || null,
    sanitizeOptionalText(deskripsi),
    sanitizeOptionalText(deskripsi_en),
    Number.isNaN(normalizedYear) ? null : normalizedYear,
    sanitizeOptionalText(alamat_lengkap),
    sanitizeOptionalText(alamat_lengkap_en),
    sanitizeOptionalText(jam_buka),
    sanitizeOptionalText(jam_buka_en),
    sanitizeOptionalText(harga_tiket),
    sanitizeOptionalText(website),
    sanitizeOptionalText(sumber_informasi),
    sanitizeOptionalText(foto_url),
    sanitizeOptionalText(virtual_tour_url),
    sanitizeOptionalText(livecam_url),
  ];
  const result = await query(sql, params);
  return result.rows[0];
};

/**
 * Update museum
 */
const updateMuseum = async (
  id,
  {
    nama_museum,
    latitude,
    longitude,
    provinsi_id,
    kabupaten_id,
    kategori_id,
    deskripsi,
    deskripsi_en,
    tahun_dibangun,
    alamat_lengkap,
    alamat_lengkap_en,
    jam_buka,
    jam_buka_en,
    harga_tiket,
    website,
    sumber_informasi,
    foto_url,
    virtual_tour_url,
    livecam_url,
  }
) => {
  const normalizedYear = tahun_dibangun === '' || tahun_dibangun === undefined || tahun_dibangun === null
    ? null
    : parseInt(tahun_dibangun, 10);

  const sql = `
    UPDATE museum
    SET nama_museum = $1, latitude = $2, longitude = $3,
        provinsi_id = $4, kabupaten_id = $5, kategori_id = $6,
        deskripsi = $7, deskripsi_en = $8, tahun_dibangun = $9,
        alamat_lengkap = $10, alamat_lengkap_en = $11,
        jam_buka = $12, jam_buka_en = $13,
        harga_tiket = $14, website = $15, sumber_informasi = $16, foto_url = $17,
        virtual_tour_url = $18, livecam_url = $19
    WHERE id = $20
    RETURNING *
  `;
  const params = [
    nama_museum,
    latitude,
    longitude,
    provinsi_id,
    kabupaten_id,
    kategori_id || null,
    sanitizeOptionalText(deskripsi),
    sanitizeOptionalText(deskripsi_en),
    Number.isNaN(normalizedYear) ? null : normalizedYear,
    sanitizeOptionalText(alamat_lengkap),
    sanitizeOptionalText(alamat_lengkap_en),
    sanitizeOptionalText(jam_buka),
    sanitizeOptionalText(jam_buka_en),
    sanitizeOptionalText(harga_tiket),
    sanitizeOptionalText(website),
    sanitizeOptionalText(sumber_informasi),
    sanitizeOptionalText(foto_url),
    sanitizeOptionalText(virtual_tour_url),
    sanitizeOptionalText(livecam_url),
    id,
  ];
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
