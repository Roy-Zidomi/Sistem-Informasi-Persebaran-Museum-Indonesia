/**
 * Validasi dan parsing parameter pagination
 * @param {object} query - Express query params
 * @returns {{ page: number, limit: number, offset: number } | { error: string }}
 */
const validatePagination = (query) => {
  let { page = 1, limit = 10 } = query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) {
    return { error: 'Parameter "page" harus berupa angka positif' };
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return { error: 'Parameter "limit" harus berupa angka antara 1 - 100' };
  }

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Validasi parameter lokasi terdekat (nearby)
 * @param {object} query - Express query params
 * @returns {{ lat: number, lng: number, radius: number } | { error: string }}
 */
const validateNearbyParams = (query) => {
  const { lat, lng, radius = 50 } = query;

  if (lat === undefined || lng === undefined) {
    return { error: 'Parameter "lat" dan "lng" wajib diisi' };
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const parsedRadius = parseFloat(radius);

  if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
    return { error: 'Parameter "lat" harus berupa angka antara -90 dan 90' };
  }

  if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
    return { error: 'Parameter "lng" harus berupa angka antara -180 dan 180' };
  }

  if (isNaN(parsedRadius) || parsedRadius <= 0) {
    return { error: 'Parameter "radius" harus berupa angka positif (dalam km)' };
  }

  return {
    lat: parsedLat,
    lng: parsedLng,
    radius: parsedRadius,
  };
};

module.exports = {
  validatePagination,
  validateNearbyParams,
};
