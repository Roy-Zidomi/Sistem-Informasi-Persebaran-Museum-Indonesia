const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Middleware untuk verifikasi JWT token dari header Authorization
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'Akses ditolak. Token tidak ditemukan.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token sudah kadaluarsa. Silakan login kembali.');
    }
    return errorResponse(res, 401, 'Token tidak valid.');
  }
};

module.exports = { verifyToken };
