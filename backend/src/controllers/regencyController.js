const regencyService = require('../services/regencyService');
const { successResponse } = require('../utils/responseFormatter');

/**
 * GET /api/regencies
 * GET /api/regencies?provinsi_id=...
 * Ambil semua kabupaten, opsional filter berdasarkan provinsi_id
 */
const getRegencies = async (req, res, next) => {
  try {
    const { provinsi_id } = req.query;
    const regencies = await regencyService.getAllRegencies(provinsi_id || null);

    return successResponse(res, 'Data kabupaten berhasil diambil', regencies);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRegencies,
};
