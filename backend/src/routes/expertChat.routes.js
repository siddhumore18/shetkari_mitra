import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { initChat, sendMessage, getChatHistory, getMyChats } from '../controllers/expertChat.controller.js';

const router = express.Router();

router.use(protect);

router.post('/init', initChat);
router.get('/my-chats', getMyChats);
router.get('/:chatId', getChatHistory);
router.post('/:chatId/message', sendMessage);

export default router;
