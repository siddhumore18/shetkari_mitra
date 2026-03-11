import { useEffect, useState } from 'react';
import {
    Store,
    MapPin,
    TrendingUp,
    Package,
    MessageSquare,
    Search,
    Filter,
    Phone,
    User,
    ChevronRight,
    ArrowLeft,
    Loader2,
    Clock,
    Users,
    X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supplyChainAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import ExpertChatRoom from '../../components/ExpertChatRoom';

const RetailerMarketplace = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCrop, setFilterCrop] = useState('');
    const [selectedListing, setSelectedListing] = useState(null);
    const [connectedFarmerIds, setConnectedFarmerIds] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [selectedChatUser, setSelectedChatUser] = useState(null);

    useEffect(() => {
        const fetchAllListings = async () => {
            try {
                setLoading(true);
                const lat = user?.location?.coordinates?.[1] || 16.7050;
                const lng = user?.location?.coordinates?.[0] || 74.2433;

                const res = await supplyChainAPI.getNearbyListings(lat, lng, 1000);
                setListings(res.data?.data || []);

                const collabRes = await supplyChainAPI.getMyCollaborations();
                const collabs = collabRes.data?.data || { chats: [], sent: [] };

                const connectedIds = new Set();
                collabs.chats.forEach(chat => {
                    chat.participants.forEach(p => {
                        if (p._id !== user.id) connectedIds.add(p._id);
                    });
                });

                const pendingListingIds = new Set();
                collabs.sent.forEach(req => pendingListingIds.add(req.listingId?._id || req.listingId));

                setConnectedFarmerIds(Array.from(connectedIds));
                setSentRequests(Array.from(pendingListingIds));
            } catch (err) {
                console.error('Marketplace Load Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllListings();
    }, [user]);

    const filteredListings = listings.filter(l => {
        const matchesQuery = l.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.farmerId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCrop = filterCrop === '' || l.cropType === filterCrop;
        return matchesQuery && matchesCrop;
    });

    const handleSendRequest = async (listing) => {
        try {
            await supplyChainAPI.sendRequest({
                receiverId: listing.farmerId?._id,
                listingId: listing._id,
                message: `Hi ${listing.farmerId?.fullName}, I saw your post for ${listing.cropType} and I'm interested. Let's discuss details.`
            });
            setSentRequests(prev => [...prev, listing._id]);
            alert(t('Collaboration request sent!'));
        } catch (err) {
            alert(t('Failed to send request.'));
        }
    };

    const CropCard = ({ list }) => (
        <div
            onClick={() => setSelectedListing(list)}
            className={`group p-5 rounded-3xl border transition-all cursor-pointer hover:shadow-2xl hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 hover:border-blue-500/50' : 'bg-white border-gray-100 hover:border-blue-300'
                }`}
        >
            <div className="flex gap-5">
                <div className="w-24 h-24 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-2xl overflow-hidden shadow-inner shrink-0">
                    {list.listingImage ? <img src={list.listingImage} className="w-full h-full object-cover" /> : list.cropType?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className={`text-xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{list.cropType}</h3>
                            <p className="text-sm text-blue-500 font-bold mt-1 flex items-center gap-1.5">
                                <User size={14} /> {list.farmerId?.fullName}
                            </p>
                        </div>
                        <p className="text-2xl font-black text-emerald-600">₹{list.price}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4">
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                            <Package size={14} className="text-blue-500" /> {list.quantity} {list.unit}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                            <MapPin size={14} className="text-red-500" /> {list.city || 'Local'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${isDark ? 'kk-page-dark' : 'kk-page-light'}`} style={{ backgroundColor: 'var(--bg-page)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Back to Dashboard */}
                <button
                    onClick={() => navigate('/retailer')}
                    className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                >
                    <ArrowLeft size={16} /> {t('Back to Dashboard')}
                </button>

                {/* Header & Search */}
                <div className="flex flex-col md:grid-cols-2 md:items-end justify-between gap-6">
                    <div className="flex-1">
                        <h1 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('Farmer Marketplace')}</h1>
                        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('Direct access to all active farmer listings across India.')}</p>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={t('Search by crop or farmer name...')}
                                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-white border-gray-100 focus:border-blue-400'
                                        }`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="relative w-full sm:w-48">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none appearance-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-white border-gray-100 focus:border-blue-400'
                                        }`}
                                    value={filterCrop}
                                    onChange={(e) => setFilterCrop(e.target.value)}
                                >
                                    <option value="">{t('All Crops')}</option>
                                    <option value="Soybean">Soybean</option>
                                    <option value="Cotton">Cotton</option>
                                    <option value="Grapes">Grapes</option>
                                    <option value="Wheat">Wheat</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Feed */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                        <p className="text-gray-500 font-bold">{t('Discovering fresh produce...')}</p>
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                        <Package size={64} className="mx-auto text-gray-400 opacity-20 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-500">{t('No matching products found')}</h2>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6 pb-20">
                        {filteredListings.map(list => <CropCard key={list._id} list={list} />)}
                    </div>
                )}

                {/* Detail View Modal (Simple overlay) */}
                {selectedListing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <div
                            className={`w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#1a1c2e] border border-white/10' : 'bg-white'
                                }`}
                        >
                            <div className="relative h-64">
                                <img
                                    src={selectedListing.listingImage || 'https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=800'}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => setSelectedListing(null)}
                                    className="absolute top-6 right-6 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md transition-all"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                                    <h2 className="text-4xl font-extrabold text-white">{selectedListing.cropType}</h2>
                                    <p className="text-blue-300 font-bold flex items-center gap-2 mt-1">
                                        <Users size={16} /> {selectedListing.farmerId?.fullName} • {t('Verified Farmer')}
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{t('Price')}</p>
                                        <p className="text-2xl font-black text-emerald-600 mt-1">₹{selectedListing.price} <span className="text-sm">/ {selectedListing.unit}</span></p>
                                    </div>
                                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{t('Quantity')}</p>
                                        <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedListing.quantity} {selectedListing.unit}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className={`text-sm font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('Contact Information')}</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                                <Phone size={18} />
                                            </div>
                                            <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedListing.contactPhone || selectedListing.farmerId?.mobileNumber || '+91 99XXXXXX00'}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                                                <MapPin size={18} />
                                            </div>
                                            <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedListing.city}, {selectedListing.farmerId?.address?.state || 'India'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className={`text-sm font-black uppercase tracking-widest mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('Description')}</h4>
                                    <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {selectedListing.description || t('Premium quality organic harvest available for immediate pick-up. Transport coordination possible for bulk orders.')}
                                    </p>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <a
                                        href={`tel:${selectedListing.contactPhone || selectedListing.farmerId?.mobileNumber}`}
                                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 text-center transition-all flex items-center justify-center gap-3"
                                    >
                                        <Phone size={20} /> {t('Call Farmer')}
                                    </a>

                                    {connectedFarmerIds.includes(selectedListing.farmerId?._id) ? (
                                        <button
                                            onClick={() => setSelectedChatUser(selectedListing.farmerId?._id)}
                                            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
                                        >
                                            <MessageSquare size={20} /> {t('Chat (Connected)')}
                                        </button>
                                    ) : sentRequests.includes(selectedListing._id) ? (
                                        <button disabled className="flex-1 py-4 bg-slate-300 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 font-black rounded-2xl cursor-not-allowed flex items-center justify-center gap-3">
                                            <Clock size={20} /> {t('Request Pending')}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSendRequest(selectedListing)}
                                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
                                        >
                                            <MessageSquare size={20} /> {t('Send Inquiry')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Embedded Chat Modal */}
                {selectedChatUser && (
                    <ExpertChatRoom
                        otherUserId={selectedChatUser._id || selectedChatUser}
                        category="retailer"
                        onClose={() => {
                            setSelectedChatUser(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default RetailerMarketplace;
