import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const STORAGE_KEY = 'appLanguage';

const LanguageGuard = ({ children }) => {
  const { hasChosen, selectLanguage, SUPPORTED_LANGUAGES, translating } = useLanguage();
  const [selecting, setSelecting] = useState(false);

  // The last chosen language (from localStorage) — shown highlighted in the modal
  const previousLang = localStorage.getItem(STORAGE_KEY) || null;

  const handleSelect = async (code) => {
    setSelecting(true);
    selectLanguage(code);
    // small delay so the spinner is visible before the app re-renders
    await new Promise(r => setTimeout(r, 300));
    setSelecting(false);
  };

  if (!hasChosen) {
    const isReturningUser = !!previousLang;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 p-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          .lang-card { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
          .lang-card:hover { transform: translateY(-4px) scale(1.02); }
          .lang-card-prev { border-color: #16a34a !important; background: linear-gradient(135deg,#f0fdf4,#dcfce7) !important; }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(32px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .lang-panel { animation: fadeSlideUp 0.5s ease-out both; }
          @keyframes spin360 { to { transform: rotate(360deg); } }
          .spin { animation: spin360 0.9s linear infinite; }
        `}</style>

        {/* Background grain texture overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />

        <div className="lang-panel relative z-10 bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          style={{ fontFamily: 'Inter, sans-serif' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
              backgroundSize: '12px 12px',
            }} />
            <div className="relative z-10">
              <div className="text-6xl mb-3 animate-bounce">🌾</div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Krishi Kavach
              </h1>
              <p className="mt-2 text-green-100 text-sm font-medium">
                Crop Disease Detection Platform
              </p>
            </div>
          </div>

          {/* Language selection */}
          <div className="px-8 py-8">
            <div className="text-center mb-7">
              <h2 className="text-xl font-bold text-gray-900">
                {isReturningUser ? '🌐 Confirm Your Language' : 'Choose Your Language'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                अपनी भाषा चुनें &nbsp;•&nbsp; आपली भाषा निवडा
              </p>
              {isReturningUser ? (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 border border-green-300 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Select to continue &nbsp;·&nbsp; भाषा चुनें &nbsp;·&nbsp; भाषा निवडा
                </div>
              ) : (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Required &nbsp;·&nbsp; अनिवार्य &nbsp;·&nbsp; आवश्यक
                </div>
              )}
            </div>

            <div className="space-y-4">
              {SUPPORTED_LANGUAGES.map((language) => {
                const isPrev = language.code === previousLang;
                return (
                  <button
                    key={language.code}
                    onClick={() => handleSelect(language.code)}
                    disabled={selecting}
                    className={`lang-card w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left disabled:opacity-60 disabled:cursor-not-allowed shadow-sm ${isPrev
                        ? 'lang-card-prev hover:shadow-xl'
                        : 'border-gray-100 hover:border-green-400 hover:bg-green-50 bg-gray-50 hover:shadow-lg'
                      }`}
                  >
                    <span className="text-4xl">{language.flag}</span>
                    <div className="flex-1">
                      <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {language.nativeName}
                        {isPrev && (
                          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            Last used
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {language.name}
                      </div>
                    </div>
                    {isPrev && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              You can change your language anytime from your Profile → 🌐 Language tab.
              <br />आप प्रोफ़ाइल में जाकर भाषा बदल सकते हैं।
            </p>
          </div>
        </div>

        {/* Full-screen loading spinner after selection */}
        {selecting && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl px-8 py-6 flex items-center gap-4 shadow-2xl">
              <svg className="spin w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-gray-700 font-semibold text-lg">Loading…</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dim overlay while translations are loading after language switch
  if (translating) {
    return (
      <div className="relative">
        {children}
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl px-8 py-5 flex items-center gap-4 shadow-2xl border border-gray-100">
            <svg className="spin w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-gray-700 font-medium">Translating UI…</span>
          </div>
        </div>
        <style>{`@keyframes spin360 { to { transform: rotate(360deg); } } .spin { animation: spin360 0.9s linear infinite; }`}</style>
      </div>
    );
  }

  return children;
};

export default LanguageGuard;
