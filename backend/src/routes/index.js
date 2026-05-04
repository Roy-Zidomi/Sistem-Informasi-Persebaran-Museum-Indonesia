const express = require('express');
const router = express.Router();

// Import semua route modules
const museumRoutes = require('./museumRoutes');
const provinceRoutes = require('./provinceRoutes');
const regencyRoutes = require('./regencyRoutes');
const categoryRoutes = require('./categoryRoutes');
const adminRoutes = require('./adminRoutes');
const chatRoutes = require('./chatRoutes');

// Mount routes ke prefix masing-masing
router.use('/museums', museumRoutes);
router.use('/provinces', provinceRoutes);
router.use('/regencies', regencyRoutes);
router.use('/categories', categoryRoutes);
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);

module.exports = router;
