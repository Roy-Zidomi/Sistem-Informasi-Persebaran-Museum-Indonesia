const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * POST /api/admin/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email dan password wajib diisi');
    }

    const result = await authService.loginAdmin(email, password);

    if (result.error) {
      return errorResponse(res, 401, result.error);
    }

    return successResponse(res, 'Login berhasil', result);
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
