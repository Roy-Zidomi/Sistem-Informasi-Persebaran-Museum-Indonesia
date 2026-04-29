const chatService = require('../services/chatService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const MAX_MESSAGE_LENGTH = 1000;

const askChatbot = async (req, res, next) => {
  try {
    const message = String(req.body?.message || '').trim();
    const museumId = req.body?.museumId ? Number(req.body.museumId) : null;
    const pagePath = String(req.body?.pagePath || '/').slice(0, 120);

    if (!message) {
      return errorResponse(res, 400, 'Pesan tidak boleh kosong');
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return errorResponse(res, 400, `Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter`);
    }

    if (museumId && Number.isNaN(museumId)) {
      return errorResponse(res, 400, 'museumId harus berupa angka');
    }

    const answer = await chatService.askGemini({ message, museumId, pagePath });

    return successResponse(res, 'Jawaban chatbot berhasil dibuat', { answer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askChatbot,
};
