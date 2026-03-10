import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelection = () => {
  const { i18n, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  ];

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem('appLanguage', langCode);
    // Reload the page to apply language to all components
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🌾 {t('languageSelection.title')}
          </h1>
          <p className="text-gray-600">
            {t('languageSelection.subtitle')}
          </p>
        </div>
        
        <div className="space-y-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full py-4 px-6 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedLanguage === lang.code
                  ? 'border-green-600 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    {lang.nativeName}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {lang.name}
                  </div>
                </div>
                {selectedLanguage === lang.code && (
                  <div className="text-green-600 text-2xl">✓</div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {t('languageSelection.changeLater')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;

