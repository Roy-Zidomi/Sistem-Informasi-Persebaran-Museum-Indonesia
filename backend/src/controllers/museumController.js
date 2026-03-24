const museumService = require('../services/museumService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { validatePagination, validateNearbyParams } = require('../utils/validator');

/**
 * GET /api/museums
 * Ambil semua museum dengan support filter, search, dan pagination
 */
const getMuseums = async (req, res, next) => {
  try {
    // Validasi pagination
    const paginationResult = validatePagination(req.query);
    if (paginationResult.error) {
      return errorResponse(res, 400, paginationResult.error);
    }

    const { page, limit, offset } = paginationResult;
    const { sort = 'id', order = 'ASC', provinsi, kabupaten, kategori, search } = req.query;

    const result = await museumService.getAllMuseums({
      page,
      limit,
      offset,
      sort,
      order,
      provinsi,
      kabupaten,
      kategori,
      search,
    });

    return successResponse(res, 'Data museum berhasil diambil', result.data, 200, {
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
 * GET /api/museums/:id
 * Ambil detail museum berdasarkan ID
 */
const getMuseumById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validasi ID harus angka
    if (isNaN(parseInt(id, 10))) {
      return errorResponse(res, 400, 'Parameter "id" harus berupa angka');
    }

    const museum = await museumService.getMuseumById(id);

    if (!museum) {
      return errorResponse(res, 404, `Museum dengan ID ${id} tidak ditemukan`);
    }

    return successResponse(res, 'Detail museum berhasil diambil', museum);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/museums/nearby
 * Cari museum terdekat berdasarkan lokasi user
 */
const getNearbyMuseums = async (req, res, next) => {
  try {
    // Validasi parameter nearby
    const nearbyResult = validateNearbyParams(req.query);
    if (nearbyResult.error) {
      return errorResponse(res, 400, nearbyResult.error);
    }

    const { lat, lng, radius } = nearbyResult;
    const limit = parseInt(req.query.limit, 10) || 20;

    const museums = await museumService.getNearbyMuseums(lat, lng, radius, limit);

    return successResponse(
      res,
      `Ditemukan ${museums.length} museum dalam radius ${radius} km`,
      museums
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMuseums,
  getMuseumById,
  getNearbyMuseums,
};
