import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supplyChainAPI } from '../../services/api';
import {
    Users,
    MapPin,
    Phone,
    MessageCircle,
    Truck,
    Loader2,
    PackageCheck,
    Building2,
    Sprout
} from 'lucide-react';
import ExpertChatRoom from '../../components/ExpertChatRoom';

const ConnectedRetailers = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { isDark } = useTheme();

    const [groupedRetailers, setGroupedRetailers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedChatUser, setSelectedChatUser] = useState(null);

    useEffect(() => {
        const fetchMyCollaborations = async () => {
            try {
                setLoading(true);
                const res = await supplyChainAPI.getMyCollaborations();

                // `res.data.data.chats` contains accepted collaborations / active chats
                const activeChats = res.data.data.chats || [];

                // We want to group by Retailer and show the listings
                const grouped = {};

                activeChats.forEach(chat => {
                    // Find the other participant who is not the farmer
                    const otherParticipant = chat.participants.find(p => p._id !== user.id);
                    if (!otherParticipant) return;

                    const rId = otherParticipant._id;

                    // Get the listing details from the request
                    const listing = chat.requestId?.listingId;

                    if (!grouped[rId]) {
                        grouped[rId] = {
                            retailer: otherParticipant,
                            listings: [],
                            contactPhone: otherParticipant.mobileNumber || 'N/A',
                            city: otherParticipant.address?.taluka || otherParticipant.address?.district || 'Local'
                        };
                    }

                    if (listing) {
                        grouped[rId].listings.push(listing);
                    }
                });

                setGroupedRetailers(Object.values(grouped));
            } catch (err) {
                setError(err.response?.data?.message || t('Failed to load connected retailers'));
            } finally {
                setLoading(false);
            }
        };
        fetchMyCollaborations();
    }, [t, user.id]);

    const pageBg = isDark ? 'bg-zinc-950' : 'bg-slate-50';
    const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';
    const textColor = isDark ? 'text-zinc-100' : 'text-slate-900';
    const subTextColor = isDark ? 'text-zinc-400' : 'text-slate-500';

    return (
        <div className={`min-h-screen ${pageBg} ${textColor} p-4 sm:p-6 lg:p-8 pt-20 transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none scale-150">
                        <Users size={160} />
                    </div>
                    <div className="relative z-10 flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <Users size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t('Connected Retailers')}</h1>
                            <p className="text-emerald-100 text-base sm:text-lg max-w-2xl font-medium mt-1">
                                {t('Retailers you have successfully partnered with for your crops.')}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl font-medium shadow-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center p-20">
                        <Loader2 className="animate-spin text-emerald-500" size={48} />
                    </div>
                ) : groupedRetailers.length === 0 ? (
                    <div className={`text-center p-16 rounded-3xl border border-dashed ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-slate-300 bg-white/50'} shadow-sm`}>
                        <PackageCheck size={64} className={`mx-auto mb-4 opacity-20 ${textColor}`} />
                        <h3 className="text-2xl font-black mb-2">{t('No active partnerships yet')}</h3>
                        <p className={`${subTextColor} max-w-md mx-auto`}>
                            {t("You haven't accepted any collaboration requests from retailers yet. Once you do, they will appear here.")}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {groupedRetailers.map(({ retailer, listings, contactPhone, city }) => (
                            <div key={retailer._id} className={`rounded-2xl border ${cardBg} shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group`}>

                                {/* Retailer Header Area */}
                                <div className="p-5 border-b border-dashed border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-inner">
                                            {retailer.fullName?.charAt(0) || 'R'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg leading-tight">{retailer.fullName || t('Retailer')}</p>
                                            <p className={`text-xs ${subTextColor} font-medium flex items-center gap-1 mt-0.5`}>
                                                <MapPin size={12} className="text-rose-500" />
                                                {city}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedChatUser(retailer._id)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors shadow-sm"
                                        >
                                            <MessageCircle size={18} />
                                        </button>
                                        <a
                                            href={`tel:${contactPhone}`}
                                            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                                        >
                                            <Phone size={18} />
                                        </a>
                                    </div>
                                </div>

                                {/* Sold Listings Area */}
                                <div className={`p-5 flex-1 flex flex-col gap-4 ${isDark ? 'bg-zinc-900/30' : 'bg-slate-50/50'}`}>
                                    <h4 className={`text-xs font-black uppercase tracking-widest ${subTextColor}`}>
                                        {t('Sold Crops')} ({listings.length})
                                    </h4>

                                    <div className="space-y-3">
                                        {listings.map(item => (
                                            <div key={item._id} className={`p-4 rounded-xl border ${cardBg} relative overflow-hidden shadow-sm`}>

                                                {/* Mini Status Badge */}
                                                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50`}>
                                                    <span className="w-1 h-1 rounded-full bg-amber-500" />
                                                    {t('Sold')}
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/50">
                                                        <Sprout size={20} />
                                                    </div>
                                                    <div className="pr-12">
                                                        <h5 className="font-bold text-base leading-tight">{item.cropType}</h5>
                                                        <p className={`text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1`}>
                                                            {item.quantity} {t(item.unit)} &bull; ₹{item.price}/{t(item.unit)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Embedded Chat Modal */}
            {selectedChatUser && (
                <ExpertChatRoom
                    otherUserId={selectedChatUser}
                    category="retailer"
                    onClose={() => {
                        setSelectedChatUser(null);
                    }}
                />
            )}
        </div>
    );
};

export default ConnectedRetailers;
