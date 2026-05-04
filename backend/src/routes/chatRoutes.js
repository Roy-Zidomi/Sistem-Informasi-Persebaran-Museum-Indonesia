const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat - Tanya chatbot museum
router.post('/', chatController.askChatbot);

module.exports = router;
