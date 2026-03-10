import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Store,
    MapPin,
    TrendingUp,
    Package,
    MessageSquare,
    Search,
    Zap,
    ChevronRight,
    Filter,
    Users,
    PieChart,
    Truck
} from 'lucide-react';
import { supplyChainAPI, marketAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const RetailerDashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { isDark } = useTheme();

    const [nearbyListings, setNearbyListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marketStats, setMarketStats] = useState(null);
    const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' | 'my-orders'

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch listings based on user location if available, else default
                const lat = user?.location?.coordinates?.[1] || 16.7050;
                const lng = user?.location?.coordinates?.[0] || 74.2433;

                const [listingsRes, statsRes] = await Promise.all([
                    supplyChainAPI.getNearbyListings(lat, lng, 50),
                    marketAPI.getStats()
                ]);

                setNearbyListings(listingsRes.data?.data || []);
                setMarketStats(statsRes.data || { totalRecords: 1240, lastUpdated: new Date() });
            } catch (err) {
                console.error('Dashboard Load Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleSendRequest = async (listing) => {
        try {
            await supplyChainAPI.sendRequest({
                receiverId: listing.farmerId?._id,
                listingId: listing._id,
                message: `Hi ${listing.farmerId?.fullName}, I am interested in purchasing your ${listing.cropType}. Let's collaborate!`
            });
            alert(t('Collaboration request sent successfully!'));
        } catch (err) {
            console.error('Request Error:', err);
            alert(t('Failed to send request.'));
        }
    };

    const stats = [
        { label: t('Available Crops'), value: nearbyListings.length, icon: Package, color: 'emerald' },
        { label: t('Market Sentiment'), value: 'Rising', icon: TrendingUp, color: 'blue' },
        { label: t('Active Farmers'), value: '45+', icon: Users, color: 'purple' },
        { label: t('Logistics Ready'), value: '85%', icon: Truck, color: 'orange' },
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'kk-page-dark' : 'kk-page-light'}`} style={{ backgroundColor: 'var(--bg-page)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white shadow-2xl">
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                <Zap size={14} className="text-yellow-400" />
                                {t('Retailer Hub')}
                            </div>
                            <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
                                {t('Welcome back')}, {user?.fullName?.split(' ')[0]}
                            </h1>
                            <p className="mt-2 text-blue-100 flex items-center gap-2">
                                <MapPin size={16} /> {user?.address?.district || 'Nagpur Region'} • {t('Sourcing verified crops directly from farmers')}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Link to="/farmer/market" className="rounded-2xl bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/20">
                                {t('View Market Rates')}
                            </Link>
                            <button onClick={() => setActiveTab('marketplace')} className="rounded-2xl bg-white px-6 py-3 font-bold text-blue-800 shadow-xl hover:scale-105 transition-all">
                                {t('Source Now')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div key={i} className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'} shadow-sm`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${s.color}-100 text-${s.color}-600`}>
                                <s.icon size={24} />
                            </div>
                            <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.label}</p>
                            <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Marketplace Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className={`text-2xl font-extrabold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Store className="text-blue-600" /> {t('Live Farmer Inventory')}
                            </h2>
                            <button className={`p-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}>
                                <Filter size={20} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-40 rounded-3xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                ))}
                            </div>
                        ) : nearbyListings.length === 0 ? (
                            <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-dashed border-[var(--border-card)]">
                                <Package size={64} className="mx-auto text-gray-400 opacity-30 mb-4" />
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">No active listings nearby</h3>
                                <p className="text-[var(--text-secondary)] mt-2">Check back later or increase your search radius.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {nearbyListings.map((list) => (
                                    <div key={list._id} className={`group relative p-6 rounded-3xl border transition-all hover:scale-[1.01] hover:shadow-xl ${isDark ? 'bg-white/5 border-white/10 hover:border-blue-500/50' : 'bg-white border-gray-100 hover:border-blue-300'}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xl overflow-hidden shadow-inner">
                                                    {list.listingImage ? <img src={list.listingImage} className="w-full h-full object-cover" /> : list.cropType?.[0]}
                                                </div>
                                                <div>
                                                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{list.cropType}</h3>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] font-medium">
                                                            <Package size={14} className="text-blue-500" /> {list.quantity} {list.unit}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] font-medium">
                                                            <MapPin size={14} className="text-red-500" /> {list.city || 'Local'}
                                                        </span>
                                                    </div>
                                                    <div className="mt-4 flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                            {list.farmerId?.fullName?.[0]}
                                                        </div>
                                                        <span className="text-xs font-semibold text-[var(--text-secondary)]">Farmer: {list.farmerId?.fullName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-emerald-600">₹{list.price}<span className="text-xs text-gray-500 ml-1">/kg</span></p>
                                                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('Expires')}: {new Date(list.availabilityDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex gap-3">
                                            <button
                                                onClick={() => handleSendRequest(list)}
                                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare size={18} /> {t('Send Collab Request')}
                                            </button>
                                            <button className={`px-4 py-3 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} hover:bg-white/10 transition-all`}>
                                                <ChevronRight size={20} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Side Panel */}
                    <div className="space-y-6">
                        {/* Market Insights Card */}
                        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl relative overflow-hidden">
                            <PieChart className="absolute -bottom-6 -right-6 h-32 w-32 text-white/10" />
                            <h3 className="text-xl font-bold mb-4">{t('Market Intelligence')}</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                                    <p className="text-xs text-blue-100 uppercase tracking-widest font-bold">Recent Trend</p>
                                    <p className="text-lg font-black mt-1 flex items-center gap-2">Soybean Demand <TrendingUp size={20} className="text-green-400" /></p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
                                    <p className="text-xs text-blue-100 uppercase tracking-widest font-bold">Supply Alert</p>
                                    <p className="text-lg font-black mt-1">Limited Grapes Supply</p>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-4 bg-white text-blue-800 font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all">
                                {t('Full Report')}
                            </button>
                        </div>

                        {/* Recent Activity */}
                        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'} shadow-sm`}>
                            <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Users size={18} className="text-purple-500" /> {t('Recent Collaborations')}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">JD</div>
                                    <div>
                                        <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Request to Ramesh K.</p>
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Completed</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">SK</div>
                                    <div>
                                        <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Inquiry for Cotton</p>
                                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Pending</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default RetailerDashboard;
