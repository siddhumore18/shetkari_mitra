import asyncHandler from 'express-async-handler';
import ExpertChat from '../models/expertChat.model.js';
import User from '../models/user.model.js';

/**
 * @desc    Get or Create a chat session (Bidirectional)
 * @route   POST /api/v1/expert-chat/init
 * @access  Private
 */
export const initChat = asyncHandler(async (req, res) => {
    const { otherUserId } = req.body;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    if (!otherUserId) {
        return res.status(400).json({ success: false, message: "Target User ID is required." });
    }

    // Determine who is who
    let farmerId, agronomistId;

    if (currentUserRole === 'farmer') {
        farmerId = currentUserId;
        agronomistId = otherUserId;
    } else if (currentUserRole === 'agronomist') {
        agronomistId = currentUserId;
        farmerId = otherUserId;
    } else {
        return res.status(403).json({ success: false, message: "Only farmers or agronomists can initiate expert chats." });
    }

    // Check if both users exist
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
        return res.status(404).json({ success: false, message: "Recipient user not found." });
    }

    // Ensure the other user has the opposite role
    const expectedRole = currentUserRole === 'farmer' ? 'agronomist' : 'farmer';
    if (otherUser.role !== expectedRole) {
        return res.status(400).json({ success: false, message: `Target user must be a ${expectedRole}.` });
    }

    let chat = await ExpertChat.findOne({ farmerId, agronomistId })
        .populate('farmerId', 'fullName profilePhoto')
        .populate('agronomistId', 'fullName profilePhoto');

    if (!chat) {
        chat = await ExpertChat.create({
            farmerId,
            agronomistId,
            messages: []
        });
        await chat.populate('farmerId', 'fullName profilePhoto');
        await chat.populate('agronomistId', 'fullName profilePhoto');
    }

    res.status(200).json({ success: true, data: chat });
});

/**
 * @desc    Send a message in an expert chat
 * @route   POST /api/v1/expert-chat/:chatId/message
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const { chatId } = req.params;
    const senderId = req.user.id;

    if (!text) {
        return res.status(400).json({ success: false, message: "Message text is required." });
    }

    const chat = await ExpertChat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ success: false, message: "Chat session not found." });
    }

    // Verify participant
    if (chat.farmerId.toString() !== senderId && chat.agronomistId.toString() !== senderId) {
        return res.status(403).json({ success: false, message: "You are not a participant in this chat." });
    }

    const newMessage = {
        senderId,
        text,
        createdAt: new Date()
    };

    chat.messages.push(newMessage);
    chat.lastMessageAt = new Date();
    await chat.save();

    // Socket.io real-time emission
    const io = req.app.get('socketio');
    if (io) {
        io.to(chatId).emit('receive_expert_message', newMessage);
        // Also notify the specific user room for incoming message notifications
        const recipientId = chat.farmerId.toString() === senderId ? chat.agronomistId.toString() : chat.farmerId.toString();
        io.to(recipientId).emit('expert_chat_notification', {
            chatId,
            senderName: req.user.fullName,
            text: text.substring(0, 50)
        });
    }

    res.status(200).json({ success: true, data: newMessage });
});

/**
 * @desc    Get chat history
 * @route   GET /api/v1/expert-chat/:chatId
 * @access  Private
 */
export const getChatHistory = asyncHandler(async (req, res) => {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await ExpertChat.findById(chatId)
        .populate('farmerId', 'fullName profilePhoto')
        .populate('agronomistId', 'fullName profilePhoto');

    if (!chat) {
        return res.status(404).json({ success: false, message: "Chat session not found." });
    }

    // Verify participant
    if (chat.farmerId._id.toString() !== userId && chat.agronomistId._id.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Unauthorized access to this chat." });
    }

    res.status(200).json({ success: true, data: chat });
});

/**
 * @desc    Get all active chats for the current user
 * @route   GET /api/v1/expert-chat/my-chats
 * @access  Private
 */
export const getMyChats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    let query = {};
    if (role === 'farmer') {
        query = { farmerId: userId };
    } else if (role === 'agronomist') {
        query = { agronomistId: userId };
    } else {
        return res.status(403).json({ success: false, message: "Role not authorized for expert chats." });
    }

    const chats = await ExpertChat.find(query)
        .populate('farmerId', 'fullName profilePhoto mobileNumber')
        .populate('agronomistId', 'fullName profilePhoto mobileNumber')
        .sort({ lastMessageAt: -1 });

    res.status(200).json({ success: true, data: chats });
});
