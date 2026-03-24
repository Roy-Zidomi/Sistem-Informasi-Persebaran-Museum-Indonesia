const provinceService = require('../services/provinceService');
const { successResponse } = require('../utils/responseFormatter');

/**
 * GET /api/provinces
 * Ambil semua data provinsi untuk dropdown/filter frontend
 */
const getProvinces = async (_req, res, next) => {
  try {
    const provinces = await provinceService.getAllProvinces();

    return successResponse(res, 'Data provinsi berhasil diambil', provinces);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProvinces,
};
