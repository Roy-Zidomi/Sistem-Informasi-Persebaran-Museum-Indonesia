const express = require('express');
const router = express.Router();
const museumController = require('../controllers/museumController');

// GET /api/museums/nearby - Museum terdekat (harus sebelum /:id)
router.get('/nearby', museumController.getNearbyMuseums);

// GET /api/museums - Semua museum (dengan filter, search, pagination)
router.get('/', museumController.getMuseums);

// GET /api/museums/:id - Detail museum
router.get('/:id', museumController.getMuseumById);

module.exports = router;
