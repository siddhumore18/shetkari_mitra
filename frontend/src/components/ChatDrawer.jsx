import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Send,
    MessageSquare,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight
} from 'lucide-react';
import { io } from 'socket.io-client';
import axios from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatDrawer = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [collaborations, setCollaborations] = useState({ received: [], sent: [], chats: [] });
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const socketRef = useRef();
    const messagesEndRef = useRef(null);

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        if (isOpen && user) {
            fetchData();
            socketRef.current = io(socketUrl.replace('/api/v1', ''), {
                withCredentials: true
            });

            socketRef.current.on('receive_message', (msg) => {
                setMessages((prev) => [...prev, msg]);
            });

            socketRef.current.on(`notification_${user.id}`, (notif) => {
                console.log('🔔 Notification received:', notif);
                fetchData(); // Refresh requests/chats
            });

            return () => {
                socketRef.current.disconnect();
            };
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (activeChat) {
            setMessages(activeChat.messages || []);
            socketRef.current.emit('join_chat', activeChat._id);
        }
    }, [activeChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/supply-chain/collaboration/my-stats');
            setCollaborations(data.data);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId, status) => {
        try {
            const { data } = await axios.patch('/supply-chain/collaboration/status', { requestId, status });
            await fetchData();
            if (status === 'Accepted' && data.data?._id) {
                // Find and open new chat automatically
                const newChat = data.data; // Server usually returns the created chat on Accept
                setActiveChat(newChat);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Error updating status");
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const messageData = {
            chatId: activeChat._id,
            senderId: user.id,
            text: newMessage
        };

        socketRef.current.emit('send_message', messageData);
        setNewMessage('');
    };

    const variants = {
        open: { x: 0 },
        closed: { x: '100%' }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
                    />
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={variants}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--bg-page)] shadow-2xl z-[90] border-l border-[var(--border-card)] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--border-card)] flex items-center justify-between bg-emerald-600 text-white">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={20} />
                                <span className="font-bold">Collaborations & Chat</span>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {activeChat ? (
                                /* Chat Room */
                                <div className="flex flex-col h-full">
                                    <div className="p-3 border-b border-[var(--border-card)] bg-[var(--bg-card)] flex items-center gap-3">
                                        <button onClick={() => setActiveChat(null)} className="text-emerald-500 text-xs font-bold px-2 py-1 hover:bg-emerald-500/10 rounded">
                                            ← Back
                                        </button>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-[var(--text-primary)]">
                                                {activeChat.participants?.find(p => p._id !== user.id)?.fullName || 'Farmer Partner'}
                                            </p>
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase truncate">
                                                {activeChat.requestId?.listingId?.cropType || 'Crop'} Collaboration
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                        {messages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.isSystem ? 'justify-center' : msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                                {msg.isSystem ? (
                                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase border border-emerald-500/20">
                                                        {msg.text}
                                                    </span>
                                                ) : (
                                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === user.id
                                                        ? 'bg-emerald-600 text-white rounded-br-none shadow-lg'
                                                        : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] rounded-bl-none shadow'
                                                        }`}>
                                                        {msg.text}
                                                        <p className={`text-[9px] mt-1 opacity-60 ${msg.senderId === user.id ? 'text-right' : 'text-left'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-card)] flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            className="kk-input flex-1"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <button type="submit" className="kk-btn-primary p-3 rounded-xl flex items-center justify-center">
                                            <Send size={18} />
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                /* Tabs: Requests & Chats */
                                <div className="p-4 space-y-8">
                                    {/* Received Requests */}
                                    {collaborations.received.length > 0 && (
                                        <section>
                                            <h4 className="text-xs font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <AlertCircle size={14} className="text-amber-500" />
                                                Requests Received
                                            </h4>
                                            <div className="space-y-3">
                                                {(() => {
                                                    // Deduplicate by Listing ID + Sender ID to avoid repeated cards for same intent
                                                    const unique = [];
                                                    const map = new Map();
                                                    collaborations.received.filter(r => r.status === 'Pending').forEach(item => {
                                                        const key = `${item.senderId?._id}-${item.listingId?._id || 'none'}`;
                                                        if (!map.has(key)) {
                                                            map.set(key, true);
                                                            unique.push(item);
                                                        }
                                                    });
                                                    return unique;
                                                })().map(req => (
                                                    <div key={req._id} className="kk-card p-4 border-l-4 border-l-amber-500">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs text-white font-bold">
                                                                {req.senderId.fullName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-[var(--text-primary)]">{req.senderId.fullName}</p>
                                                                <p className="text-[10px] text-secondary">Wants to collaborate on: {req.listingId?.cropType}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs italic text-[var(--text-secondary)] mb-4 px-2 py-1.5 bg-black/10 rounded">
                                                            "{req.message}"
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleUpdateStatus(req._id, 'Accepted')}
                                                                className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold uppercase transition-all"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                                                                className="flex-1 py-1.5 rounded-lg border border-red-500/30 text-red-500 text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all"
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Active Chats */}
                                    <section>
                                        <h4 className="text-xs font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                            Active Collaborations
                                        </h4>
                                        {loading ? (
                                            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-emerald-500" /></div>
                                        ) : collaborations.chats && collaborations.chats.length > 0 ? (
                                            <div className="space-y-3">
                                                {/* Filter out any potential duplicate chats by ID for clean UI */}
                                                {Array.from(new Map(collaborations.chats.map(chat => [chat._id, chat])).values())
                                                    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
                                                    .map(chat => (
                                                        <button
                                                            key={chat._id}
                                                            onClick={() => setActiveChat(chat)}
                                                            className="w-full text-left p-4 rounded-[1.5rem] bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-emerald-500 transition-all flex items-center gap-4 group shadow-sm hover:shadow-md"
                                                        >
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                                                                {chat.participants?.find(p => p._id !== user.id)?.fullName?.charAt(0) || 'F'}
                                                            </div>
                                                            <div className="flex-1 overflow-hidden">
                                                                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                                                                    {chat.participants?.find(p => p._id !== user.id)?.fullName || 'Farmer Partner'}
                                                                </p>
                                                                <p className="text-xs text-secondary truncate">
                                                                    {chat.messages[chat.messages.length - 1]?.text || 'No messages yet'}
                                                                </p>
                                                            </div>
                                                            <ChevronRight size={16} className="text-secondary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                                        </button>
                                                    ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 border-2 border-dashed border-[var(--border-card)] rounded-2xl">
                                                <MessageSquare size={32} className="mx-auto mb-3 text-secondary opacity-20" />
                                                <p className="text-xs text-secondary">No active collaborations yet.</p>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatDrawer;
