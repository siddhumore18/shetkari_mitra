import { useState, useEffect } from 'react';
import {
  User,
  Globe,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  Check,
  X,
  Upload,
  Trash2,
  Camera,
  Languages,
  Sprout,
  Ruler,
  Droplets,
  Leaf,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
  Brain,
  RotateCcw
} from 'lucide-react';
import { userAPI, geminiAPI, mediaAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import LocationUpdate from '../components/LocationUpdate';
import { useLanguage } from '../context/LanguageContext';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { t, lang, selectLanguage, SUPPORTED_LANGUAGES } = useLanguage();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    language: '',
    district: '',
    taluka: '',
    groqApiKey: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [farmFormData, setFarmFormData] = useState({
    totalArea: { value: '', unit: 'acres' },
    soilType: '',
    irrigationType: '',
    primaryCrops: [],
    experienceYears: '',
    farmingStage: 'starting',
    targetYield: '',
  });
  const [savingFarm, setSavingFarm] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [fetchingAdvice, setFetchingAdvice] = useState(false);
  const [seedImages, setSeedImages] = useState({});

  useEffect(() => {
    if (activeTab === 'farm' && farmFormData.primaryCrops.length > 0 && !aiAdvice) {
      fetchSeedAdvice();
    }
  }, [activeTab]);

  const fetchSeedAdvice = async () => {
    setFetchingAdvice(true);

    // Check for User's API Key
    const userStored = JSON.parse(localStorage.getItem('user'));
    if (!userStored?.groqApiKey) {
      setFetchingAdvice(false);
      setAiAdvice(null);
      return;
    }

    try {
      const response = await geminiAPI.getSeedAdvice(farmFormData, lang);
      const advice = response.data.advice;
      setAiAdvice(advice);

      if (advice.seedRecommendations) {
        const imgPromises = advice.seedRecommendations.map(async (seed) => {
          const query = seed.searchQuery || `${seed.name} ${farmFormData.primaryCrops[0]} seeds India`;
          const url = await mediaAPI.searchImages(query);
          return { name: seed.name, url };
        });
        const results = await Promise.all(imgPromises);
        const imgMap = {};
        results.forEach(res => imgMap[res.name] = res.url);
        setSeedImages(imgMap);
      }
    } catch (err) {
      console.error('Failed to fetch seed advice', err);
    } finally {
      setFetchingAdvice(false);
    }
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'location', 'farm', 'password', 'language'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      setProfile(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        language: response.data.language || 'en',
        district: response.data.address?.district || '',
        taluka: response.data.address?.taluka || '',
      });
      if (response.data.farmInfo) {
        setFarmFormData({
          totalArea: response.data.farmInfo.totalArea || { value: '', unit: 'acres' },
          soilType: response.data.farmInfo.soilType || '',
          irrigationType: response.data.farmInfo.irrigationType || '',
          primaryCrops: response.data.farmInfo.primaryCrops || [],
          experienceYears: response.data.farmInfo.experienceYears || '',
          farmingStage: response.data.farmInfo.farmingStage || 'starting',
          targetYield: response.data.farmInfo.targetYield || ''
        });
      }
      setFormData(prev => ({
        ...prev,
        groqApiKey: response.data.groqApiKey || '',
      }));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.updateProfile(formData);
      const updatedUser = response.data;
      updateUser(updatedUser);
      setProfile(updatedUser);
      setFormData({
        fullName: updatedUser.fullName || '',
        language: updatedUser.language || 'en',
        district: updatedUser.address?.district || '',
        taluka: updatedUser.address?.taluka || '',
      });
      setError('');
      alert('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError('');
      alert('Password changed successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleFarmUpdate = async (e) => {
    e.preventDefault();
    try {
      setSavingFarm(true);
      const response = await userAPI.updateFarmInfo({ farmInfo: farmFormData });
      updateUser(response.data.user);
      setProfile(response.data.user);
      setError('');
      alert('Farm information updated successfully');
      // Refetch advice with new data
      fetchSeedAdvice();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update farm info');
    } finally {
      setSavingFarm(false);
    }
  };

  const handleCropToggle = (crop) => {
    setFarmFormData(prev => ({
      ...prev,
      primaryCrops: prev.primaryCrops.includes(crop)
        ? prev.primaryCrops.filter(c => c !== crop)
        : [...prev.primaryCrops, crop]
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset file input
    e.target.value = '';

    try {
      const response = await userAPI.uploadPhoto(file);
      if (response.data?.user) {
        const updatedUser = response.data.user;
        updateUser(updatedUser);
        setProfile(updatedUser);
        setError('');
        alert('Photo uploaded successfully');
      } else {
        await fetchProfile();
        setError('');
        alert('Photo uploaded successfully');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to upload photo';
      setError(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error('Upload error:', errorMessage);
      }
    }
  };

  const handlePhotoDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile photo?')) {
      try {
        await userAPI.deletePhoto();
        fetchProfile();
        setError('');
        alert('Photo deleted successfully');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete photo');
      }
    }
  };

  const handlePhotoClick = () => {
    if (profile?.profilePhoto?.url) {
      setShowPhotoModal(true);
    }
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <style>{`
          .profile-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
        `}</style>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <style>{`
        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          color: var(--text-primary);
        }

        .profile-header {
          font-size: 2.25rem;
          font-weight: 900;
          color: var(--text-primary);
          margin-bottom: 30px;
          letter-spacing: -0.025em;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          margin-bottom: 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .profile-card {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border-card);
          border-radius: 24px;
          box-shadow: var(--shadow-card);
          overflow: hidden;
        }

        .tab-navigation {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border-card);
          padding: 0 10px;
        }
        .tab-navigation::-webkit-scrollbar { display: none; }

        .tab-button {
          padding: 20px 24px;
          font-size: 0.95rem;
          font-weight: 700;
          background: none;
          border: none;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .tab-button:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .tab-button.active {
          color: var(--accent-emerald);
          border-bottom-color: var(--accent-emerald);
        }

        .tab-content {
          padding: 40px;
        }

        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-secondary);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 14px 18px;
          background: var(--bg-input);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input:focus,
        .form-select:focus {
          border-color: var(--accent-emerald);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .form-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .photo-image {
          width: 160px;
          height: 160px;
          border-radius: 40px;
          object-fit: cover;
          cursor: pointer;
          border: 4px solid var(--accent-emerald);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.2);
        }

        .photo-image:hover {
          transform: scale(1.05) rotate(2deg);
        }

        .button {
          padding: 14px 28px;
          border-radius: 16px;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .button-primary {
          background: linear-gradient(135deg, var(--accent-emerald), #059669);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }

        .button-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .button-danger:hover {
          background: #ef4444;
          color: white;
        }

        @media (max-width: 768px) {
          .tab-content {
            padding: 24px;
          }
        }
      `}</style>

      <h1 className="profile-header">{t('My Account')}</h1>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="profile-card">
        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab('profile')}
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={18} /> {t('Personal Details')}
          </button>

          {user?.role === 'farmer' && (
            <button
              onClick={() => setActiveTab('farm')}
              className={`tab-button ${activeTab === 'farm' ? 'active' : ''}`}
            >
              <Sprout size={18} /> {t('Farm Information')}
            </button>
          )}

          <button
            onClick={() => setActiveTab('location')}
            className={`tab-button ${activeTab === 'location' ? 'active' : ''}`}
          >
            <MapPin size={18} /> {t('Location')}
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          >
            <Lock size={18} /> {t('Security')}
          </button>
          <button
            onClick={() => setActiveTab('language')}
            className={`tab-button ${activeTab === 'language' ? 'active' : ''}`}
          >
            <Languages size={18} className="inline mr-2" /> {t('Language')}
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
          >
            <Brain size={18} className="text-emerald-500" /> {t('AI Settings')}
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'profile' && (
            <div>
              <div className="photo-section flex flex-col items-center sm:items-start gap-6 mb-10">
                <div className="relative group">
                  {profile?.profilePhoto?.url ? (
                    <img
                      src={profile.profilePhoto.url}
                      alt="Profile"
                      className="photo-image"
                      onClick={handlePhotoClick}
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-[40px] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border-4 border-emerald-500/30">
                      <Camera size={48} />
                    </div>
                  )}
                  <label htmlFor="photo-upload" className="absolute bottom-2 right-2 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-emerald-700 transition-all hover:scale-110">
                    <Upload size={18} />
                    <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} id="photo-upload" />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  {profile?.profilePhoto && (
                    <button onClick={handlePhotoDelete} className="button button-danger px-6 py-3">
                      <Trash2 size={16} /> {t('Remove Photo')}
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">{t('Full Name')}</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Mobile Number')}</label>
                    <input
                      type="text"
                      disabled
                      className="form-input opacity-70"
                      value={profile?.mobileNumber || ''}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Preferred Language')}</label>
                    <select
                      className="form-select"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="mr">Marathi</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('District')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('Taluka')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.taluka}
                      onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-actions pt-4">
                  <button type="submit" className="button button-primary w-full sm:w-auto min-w-[200px]">
                    <Check size={20} /> {t('Save Changes')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'farm' && user?.role === 'farmer' && (
            <div className="kk-fade-in">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-emerald-600">
                <Sprout size={24} /> {t('Farm Configuration')}
              </h2>

              <form onSubmit={handleFarmUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="form-label flex items-center gap-2">
                      <Ruler size={16} className="text-emerald-500" /> {t('Total Farm Area')}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={farmFormData.totalArea.value}
                        onChange={(e) => setFarmFormData({ ...farmFormData, totalArea: { ...farmFormData.totalArea, value: e.target.value } })}
                        className="form-input" placeholder="e.g. 5"
                      />
                      <select
                        value={farmFormData.totalArea.unit}
                        onChange={(e) => setFarmFormData({ ...farmFormData, totalArea: { ...farmFormData.totalArea, unit: e.target.value } })}
                        className="form-select max-w-[120px]"
                      >
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                        <option value="guntha">Guntha</option>
                        <option value="bigha">Bigha</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="form-label flex items-center gap-2">
                      <Leaf size={16} className="text-emerald-500" /> {t('Soil Type')}
                    </label>
                    <select
                      value={farmFormData.soilType}
                      onChange={(e) => setFarmFormData({ ...farmFormData, soilType: e.target.value })}
                      className="form-select"
                    >
                      <option value="">{t('Select Soil Type')}</option>
                      <option value="Black Soil">{t('Black Soil')}</option>
                      <option value="Alluvial Soil">{t('Alluvial Soil')}</option>
                      <option value="Red Soil">{t('Red Soil')}</option>
                      <option value="Laterite Soil">{t('Laterite Soil')}</option>
                      <option value="Sandy Soil">{t('Sandy Soil')}</option>
                      <option value="Clayey Soil">{t('Clayey Soil')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="form-label flex items-center gap-2">
                      <Droplets size={16} className="text-emerald-500" /> {t('Irrigation Type')}
                    </label>
                    <select
                      value={farmFormData.irrigationType}
                      onChange={(e) => setFarmFormData({ ...farmFormData, irrigationType: e.target.value })}
                      className="form-select"
                    >
                      <option value="">{t('Select Irrigation')}</option>
                      <option value="Drip Irrigation">{t('Drip Irrigation')}</option>
                      <option value="Sprinkler">{t('Sprinkler')}</option>
                      <option value="Borewell">{t('Borewell')}</option>
                      <option value="Canal">{t('Canal')}</option>
                      <option value="Rain-fed">{t('Rain-fed')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="form-label flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-500" /> {t('Farming Experience (Years)')}
                    </label>
                    <input
                      type="number"
                      value={farmFormData.experienceYears}
                      onChange={(e) => setFarmFormData({ ...farmFormData, experienceYears: e.target.value })}
                      className="form-input" placeholder="e.g. 10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="form-label flex items-center gap-2">
                      <Layers size={16} className="text-emerald-500" /> {t('Current Farming Stage')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['starting', 'growing', 'harvested'].map(stage => (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => setFarmFormData({ ...farmFormData, farmingStage: stage })}
                          className={"px-3 py-2 rounded-lg border-2 text-[10px] font-black uppercase tracking-wider transition-all " + (farmFormData.farmingStage === stage
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg'
                            : 'bg-white/5 border-emerald-100 dark:border-white/10 text-gray-400')}
                        >
                          {t(stage)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="form-label flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-500" /> {farmFormData.farmingStage === 'starting' ? t('Target Yield') : t('Reported Yield')}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={farmFormData.targetYield}
                      onChange={(e) => setFarmFormData({ ...farmFormData, targetYield: e.target.value })}
                      placeholder={t('e.g. 50 quintals')}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="form-label flex items-center gap-2">
                    <Sprout size={16} className="text-emerald-500" /> {t('Primary Crops')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Soybean', 'Maize', 'Tomato', 'Onion', 'Potato'].map(crop => (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => handleCropToggle(crop)}
                        className={"px-4 py-2 rounded-xl border-2 transition-all font-bold text-sm " + (farmFormData.primaryCrops.includes(crop)
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white/5 border-emerald-100 dark:border-white/10 text-gray-400 hover:border-emerald-300')}
                      >
                        {t(crop)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={savingFarm}
                    className="button button-primary w-full sm:w-auto min-w-[240px]"
                  >
                    {savingFarm ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={20} /> {t('Update Farm Details')}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* AI Recommendations Section */}
              <div className="mt-12 pt-12 border-t border-emerald-100 dark:border-white/10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                      <Brain className="text-emerald-500" size={28} /> {t('AI Smart Recommendations')}
                    </h3>
                    <p className="text-secondary text-sm font-medium mt-1">
                      {t('Personalized based on your farm location, soil, and crop history.')}
                    </p>
                  </div>
                  {fetchingAdvice && (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-pulse">
                      <RotateCcw className="animate-spin" size={16} /> {t('Analyzing...')}
                    </div>
                  )}
                </div>

                {aiAdvice ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Seeds Column */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 bg-emerald-50 dark:bg-white/5 w-fit px-4 py-2 rounded-xl">
                        <Sprout size={18} className="text-emerald-500" /> {t('High-Potential Seeds')}
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {aiAdvice.seedRecommendations?.map((seed, i) => (
                          <div key={i} className="p-5 bg-white dark:bg-white/5 rounded-3xl border border-emerald-100 dark:border-white/10 shadow-sm hover:shadow-md transition-all group flex gap-5">
                            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-emerald-100 dark:bg-emerald-900/30 shrink-0 relative border-2 border-white dark:border-white/10">
                              {seedImages[seed.name] ? (
                                <img src={seedImages[seed.name]} alt={seed.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <Leaf className="text-emerald-500 absolute inset-0 m-auto" size={32} />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-black text-gray-800 dark:text-white text-lg tracking-tight">{seed.name}</div>
                              <p className="text-xs text-secondary mt-1 line-clamp-2 leading-relaxed">{seed.features}</p>
                              <div className="flex gap-2 mt-3">
                                <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-500/20">{seed.duration}</span>
                                <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-500/20">{seed.yieldPotential}</span>
                              </div>
                              <div className="mt-4 pt-3 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-[11px]">
                                <span className="font-bold text-gray-500 flex items-center gap-1.5"><MapPin size={12} className="text-emerald-500" /> {seed.storeType || 'Agro-stores'}</span>
                                <button
                                  onClick={() => window.open(`https://www.google.com/maps/search/agricultural+seed+stores+near+${farmFormData.district || 'me'}`, '_blank')}
                                  className="text-emerald-600 font-black hover:underline underline-offset-4"
                                >
                                  {t('See Locations')}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Insights Column */}
                    <div className="space-y-6">
                      <div className="p-8 bg-gradient-to-br from-emerald-600 to-green-700 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                          <TrendingUp size={120} />
                        </div>
                        <h4 className="font-black text-xl mb-6 flex items-center gap-3">
                          <TrendingUp /> {t('Yield Forecaster')}
                        </h4>
                        <div className="space-y-6 relative z-10">
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100/70 mb-2">{t('Estimated Production')}</div>
                            <div className="text-5xl font-black">{aiAdvice.yieldAnalysis?.estimatedYield}</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <p className="text-sm font-medium leading-relaxed italic">"{aiAdvice.yieldAnalysis?.benchmarks}"</p>
                          </div>
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100/70 mb-3">{t('Pro Dynamic Tips')}</div>
                            <ul className="space-y-2">
                              {aiAdvice.yieldAnalysis?.optimizationTips?.map((tip, i) => (
                                <li key={i} className="flex gap-3 text-sm font-bold items-start bg-black/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-emerald-300 mt-1"><CheckCircle2 size={16} /></span> {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-emerald-50 dark:bg-white/5 rounded-3xl border border-emerald-100 dark:border-white/10">
                        <h4 className="font-black text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
                          <Info size={18} /> {t('Market Context')}
                        </h4>
                        <p className="text-secondary text-sm font-medium leading-relaxed">{aiAdvice.marketContext}</p>
                      </div>
                    </div>
                  </div>
                ) : !JSON.parse(localStorage.getItem('user'))?.groqApiKey ? (
                  <div className="bg-amber-50/50 dark:bg-white/5 border-2 border-dashed border-amber-200 dark:border-white/10 rounded-[2rem] p-12 text-center">
                    <Brain size={48} className="mx-auto text-amber-300 mb-4" />
                    <h5 className="font-black text-gray-800 dark:text-white">{t('Personal API Key Required')}</h5>
                    <p className="text-secondary text-sm mt-2 max-w-xs mx-auto">
                      {t('To unlock personalized AI seed and yield advice, please add your Groq API key in the "AI" tab above.')}
                    </p>
                    <button
                      onClick={() => setActiveTab('ai')}
                      className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-700 transition-all"
                    >
                      {t('Go to AI Settings')}
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50/50 dark:bg-white/5 border-2 border-dashed border-emerald-200 dark:border-white/10 rounded-[2rem] p-12 text-center">
                    <Brain size={48} className="mx-auto text-emerald-300 mb-4" />
                    <h5 className="font-black text-gray-800 dark:text-white">{t('No recommendations yet')}</h5>
                    <p className="text-secondary text-sm mt-2 max-w-xs mx-auto">
                      {t('Fill in your farm details and save to unlock tailored AI insights for your crops.')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="kk-fade-in">
              <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-emerald-600">
                <MapPin size={24} /> {t('Location Settings')}
              </h2>
              <LocationUpdate
                currentLocation={profile?.location}
                onLocationUpdated={(updatedUser) => {
                  setProfile(updatedUser);
                  updateUser(updatedUser);
                }}
              />
            </div>
          )}

          {activeTab === 'password' && (
            <div className="kk-fade-in max-w-md mx-auto">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-emerald-600">
                <Lock size={24} /> {t('Reset Your Security')}
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <label className="form-label">{t('Current Password')}</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      required
                      className="form-input pr-12"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                    >
                      {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="form-label">{t('New Password')}</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      required
                      className="form-input pr-12"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="form-label">{t('Confirm New Password')}</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      required
                      className="form-input pr-12"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="button button-primary w-full">
                    <CheckCircle2 size={20} /> {t('Update Password')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="kk-fade-in">
              <h2 className="text-xl font-black mb-2 flex items-center gap-3 text-emerald-600">
                <Languages size={24} /> {t('Interface Language')}
              </h2>
              <p className="text-secondary mb-8 text-sm">
                {t('Select your preferred system language. All AI recommendations and reports will adapt instantly.')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => selectLanguage(language.code)}
                    className={"p-6 rounded-[24px] border-2 text-left transition-all relative overflow-hidden group " + (lang === language.code
                      ? 'bg-emerald-50 border-emerald-500 shadow-md dark:bg-emerald-900/20'
                      : 'bg-white/5 border-emerald-100 dark:border-white/10 hover:border-emerald-300')}
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{language.flag}</div>
                    <div className="text-lg font-black text-gray-900 dark:text-white">{language.nativeName}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm font-bold">{language.name}</div>

                    {lang === language.code && (
                      <div className="absolute top-4 right-4 text-emerald-600">
                        <CheckCircle2 size={24} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <p className="mt-8 text-xs text-muted flex items-center gap-2">
                <Info size={14} /> {t('Translations are synced with your local session.')}
              </p>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="kk-fade-in space-y-8">
              <div className="flex items-start gap-4 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
                  <Brain size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800 dark:text-white">{t('Personalize Your AI Experience')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                    {t('By adding your own Groq API key, you get a dedicated AI processing queue and faster response times.')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="form-group">
                    <label className="form-label flex items-center gap-2">
                      <Lock size={16} className="text-emerald-500" /> {t('Groq API Key')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.aiKey ? 'text' : 'password'}
                        className="form-input pr-12"
                        placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
                        value={formData.groqApiKey}
                        onChange={(e) => setFormData({ ...formData, groqApiKey: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, aiKey: !prev.aiKey }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                      >
                        {showPasswords.aiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium mt-2">
                      {t('Your key is encrypted and stored securely. We only use it to power your AI requests.')}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleProfileUpdate}
                      className="button button-primary w-full sm:w-auto min-w-[200px]"
                    >
                      <CheckCircle2 size={20} /> {t('Save API Key')}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-8 border border-gray-100 dark:border-white/10">
                  <h4 className="font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <Info size={18} className="text-emerald-500" /> {t('How to Get Your Key?')}
                  </h4>
                  <div className="space-y-4">
                    {[
                      { step: 1, text: 'Go to the Groq Console', link: 'https://console.groq.com/' },
                      { step: 2, text: 'Sign up or Login to your account' },
                      { step: 3, text: 'Click on "API Keys" in the sidebar' },
                      { step: 4, text: 'Create a new key and copy it here' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                          {item.step}
                        </div>
                        <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                          {item.link ? (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                              {t(item.text)}
                            </a>
                          ) : t(item.text)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                    <p className="text-[11px] font-black text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <AlertCircle size={14} /> {t('Free Tier Available')}
                    </p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-500/80 font-medium mt-1">
                      {t('Groq offers a generous free tier for developers and individual users.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPhotoModal && profile?.profilePhoto?.url && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/95 backdrop-blur-xl animate-[kkFadeIn_0.3s_ease]"
          onClick={closePhotoModal}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={closePhotoModal}
              className="absolute top-0 right-0 p-3 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full z-[110]"
            >
              <X size={32} />
            </button>
            <img
              src={profile.profilePhoto.url}
              alt="Profile Full"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(16,185,129,0.3)] animate-[kkScaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
