import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    X,
    MessageCircle,
    User,
    Loader2,
    Clock,
    Phone,
    ExternalLink
} from 'lucide-react';
import { expertChatAPI } from '../services/api';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const ExpertChatRoom = ({ otherUserId, onClose }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { isDark } = useTheme();

    const [chat, setChat] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Initialize Chat
    useEffect(() => {
        const initChat = async () => {
            try {
                setLoading(true);
                const res = await expertChatAPI.initChat(otherUserId);
                const chatData = res.data.data;
                setChat(chatData);

                // Socket: Connect and Join
                if (!socket.connected) socket.connect();
                socket.emit('join_chat', chatData._id);
            } catch (err) {
                console.error('Chat Init Error:', err);
                setError(t('Failed to start chat session.'));
            } finally {
                setLoading(false);
            }
        };

        if (otherUserId) initChat();
    }, [otherUserId, t]);

    // Socket: Listen for new messages
    useEffect(() => {
        if (!chat?._id) return;

        const handleNewMessage = (newMessage) => {
            setChat(prev => {
                // Prevent duplicate messages if already added optimistically
                const exists = prev.messages.some(m => m.createdAt === newMessage.createdAt && m.text === newMessage.text);
                if (exists) return prev;
                return {
                    ...prev,
                    messages: [...prev.messages, newMessage]
                };
            });
        };

        socket.on('receive_expert_message', handleNewMessage);

        return () => {
            socket.off('receive_expert_message', handleNewMessage);
        };
    }, [chat?._id]);

    // Polling fallback (every 10 seconds now, as socket is primary)
    useEffect(() => {
        let interval;
        if (chat?._id) {
            interval = setInterval(async () => {
                try {
                    const res = await expertChatAPI.getChatHistory(chat._id);
                    setChat(res.data.data);
                } catch (err) {
                    console.error('Polling Error:', err);
                }
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [chat?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [chat?.messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !chat?._id || sending) return;

        try {
            setSending(true);
            const res = await expertChatAPI.sendMessage(chat._id, message.trim());
            setChat(prev => ({
                ...prev,
                messages: [...prev.messages, res.data.data]
            }));
            setMessage('');
        } catch (err) {
            console.error('Send Error:', err);
            alert(t('Failed to send message.'));
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className={`p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 ${isDark ? 'bg-[#232d36] text-white' : 'bg-white text-gray-900'}`}>
                    <Loader2 className="animate-spin text-[#25d366]" size={40} />
                    <p className="font-bold">{t('Connecting...')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className={`p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 ${isDark ? 'bg-[#232d36] text-white' : 'bg-white text-gray-900'}`}>
                    <p className="text-red-500 font-bold">{error}</p>
                    <button onClick={onClose} className="px-6 py-2 bg-[#075e54] text-white rounded-xl font-bold transition-all hover:bg-[#128c7e]">{t('Close')}</button>
                </div>
            </div>
        );
    }

    const otherUser = user.role === 'farmer' ? chat.agronomistId : chat.farmerId;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-xl h-full sm:h-[85vh] flex flex-col sm:rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${isDark ? 'bg-[#0b141a]' : 'bg-[#e5ddd5]'}`}>

                {/* WhatsApp Header */}
                <div className="px-4 py-3 bg-[#075e54] dark:bg-[#202c33] text-white flex items-center justify-between shadow-lg z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="sm:hidden p-1">
                            <X size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                            {otherUser.profilePhoto?.url ? (
                                <img src={otherUser.profilePhoto.url} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <User size={20} className="text-white/60" />
                            )}
                        </div>
                        <div className="cursor-pointer">
                            <h3 className="font-extrabold text-lg leading-tight truncate max-w-[150px]">{otherUser.fullName}</h3>
                            <p className="text-[11px] text-[#25d366] font-medium leading-tight">
                                {user.role === 'farmer' ? t('Expert Agronomist') : t('Farmer Instance')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone size={20} className="text-white/80 cursor-pointer hover:text-white" />
                        <button onClick={onClose} className="hidden sm:block p-1.5 hover:bg-white/10 rounded-full transition-all">
                            <X size={22} />
                        </button>
                    </div>
                </div>

                {/* Chat Area with WhatsApp Background Pattern */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative" style={{
                    backgroundImage: isDark ? 'none' : 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                    backgroundSize: '400px',
                    backgroundRepeat: 'repeat'
                }}>
                    {/* Dark mode background overlay */}
                    {isDark && <div className="absolute inset-0 bg-[#0b141a] opacity-90 z-0" />}

                    <div className="relative z-10 space-y-2">
                        {chat.messages.length === 0 ? (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-60">
                                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-[12px] max-w-[280px] shadow-sm flex items-center gap-2">
                                    <Clock size={14} />
                                    {t('Messages are end-to-end encrypted. No one outside of this chat can read them.')}
                                </div>
                            </div>
                        ) : (
                            chat.messages.map((msg, i) => {
                                const isMe = msg.senderId === (user?._id || user?.id);
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`relative max-w-[85%] px-3 py-1.5 shadow-sm ${isMe
                                            ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-lg rounded-tr-none'
                                            : isDark ? 'bg-[#202c33] text-[#e9edef] rounded-lg rounded-tl-none' : 'bg-white text-[#111b21] rounded-lg rounded-tl-none'
                                            }`}>
                                            {/* Bubble Tail */}
                                            <div className={`absolute top-0 w-3 h-3 ${isMe
                                                ? 'right-[-8px] border-l-[10px] border-l-[#dcf8c6] dark:border-l-[#005c4b] border-b-[8px] border-b-transparent'
                                                : 'left-[-8px] border-r-[10px] border-r-white dark:border-r-[#202c33] border-b-[8px] border-b-transparent'}`}
                                            />

                                            <p className="text-[14px] leading-relaxed break-words">{msg.text}</p>
                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                <span className="text-[10px] opacity-60 font-medium">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && <span className="text-[#34b7f1] text-[10px]">✓✓</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* WhatsApp Footer */}
                <div className={`p-2 space-x-2 flex items-center ${isDark ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
                    <form onSubmit={handleSendMessage} className="flex-1 flex gap-2 items-center">
                        <div className={`flex-1 flex items-center px-4 py-1.5 rounded-full ${isDark ? 'bg-[#2a3942]' : 'bg-white'} shadow-sm border border-transparent focus-within:border-emerald-500/30 transition-all`}>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t('Type a message')}
                                className="flex-1 bg-transparent outline-none text-[15px] py-1 text-inherit"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!message.trim() || sending}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md ${message.trim() ? 'bg-[#00a884] text-white hover:bg-[#06cf9c] scale-100' : 'bg-gray-400 text-white scale-90 opacity-50'}`}
                        >
                            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="ml-0.5" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ExpertChatRoom;
