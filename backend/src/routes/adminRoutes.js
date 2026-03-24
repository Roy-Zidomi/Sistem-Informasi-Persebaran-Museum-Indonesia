const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');

// Auth (tanpa token)
router.post('/login', authController.login);

// Dashboard (perlu token)
router.get('/dashboard/stats', verifyToken, adminController.getDashboardStats);
router.get('/dashboard/museums-by-province', verifyToken, adminController.getMuseumsByProvince);
router.get('/dashboard/museums-by-category', verifyToken, adminController.getMuseumsByCategory);
router.get('/dashboard/top-regencies', verifyToken, adminController.getTopRegencies);

// Museum CRUD (perlu token)
router.get('/museums', verifyToken, adminController.getMuseums);
router.post('/museums', verifyToken, adminController.createMuseum);
router.put('/museums/:id', verifyToken, adminController.updateMuseum);
router.delete('/museums/:id', verifyToken, adminController.deleteMuseum);

module.exports = router;
