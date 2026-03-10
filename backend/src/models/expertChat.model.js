import mongoose from 'mongoose';

const expertChatSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        agronomistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        messages: [
            {
                senderId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                text: {
                    type: String,
                    required: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        lastMessageAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Ensure a unique chat per farmer-agronomist pair
expertChatSchema.index({ farmerId: 1, agronomistId: 1 }, { unique: true });

const ExpertChat = mongoose.model('ExpertChat', expertChatSchema);
export default ExpertChat;
