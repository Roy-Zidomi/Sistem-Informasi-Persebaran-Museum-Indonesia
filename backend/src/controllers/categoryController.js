const categoryService = require('../services/categoryService');
const { successResponse } = require('../utils/responseFormatter');

/**
 * GET /api/categories
 * Ambil semua data kategori museum untuk dropdown/filter frontend
 */
const getCategories = async (_req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();

    return successResponse(res, 'Data kategori berhasil diambil', categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
};
