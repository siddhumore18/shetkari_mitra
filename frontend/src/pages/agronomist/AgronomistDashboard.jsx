import { useState, useEffect } from 'react';
import { agronomistAPI, cropAPI, expertChatAPI } from '../../services/api';
import socket from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import ExpertChatRoom from '../../components/ExpertChatRoom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const CROP_EMOJI = {
  wheat: '🌾', rice: '🍚', sugarcane: '🎋', cotton: '🌿', maize: '🌽',
  soybean: '🫘', tomato: '🍅', onion: '🧅', potato: '🥔', banana: '🍌',
  chilli: '🌶️', turmeric: '🟡', groundnut: '🥜', mustard: '🌻',
};
const getCropEmoji = (name = '') => {
  const lower = name.toLowerCase();
  return Object.entries(CROP_EMOJI).find(([k]) => lower.includes(k))?.[1] || '🌾';
};

const AgronomistDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [localFarmers, setLocalFarmers] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [farmerError, setFarmerError] = useState('');
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [viewingCrops, setViewingCrops] = useState(null);
  const [viewingFarmerName, setViewingFarmerName] = useState('');
  const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(false);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChatFarmer, setSelectedChatFarmer] = useState(null);

  useEffect(() => {
    fetchLocalFarmers();
    fetchActiveChats();

    // Socket: Join personal room for notifications
    if (user?._id) {
      if (!socket.connected) socket.connect();
      socket.emit('join_user', user._id);
    }

    const handleNotification = (data) => {
      console.log('📬 New Chat Notification:', data);
      fetchActiveChats();
    };

    socket.on('expert_chat_notification', handleNotification);

    return () => {
      socket.off('expert_chat_notification', handleNotification);
    };
  }, [user?._id]);

  const fetchActiveChats = async () => {
    try {
      const res = await expertChatAPI.getMyChats();
      setActiveChats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  };

  const fetchLocalFarmers = async () => {
    try {
      setLoadingFarmers(true);
      const response = await agronomistAPI.findLocalFarmers();
      setLocalFarmers(response.data);
    } catch (err) {
      setFarmerError(err.response?.data?.message || 'Failed to fetch farmers');
    } finally {
      setLoadingFarmers(false);
    }
  };

  const handleViewCrops = async (farmer) => {
    try {
      setLoadingCrops(true);
      setViewingCrops(farmer.id);
      setViewingFarmerName(farmer.fullName);
      const response = await cropAPI.getCropsByFarmer(farmer.id);
      setCrops(response.data);
    } catch (err) {
      setFarmerError(err.response?.data?.message || 'Failed to fetch crops');
      setViewingCrops(null);
    } finally {
      setLoadingCrops(false);
    }
  };

  const closeCropsModal = () => { setViewingCrops(null); setCrops([]); };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">

      {/* ── Welcome Banner ── */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-700 text-white shadow-2xl">
        <div className="absolute top-0 right-0 text-[160px] leading-none opacity-10 select-none -mt-4 -mr-4">🔬</div>
        <CardContent className="p-8">
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner shrink-0">🔬</div>
              <div>
                <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider mb-1">{t('Agricultural Expert')}</p>
                <h1 className="text-3xl font-extrabold text-white mb-1">{t('Agronomist Dashboard')}</h1>
                <p className="text-teal-100 text-sm max-w-lg">{t('Help farmers in your district by viewing their crops and providing professional agricultural guidance.')}</p>
              </div>
            </div>
            <Badge className="hidden sm:flex items-center gap-1.5 bg-white/20 border border-white/20 text-white text-sm px-4 py-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {t('Active')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── Farmer Inquiries (Chats) ── */}
      {/* <Card className="border-emerald-200 bg-white dark:bg-zinc-900 overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-lg">💬</div>
            <CardTitle className="text-lg font-bold">{t('Recent Inquiries')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeChats.length === 0 ? (
            <div className="p-10 text-center opacity-40">
              <p className="text-sm font-bold italic">{t('No active inquiries at the moment.')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {activeChats.map(chat => (
                <div
                  key={chat._id}
                  onClick={() => setSelectedChatFarmer(chat.farmerId._id)}
                  className="p-4 hover:bg-emerald-50/50 dark:hover:bg-zinc-800/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold overflow-hidden border-2 border-transparent group-hover:border-emerald-500/30 transition-all">
                      {chat.farmerId.profilePhoto?.url ? (
                        <img src={chat.farmerId.profilePhoto.url} className="w-full h-full object-cover" />
                      ) : chat.farmerId.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">{chat.farmerId.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-[300px]">
                        {chat.messages?.[chat.messages.length - 1]?.text || t('No messages yet')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {new Date(chat.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 font-bold px-2">
                        {t('Reply')}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* ── Tip ── */}
      <Card className="border-cyan-200 bg-cyan-50 dark:bg-cyan-950/20 dark:border-cyan-800/30">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="text-3xl shrink-0">💡</div>
          <div>
            <p className="font-extrabold text-cyan-800 dark:text-cyan-300 text-sm uppercase tracking-wide mb-1">Agronomist Tip</p>
            <p className="text-cyan-900 dark:text-cyan-200 text-sm leading-relaxed">
              Click <strong>"View Crops"</strong> on any farmer card below to see what crops they are growing — so you can provide more relevant and targeted advice.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Farmers Section ── */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">👨‍🌾</div>
            <div className="flex-1">
              <CardTitle className="text-xl font-extrabold text-white">Farmers in Your District</CardTitle>
              <p className="text-teal-100 text-xs mt-0.5">Connect with farmers and view their crops to offer guidance</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/20 text-sm font-bold">
              {loadingFarmers ? '…' : localFarmers.length} farmers
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {farmerError && (
            <div className="mb-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              ⚠️ {farmerError}
            </div>
          )}

          {loadingFarmers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : localFarmers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👨‍🌾</div>
              <p className="text-foreground font-semibold text-lg">No farmers in your district yet.</p>
              <p className="text-muted-foreground text-sm mt-1">Check back later as more farmers register.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {localFarmers.map((farmer) => (
                <Card key={farmer.id} className="border-teal-100 dark:border-teal-900/30 hover:shadow-lg transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                      {farmer.profilePhotoUrl ? (
                        <img src={farmer.profilePhotoUrl} alt={farmer.fullName}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-teal-300 shadow cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setViewingPhoto(farmer.profilePhotoUrl)} />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-extrabold text-xl shadow shrink-0">
                          {farmer.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-lg text-foreground truncate hover:text-teal-600 transition-colors">{farmer.fullName}</h3>
                        <p className="text-sm font-semibold text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <span className="text-rose-500">📞</span> {farmer.mobileNumber}
                        </p>
                        {farmer.district && (
                          <p className="text-xs font-bold text-teal-600 mt-1 flex items-center gap-1.5">
                            <span className="text-teal-500">📍</span> {farmer.district}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <button
                        onClick={() => setSelectedChatFarmer(farmer.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-xs border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-all shadow-sm"
                      >
                        💬 {t('Chat')}
                      </button>
                      <a
                        href={`tel:${farmer.mobileNumber}`}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl font-bold text-xs border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 transition-all shadow-sm"
                      >
                        📞 {t('Call')}
                      </a>
                    </div>

                    <button onClick={() => handleViewCrops(farmer)}
                      className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      🌾 {t('View Crops')}
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Photo Modal ── */}
      {viewingPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewingPhoto(null)}>
          <Card className="max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex-row items-center justify-between py-4">
              <CardTitle>Profile Photo</CardTitle>
              <button onClick={() => setViewingPhoto(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground text-xl">×</button>
            </CardHeader>
            <CardContent className="p-4">
              <img src={viewingPhoto} alt="Farmer" className="w-full rounded-xl object-cover shadow" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Crops Modal ── */}
      {viewingCrops && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeCropsModal}>
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <CardHeader className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-xl py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-white flex items-center gap-2">🌾 Crops</CardTitle>
                  <p className="text-teal-200 text-xs mt-0.5">{viewingFarmerName}'s farm</p>
                </div>
                <button onClick={closeCropsModal} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-teal-800 text-2xl text-white transition-colors">×</button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loadingCrops ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-4 text-muted-foreground">Loading crops…</span>
                </div>
              ) : crops.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-3">🌿</div>
                  <p className="text-muted-foreground font-semibold">No crops found for this farmer.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {crops.map((crop) => (
                    <Card key={crop._id} className="border-teal-100 dark:border-teal-900/30 hover:shadow-md transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center text-2xl shadow">
                            {getCropEmoji(crop.cropName)}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-foreground">{crop.cropName}</h4>
                            <Badge variant="success" className="text-[10px]">Active</Badge>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {crop.cropVariety && <p>Variety: <strong className="text-foreground">{crop.cropVariety}</strong></p>}
                          <p>Planted: <strong className="text-foreground">{new Date(crop.plantingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></p>
                          <p>Area: <strong className="text-foreground">{crop.area?.value} {crop.area?.unit}</strong></p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {selectedChatFarmer && (
        <ExpertChatRoom
          otherUserId={selectedChatFarmer}
          category="expert"
          onClose={() => {
            setSelectedChatFarmer(null);
            fetchActiveChats?.();
          }}
        />
      )}
    </div>
  );
};

export default AgronomistDashboard;
