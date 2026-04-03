const adminService = require('../services/adminService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * GET /api/admin/dashboard/stats
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const { provinsi_id, kabupaten_id, kategori_id } = req.query;
    const stats = await adminService.getDashboardStats({ provinsi_id, kabupaten_id, kategori_id });
    return successResponse(res, 'Statistik dashboard berhasil diambil', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/museums-by-province
 */
const getMuseumsByProvince = async (req, res, next) => {
  try {
    const { provinsi_id, kabupaten_id, kategori_id } = req.query;
    const data = await adminService.getMuseumsByProvince({ provinsi_id, kabupaten_id, kategori_id });
    return successResponse(res, 'Data chart provinsi berhasil diambil', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/museums-by-category
 */
const getMuseumsByCategory = async (req, res, next) => {
  try {
    const { provinsi_id, kabupaten_id, kategori_id } = req.query;
    const data = await adminService.getMuseumsByCategory({ provinsi_id, kabupaten_id, kategori_id });
    return successResponse(res, 'Data chart kategori berhasil diambil', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/dashboard/top-regencies
 */
const getTopRegencies = async (req, res, next) => {
  try {
    const { provinsi_id, kabupaten_id, kategori_id, limit } = req.query;
    const data = await adminService.getTopRegencies({ provinsi_id, kabupaten_id, kategori_id }, parseInt(limit) || 15);
    return successResponse(res, 'Data chart top kabupaten berhasil diambil', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/museums
 */
const getMuseums = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, provinsi_id, kabupaten_id, kategori_id } = req.query;
    const p = parseInt(page, 10) || 1;
    const l = parseInt(limit, 10) || 10;
    const offset = (p - 1) * l;

    const result = await adminService.getMuseumsAdmin({
      page: p, limit: l, offset, search, provinsi_id, kabupaten_id, kategori_id,
    });

    return successResponse(res, 'Daftar museum berhasil diambil', result.data, 200, {
      page: result.page,
      limit: result.limit,
      total_data: result.totalData,
      total_pages: result.totalPages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/museums
 */
const createMuseum = async (req, res, next) => {
  try {
    const {
      source_id,
      nama_museum,
      latitude,
      longitude,
      provinsi_id,
      kabupaten_id,
      kategori_id,
      deskripsi,
      tahun_dibangun,
      alamat_lengkap,
      jam_buka,
      harga_tiket,
      website,
      sumber_informasi,
      foto_url,
    } = req.body;

    if (!nama_museum || !latitude || !longitude || !provinsi_id || !kabupaten_id) {
      return errorResponse(res, 400, 'Field nama_museum, latitude, longitude, provinsi_id, dan kabupaten_id wajib diisi');
    }

    const museum = await adminService.createMuseum({
      source_id,
      nama_museum,
      latitude,
      longitude,
      provinsi_id,
      kabupaten_id,
      kategori_id,
      deskripsi,
      tahun_dibangun,
      alamat_lengkap,
      jam_buka,
      harga_tiket,
      website,
      sumber_informasi,
      foto_url,
    });

    return successResponse(res, 'Museum berhasil ditambahkan', museum, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/museums/:id
 */
const updateMuseum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nama_museum,
      latitude,
      longitude,
      provinsi_id,
      kabupaten_id,
      kategori_id,
      deskripsi,
      tahun_dibangun,
      alamat_lengkap,
      jam_buka,
      harga_tiket,
      website,
      sumber_informasi,
      foto_url,
    } = req.body;

    if (!nama_museum || !latitude || !longitude || !provinsi_id || !kabupaten_id) {
      return errorResponse(res, 400, 'Field nama_museum, latitude, longitude, provinsi_id, dan kabupaten_id wajib diisi');
    }

    const museum = await adminService.updateMuseum(id, {
      nama_museum,
      latitude,
      longitude,
      provinsi_id,
      kabupaten_id,
      kategori_id,
      deskripsi,
      tahun_dibangun,
      alamat_lengkap,
      jam_buka,
      harga_tiket,
      website,
      sumber_informasi,
      foto_url,
    });

    if (!museum) {
      return errorResponse(res, 404, `Museum dengan ID ${id} tidak ditemukan`);
    }

    return successResponse(res, 'Museum berhasil diperbarui', museum);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/museums/:id
 */
const deleteMuseum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await adminService.deleteMuseum(id);

    if (!deleted) {
      return errorResponse(res, 404, `Museum dengan ID ${id} tidak ditemukan`);
    }

    return successResponse(res, 'Museum berhasil dihapus', { id: deleted.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getMuseumsByProvince,
  getMuseumsByCategory,
  getTopRegencies,
  getMuseums,
  createMuseum,
  updateMuseum,
  deleteMuseum,
};
