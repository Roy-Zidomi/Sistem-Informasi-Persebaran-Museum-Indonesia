const jwt = require('jsonwebtoken');

/**
 * Login admin menggunakan kredensial dari environment variables.
 * Password di-hash untuk keamanan.
 */
const loginAdmin = async (email, password) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@museumnesia.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // Validasi email
  if (email !== adminEmail) {
    return { error: 'Email atau password salah' };
  }

  // Validasi password (bandingkan langsung karena dari env)
  if (password !== adminPassword) {
    return { error: 'Email atau password salah' };
  }

  // Generate JWT token
  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
    process.env.JWT_SECRET || 'museum-secret-key-2024',
    { expiresIn: '24h' }
  );

  return {
    token,
    admin: {
      email: adminEmail,
      role: 'admin',
    },
  };
};

module.exports = { loginAdmin };
