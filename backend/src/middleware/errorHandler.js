/**
 * Middleware untuk menangani route yang tidak ditemukan (404)
 */
const notFoundHandler = (req, res, _next) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
    data: null,
  });
};

/**
 * Middleware global error handler
 * Menangkap semua error yang di-throw atau di-next(err) dari controller/service
 */
const errorHandler = (err, _req, res, _next) => {
  console.error('❌ Error:', err.message);

  // Jika statusCode sudah di-set di error object
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan pada server';

  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
