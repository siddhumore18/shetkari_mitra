import React, { useState, useEffect } from 'react';
import { 
    MessageCircle, 
    Search, 
    Loader2, 
    ChevronRight, 
    Filter,
    Users,
    Tractor,
    ShoppingBag,
    Send
} from 'lucide-react';
import { expertChatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import ExpertChatRoom from '../components/ExpertChatRoom';

const Messages = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { isDark } = useTheme();
    
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'expert', 'equipment', 'retailer'
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [selectedChatCategory, setSelectedChatCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filters = [
        { id: 'all', label: t('All Messages'), icon: MessageCircle },
        { id: 'expert', label: t('Agronomists'), icon: Users },
        { id: 'equipment', label: t('Equipment'), icon: Tractor },
        { id: 'retailer', label: t('Retailers'), icon: ShoppingBag },
    ];

    useEffect(() => {
        fetchChats();
    }, [activeFilter]);

    const fetchChats = async () => {
        try {
            setLoading(true);
            const category = activeFilter === 'all' ? undefined : activeFilter;
            const res = await expertChatAPI.getMyChats(category);
            setChats(res.data.data);
        } catch (err) {
            console.error('Failed to fetch chats:', err);
        } finally {
            setLoading(false);
        }
    };

    const getUserIdStr = (obj) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return (obj._id || obj.id || obj).toString();
    };

    const getOtherUser = (chat) => {
        if (!chat || !user) return null;
        const currentUserId = getUserIdStr(user);
        const farmerId = getUserIdStr(chat.farmerId);
        // If current user is the farmer, return agronomist, else return farmer
        return farmerId === currentUserId ? chat.agronomistId : chat.farmerId;
    };

    const filteredChats = chats.filter(chat => {
        const otherUser = getOtherUser(chat);
        return otherUser?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'expert': return <Users size={14} />;
            case 'equipment': return <Tractor size={14} />;
            case 'retailer': return <ShoppingBag size={14} />;
            default: return <MessageCircle size={14} />;
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'expert': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'equipment': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            case 'retailer': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400';
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('Messages')}</h1>
                    <p className={isDark ? 'text-zinc-400' : 'text-slate-500'}>{t('Manage all your conversations in one place')}</p>
                </div>
                
                <div className="relative group max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder={t('Search conversations...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'} focus:ring-2 focus:ring-emerald-500 transition-all outline-none shadow-sm`}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                {filters.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                            activeFilter === filter.id
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105'
                            : isDark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                        }`}
                    >
                        <filter.icon size={18} />
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Chat List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-20">
                    <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
                    <p className={isDark ? 'text-zinc-400' : 'text-slate-500'}>{t('Loading your messages...')}</p>
                </div>
            ) : filteredChats.length === 0 ? (
                <div className={`p-20 text-center rounded-[32px] border-2 border-dashed ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
                    <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageCircle size={40} className="text-slate-300 dark:text-zinc-600" />
                    </div>
                    <h3 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('No conversations match your search')}</h3>
                    <p className={`max-w-md mx-auto ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {searchQuery ? t('Try a different search term or check another category.') : t('Your message history will appear here once you start a conversation.')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(() => {
                        // Grouping logic for "All" view to avoid duplicate profiles
                        if (activeFilter === 'all') {
                            const grouped = new Map();
                            filteredChats.forEach(chat => {
                                const otherUser = getOtherUser(chat);
                                if (!otherUser) return;
                                
                                const otherId = getUserIdStr(otherUser);
                                if (!otherId) return;
                                
                                if (!grouped.has(otherId)) {
                                    grouped.set(otherId, {
                                        ...chat,
                                        otherUser,
                                        categories: [chat.category]
                                    });
                                } else {
                                    const existing = grouped.get(otherId);
                                    if (!existing.categories.includes(chat.category)) {
                                        existing.categories.push(chat.category);
                                    }
                                    if (new Date(chat.lastMessageAt) > new Date(existing.lastMessageAt)) {
                                        const cats = existing.categories;
                                        Object.assign(existing, chat);
                                        existing.categories = cats;
                                        existing.otherUser = otherUser;
                                    }
                                }
                            });
                            return Array.from(grouped.values());
                        }
                        return filteredChats.map(c => ({
                            ...c,
                            otherUser: getOtherUser(c),
                            categories: [c.category]
                        }));
                    })().map(chat => {
                        const { otherUser } = chat;
                        if (!otherUser) return null;
                        
                        return (
                            <div 
                                key={chat._id}
                                onClick={() => {
                                    setSelectedChatUser(getUserIdStr(otherUser));
                                    setSelectedChatCategory(chat.category);
                                }}
                                className={`group relative p-6 rounded-[28px] border transition-all cursor-pointer ${
                                    isDark 
                                    ? 'bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/80 shadow-xl shadow-black/20' 
                                    : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 shadow-md'
                                }`}
                            >
                                <div className="flex gap-4 items-start">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-emerald-500/10">
                                            {otherUser.fullName?.charAt(0)}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border-4 ${isDark ? 'border-zinc-900' : 'border-white'} ${getCategoryColor(chat.category)} shadow-sm`}>
                                            {getCategoryIcon(chat.category)}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className={`font-black truncate text-lg group-hover:text-emerald-500 transition-colors ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                                                {otherUser.fullName}
                                            </h3>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                                                {new Date(chat.lastMessageAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'} truncate opacity-80 mb-3`}>
                                            {chat.messages?.[chat.messages.length - 1]?.text || t('Click to open chat')}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1 flex-wrap">
                                                {chat.categories.map(cat => (
                                                    <span key={cat} className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest ${getCategoryColor(cat)}`}>
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center text-emerald-500 font-bold text-[10px] group-hover:translate-x-1 transition-transform">
                                                {t('Join Chat')} <ChevronRight size={14} className="ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Chat Modal */}
            {selectedChatUser && (
                <ExpertChatRoom 
                    otherUserId={selectedChatUser} 
                    category={selectedChatCategory}
                    onClose={() => {
                        setSelectedChatUser(null);
                        setSelectedChatCategory(null);
                        fetchChats();
                    }} 
                />
            )}
        </div>
    );
};

export default Messages;
