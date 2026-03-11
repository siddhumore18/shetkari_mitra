import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { equipmentAPI, expertChatAPI } from '../../services/api';
import {
    Tractor,
    MapPin,
    Phone,
    MessageCircle,
    Plus,
    Search,
    CheckCircle2,
    XCircle,
    PackageSearch,
    Loader2,
    Tag,
    ChevronRight
} from 'lucide-react';
import ExpertChatRoom from '../../components/ExpertChatRoom';

const EquipmentMarketplace = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { isDark } = useTheme();

    const [activeTab, setActiveTab] = useState('discover'); // 'discover', 'my-listings', 'post'
    const [nearbyEquipment, setNearbyEquipment] = useState([]);
    const [myListings, setMyListings] = useState([]);
    const [myChats, setMyChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filters
    const [filterType, setFilterType] = useState('');
    const [filterRadius, setFilterRadius] = useState(50);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'Tractor',
        price: '',
        priceUnit: 'per hour',
        condition: 'Good',
        description: ''
    });

    // Chat/Contact
    const [selectedChatUser, setSelectedChatUser] = useState(null);

    const EQUIPMENT_TYPES = ['Tractor', 'Harvester', 'Cultivator', 'Water Pump', 'Sprayer', 'Plow', 'Rotavator', 'Other'];
    const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Needs Repair'];
    const PRICE_UNITS = ['per hour', 'per day', 'per acre'];

    useEffect(() => {
        if (activeTab === 'discover') {
            fetchNearby();
        } else if (activeTab === 'my-listings') {
            fetchMyListings();
        } else if (activeTab === 'chats') {
            fetchMyChats();
        }
    }, [activeTab, filterType, filterRadius]);

    const fetchMyChats = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await expertChatAPI.getMyChats();
            setMyChats(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || t('Failed to load chats'));
        } finally {
            setLoading(false);
        }
    };

    const fetchNearby = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await equipmentAPI.getNearby(filterRadius, filterType);
            setNearbyEquipment(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || t('Failed to load nearby equipment'));
        } finally {
            setLoading(false);
        }
    };

    const fetchMyListings = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await equipmentAPI.getMyListings();
            setMyListings(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || t('Failed to load your listings'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            await equipmentAPI.create(formData);
            alert(t('Equipment listed successfully!'));
            setFormData({ name: '', type: 'Tractor', price: '', priceUnit: 'per hour', condition: 'Good', description: '' });
            setActiveTab('my-listings');
        } catch (err) {
            setError(err.response?.data?.message || t('Failed to list equipment'));
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailability = async (id, currentStatus) => {
        try {
            const res = await equipmentAPI.update(id, { isAvailable: !currentStatus });
            setMyListings(myListings.map(eq => eq.id === id ? res.data.data : eq));
            fetchMyListings(); // refresh
        } catch (err) {
            alert(t('Failed to update availability'));
        }
    };

    // Helper styles based on theme
    const pageBg = isDark ? 'bg-zinc-950' : 'bg-slate-50';
    const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';
    const textColor = isDark ? 'text-zinc-100' : 'text-slate-900';
    const subTextColor = isDark ? 'text-zinc-400' : 'text-slate-500';

    return (
        <div className={`min-h-screen ${pageBg} ${textColor} p-4 sm:p-6 lg:p-8 pt-20 transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className={`p-8 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none scale-150">
                        <Tractor size={160} />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">{t('Equipment Marketplace')}</h1>
                        <p className="text-orange-50 text-base sm:text-lg max-w-2xl font-medium">
                            {t('Rent agricultural machinery from nearby farmers or list your idle equipment to earn extra income.')}
                        </p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-transparent">
                    {[
                        { id: 'discover', label: t('Discover Nearby'), icon: Search },
                        { id: 'chats', label: t('Recent Inquiries'), icon: MessageCircle },
                        { id: 'my-listings', label: t('My Listings'), icon: PackageSearch },
                        { id: 'post', label: t('Post Equipment'), icon: Plus }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold transition-all ${activeTab === tab.id
                                ? 'bg-amber-500 text-white shadow-lg -translate-y-1'
                                : `${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-white hover:bg-slate-100 text-slate-600'} shadow-sm`
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
                        <XCircle size={20} className="shrink-0" />
                        <p className="font-semibold">{error}</p>
                    </div>
                )}

                {/* Content Area */}
                <div className="mt-4">

                    {/* CHATS TAB */}
                    {activeTab === 'chats' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {loading ? (
                                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
                            ) : myChats.length === 0 ? (
                                <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? 'border-zinc-700' : 'border-slate-300'}`}>
                                    <MessageCircle size={48} className={`mx-auto mb-4 opacity-20 ${textColor}`} />
                                    <h3 className="text-xl font-bold mb-2">{t('No messages yet')}</h3>
                                    <p className={subTextColor}>{t('Inquiries from other farmers will appear here.')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myChats.map(chat => {
                                        const currentUserId = user?._id || user?.id;
                                        const farmerIdStr = chat.farmerId?._id?.toString() || chat.farmerId?.toString();
                                        const other = farmerIdStr === currentUserId?.toString() ? chat.agronomistId : chat.farmerId;
                                        if (!other) return null;
                                        return (
                                            <div 
                                                key={chat._id} 
                                                onClick={() => setSelectedChatUser(other._id || other)}
                                                className={`p-5 rounded-2xl border ${cardBg} shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group`}
                                            >
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
                                                    {other.fullName?.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className="font-extrabold truncate group-hover:text-amber-500 transition-colors">{other.fullName}</h3>
                                                        <span className={`text-[10px] font-bold ${subTextColor}`}>
                                                            {new Date(chat.lastMessageAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm ${subTextColor} truncate`}>
                                                        {chat.messages?.[chat.messages.length - 1]?.text || t('Click to start chatting')}
                                                    </p>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DISCOVER TAB */}
                    {activeTab === 'discover' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Filters */}
                            <div className={`p-4 rounded-2xl ${cardBg} border shadow-sm flex flex-wrap gap-4 items-center`}>
                                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                    <Tag className={subTextColor} size={18} />
                                    <select
                                        value={filterType}
                                        onChange={e => setFilterType(e.target.value)}
                                        className={`w-full bg-transparent ${textColor} outline-none font-medium p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}
                                    >
                                        <option value="">{t('All Equipment Types')}</option>
                                        {EQUIPMENT_TYPES.map(type => <option key={type} value={type}>{t(type)}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                    <MapPin className={subTextColor} size={18} />
                                    <select
                                        value={filterRadius}
                                        onChange={e => setFilterRadius(Number(e.target.value))}
                                        className={`w-full bg-transparent ${textColor} outline-none font-medium p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}
                                    >
                                        <option value={10}>{t('Within 10 km')}</option>
                                        <option value={30}>{t('Within 30 km')}</option>
                                        <option value={50}>{t('Within 50 km')}</option>
                                        <option value={100}>{t('Within 100 km')}</option>
                                        <option value={200}>{t('Within 200 km')}</option>
                                        <option value={500}>{t('Within 500 km')}</option>
                                        <option value={1000}>{t('Within 1000 km')}</option>
                                        <option value={5000}>{t('Global (5000 km)')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Grid */}
                            {loading ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="animate-spin text-amber-500" size={40} />
                                </div>
                            ) : nearbyEquipment.length === 0 ? (
                                <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? 'border-zinc-700' : 'border-slate-300'}`}>
                                    <Tractor size={48} className={`mx-auto mb-4 opacity-20 ${textColor}`} />
                                    <h3 className="text-xl font-bold mb-2">{t('No equipment found nearby')}</h3>
                                    <p className={subTextColor}>{t('Try increasing the search radius or clearing the type filter.')}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {nearbyEquipment.map(item => (
                                        <div key={item.id} className={`rounded-2xl border ${cardBg} shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group`}>
                                            <div className="h-48 bg-slate-200 dark:bg-zinc-800 relative">
                                                {/* Placeholder for image - using emoji if none available currently */}
                                                <div className="absolute inset-0 flex items-center justify-center text-6xl">🚜</div>
                                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 px-3 py-1 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 backdrop-blur-sm shadow-sm">
                                                    {t(item.condition)}
                                                </div>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-extrabold text-lg line-clamp-1 group-hover:text-amber-500 transition-colors">{item.name}</h3>
                                                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 whitespace-nowrap ml-2">
                                                        {t(item.type)}
                                                    </span>
                                                </div>

                                                <p className={`text-sm mb-4 line-clamp-2 ${subTextColor}`}>{item.description}</p>

                                                <div className="mt-auto space-y-3">
                                                    <div className={`flex items-center gap-2 text-sm font-semibold`}>
                                                        <MapPin size={16} className="text-rose-500" />
                                                        <span>{item.location?.district || t('Unknown location')}</span>
                                                    </div>
                                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50 flex justify-between items-center">
                                                        <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">{t('Rental Rate')}</span>
                                                        <span className="font-black text-lg text-amber-600 dark:text-amber-500">₹{item.price} <span className="text-xs font-medium opacity-70">/ {t(item.priceUnit.replace('per ', ''))}</span></span>
                                                    </div>

                                                    {/* Owner details & Contact */}
                                                    {item.owner && item.owner._id !== (user?._id || user?.id) && (
                                                        <div className="pt-4 border-t border-dashed border-slate-200 dark:border-zinc-800">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                                                    {item.owner.fullName?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm leading-tight">{item.owner.fullName}</p>
                                                                    <p className={`text-xs ${subTextColor} font-medium`}>{t('Equipment Owner')}</p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button
                                                                    onClick={() => setSelectedChatUser(item.owner._id || item.owner.id)}
                                                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors"
                                                                >
                                                                    <MessageCircle size={16} /> {t('Chat')}
                                                                </button>
                                                                <a
                                                                    href={`tel:${item.owner.mobileNumber}`}
                                                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 transition-colors"
                                                                >
                                                                    <Phone size={16} /> {t('Call')}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* MY LISTINGS TAB */}
                    {activeTab === 'my-listings' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {loading ? (
                                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
                            ) : myListings.length === 0 ? (
                                <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? 'border-zinc-700' : 'border-slate-300'}`}>
                                    <h3 className="text-xl font-bold mb-2">{t('You have no listings yet')}</h3>
                                    <button
                                        onClick={() => setActiveTab('post')}
                                        className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
                                    >
                                        {t('Post Your First Equipment')}
                                    </button>
                                </div>
                            ) : (
                                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className={`${isDark ? 'bg-zinc-800/50' : 'bg-slate-50'} border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                                                    <th className="p-4 font-bold text-sm">{t('Equipment')}</th>
                                                    <th className="p-4 font-bold text-sm">{t('Rate')}</th>
                                                    <th className="p-4 font-bold text-sm">{t('Status')}</th>
                                                    <th className="p-4 font-bold text-sm text-right">{t('Action')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {myListings.map(item => (
                                                    <tr key={item.id} className={`border-b last:border-0 ${isDark ? 'border-zinc-800 hover:bg-zinc-800/30' : 'border-slate-200 hover:bg-slate-50'} transition-colors`}>
                                                        <td className="p-4">
                                                            <p className="font-bold">{item.name}</p>
                                                            <p className={`text-xs ${subTextColor}`}>{t(item.type)}</p>
                                                        </td>
                                                        <td className="p-4 font-semibold text-amber-600 dark:text-amber-500">
                                                            ₹{item.price} <span className="text-xs opacity-70">/ {t(item.priceUnit.replace('per ', ''))}</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${item.isAvailable ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                                                {item.isAvailable ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                                {item.isAvailable ? t('Available') : t('Hidden')}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <button
                                                                onClick={() => toggleAvailability(item.id, item.isAvailable)}
                                                                className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${item.isAvailable ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40'}`}
                                                            >
                                                                {item.isAvailable ? t('Mark Unavailable') : t('Mark Available')}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* POST NEW TAB */}
                    {activeTab === 'post' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                            <form onSubmit={handleCreateSubmit} className={`p-6 sm:p-8 rounded-2xl ${cardBg} border shadow-lg space-y-6`}>
                                <div>
                                    <h2 className="text-2xl font-extrabold mb-1">{t('List Your Equipment')}</h2>
                                    <p className={`${subTextColor} text-sm font-medium`}>{t('Provide details so nearby farmers can find your machinery.')}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold ml-1">{t('Equipment Name')}</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder={t('e.g., Mahindra 575 DI Tractor')}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full p-3 rounded-xl border outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-300'}`}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold ml-1">{t('Type')}</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className={`w-full p-3 rounded-xl border outline-none transition-all focus:border-amber-500 ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-300'}`}
                                        >
                                            {EQUIPMENT_TYPES.map(type => <option key={type} value={type}>{t(type)}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold ml-1">{t('Condition')}</label>
                                        <select
                                            value={formData.condition}
                                            onChange={e => setFormData({ ...formData, condition: e.target.value })}
                                            className={`w-full p-3 rounded-xl border outline-none transition-all focus:border-amber-500 ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-300'}`}
                                        >
                                            {CONDITIONS.map(cond => <option key={cond} value={cond}>{t(cond)}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold ml-1">{t('Rental Price (₹)')}</label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            placeholder="500"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            className={`w-full p-3 rounded-xl border outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-300'}`}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold ml-1">{t('Unit')}</label>
                                        <select
                                            value={formData.priceUnit}
                                            onChange={e => setFormData({ ...formData, priceUnit: e.target.value })}
                                            className={`w-full p-3 rounded-xl border outline-none transition-all focus:border-amber-500 ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-300'}`}
                                        >
                                            {PRICE_UNITS.map(unit => <option key={unit} value={unit}>{t(unit)}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold ml-1">{t('Description (Optional)')}</label>
                                        <textarea
                                            rows="3"
                                            placeholder={t('Add details about attachments, fuel, or driver availability')}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className={`w-full p-3 rounded-xl border outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 resize-none ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-300'}`}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-dashed border-slate-200 dark:border-zinc-800">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                                        {t('Post Equipment Listing')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </div>

            {/* Embedded Chat Modal */}
            {selectedChatUser && (
                <ExpertChatRoom
                    otherUserId={selectedChatUser}
                    category="equipment"
                    onClose={() => {
                        setSelectedChatUser(null);
                        fetchMyChats();
                    }}
                />
            )}
        </div>
    );
};

export default EquipmentMarketplace;
