import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LocationPromptModal = ({ onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    const handleUpdateLocation = () => {
        navigate('/profile?tab=location');
        onClose();
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slideUp border-4 border-green-500">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 rounded-t-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="text-4xl animate-bounce">📍</div>
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                📍 {t('Update Your Location')}
                            </h3>
                            <p className="text-green-100 text-sm mt-1">
                                {t('Keep your location up to date for every session')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm text-blue-900 font-semibold mb-2">🎯 {t('Why set your location?')}</p>
                                    <ul className="mt-2 text-sm text-blue-800 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 font-bold">✓</span>
                                            <span><strong>{t('Weather forecasts')}</strong> - {t('Get accurate weather data for your farm')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 font-bold">✓</span>
                                            <span><strong>{t('Find agronomists')}</strong> - {t('Connect with experts in your district')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 font-bold">✓</span>
                                            <span><strong>{t('Local advisories')}</strong> - {t('Receive farming tips for your area')}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 rounded-r-lg shadow-sm">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm text-yellow-900">
                                    <span className="font-bold">{t('Reminder:')} </span>
                                    {t('Please update your location to ensure you receive accurate weather forecasts, local advisories, and the right agronomist recommendations.')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleUpdateLocation}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {t('Update Location Now')}
                        </button>
                        <button
                            onClick={handleSkip}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                        >
                            {t('Skip')}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-fadeIn  { animation: fadeIn  0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
        </div>
    );
};

export default LocationPromptModal;
