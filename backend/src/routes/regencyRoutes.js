const express = require('express');
const router = express.Router();
const regencyController = require('../controllers/regencyController');

// GET /api/regencies - Semua kabupaten (opsional filter provinsi_id)
router.get('/', regencyController.getRegencies);

module.exports = router;
