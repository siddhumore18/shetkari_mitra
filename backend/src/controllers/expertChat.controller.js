import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import ExpertChat from '../models/expertChat.model.js';
import User from '../models/user.model.js';

/**
 * @desc    Get or Create a chat session (Bidirectional)
 * @route   POST /api/v1/expert-chat/init
 * @access  Private
 */
export const initChat = asyncHandler(async (req, res) => {
    const { otherUserId, category = 'expert' } = req.body;
    const currentUserId = req.user.id;

    if (!otherUserId) {
        return res.status(400).json({ success: false, message: "Target User ID is required." });
    }

    // Validate both IDs are valid ObjectIds before querying
    if (!mongoose.Types.ObjectId.isValid(otherUserId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID format." });
    }

    // Check if both users exist
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
        return res.status(404).json({ success: false, message: "Recipient user not found." });
    }

    // Simplified role check: Ensure both users have valid roles
    const allowedRoles = ['farmer', 'agronomist', 'retailer'];
    if (!allowedRoles.includes(req.user.role) || !allowedRoles.includes(otherUser.role)) {
        return res.status(403).json({ success: false, message: "Role not authorized for expert/business chat." });
    }

    // ID Normalization: sort as strings so A-B and B-A always produce the same pair
    // Cast to ObjectId so Mongoose's compound index query matches correctly
    const idStrings = [currentUserId.toString(), otherUserId.toString()].sort();
    const farmerId = new mongoose.Types.ObjectId(idStrings[0]);
    const agronomistId = new mongoose.Types.ObjectId(idStrings[1]);

    try {
        // Atomic upsert — avoids E11000 duplicate key errors from the unique compound index.
        // findOneAndUpdate with ObjectId fields ensures the query matches the stored documents.
        let chat = await ExpertChat.findOneAndUpdate(
            { farmerId, agronomistId, category },
            { $setOnInsert: { farmerId, agronomistId, category, messages: [] } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
            .populate('farmerId', 'fullName profilePhoto')
            .populate('agronomistId', 'fullName profilePhoto');

        res.status(200).json({ success: true, data: chat });
    } catch (err) {
        console.error(`[initChat ERROR] category: ${category}, pair: ${farmerId}-${agronomistId}`);
        console.error(`  Error name: ${err.name}`);
        console.error(`  Error code: ${err.code}`);
        console.error(`  Error message: ${err.message}`);
        if (err.keyValue) console.error(`  Key value:`, JSON.stringify(err.keyValue));
        res.status(500).json({ success: false, message: `Chat Init Failed: ${err.name} - ${err.message}` });
    }
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
    const { category } = req.query;

    console.log(`[getMyChats] User: ${userId}, Role: ${role}, Category: ${category}`);
    if (!['farmer', 'agronomist', 'retailer'].includes(role)) {
        console.warn(`[getMyChats] Forbidden role: ${role}`);
        return res.status(403).json({ success: false, message: "Role not authorized for expert/business chat." });
    }

    // For robustness, especially with Retailer-Retailer chats, check both slots
    let query = {
        $or: [
            { farmerId: userId },
            { agronomistId: userId }
        ]
    };

    if (category) {
        query.category = category;
    }

    const chats = await ExpertChat.find(query)
        .populate('farmerId', 'fullName profilePhoto mobileNumber')
        .populate('agronomistId', 'fullName profilePhoto mobileNumber')
        .sort({ lastMessageAt: -1 });

    console.log(`[getMyChats] Found ${chats.length} chats`);
    res.status(200).json({ success: true, data: chats });
});
