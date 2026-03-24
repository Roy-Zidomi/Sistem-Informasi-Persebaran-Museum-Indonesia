/**
 * Format response sukses yang konsisten
 * @param {import('express').Response} res
 * @param {string} message - Pesan deskripsi
 * @param {any} data - Data yang dikembalikan
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {object|null} pagination - Info pagination (opsional)
 */
const successResponse = (res, message, data, statusCode = 200, pagination = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Format response error yang konsisten
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Pesan error
 */
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
