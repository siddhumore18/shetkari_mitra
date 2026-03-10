import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  AlertTriangle,
  Smartphone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  Flag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(mobileNumber, password);
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      navigate(user.role === 'admin' ? '/admin' : user.role === 'farmer' ? '/farmer' : '/agronomist');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${isDark
      ? 'bg-gradient-to-br from-[#0a0f1e] via-[#1e1b4b] to-[#0f2417]'
      : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100'
      }`}>
      {/* Background decorations */}
      <div className={`absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 ${isDark ? 'bg-indigo-500/10' : 'bg-emerald-200/30'}`} />
      <div className={`absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 ${isDark ? 'bg-emerald-500/10' : 'bg-teal-200/30'}`} />

      <div className="relative max-w-md w-full">
        {/* Logo above card */}
        <div className="text-center mb-6">
          <div className="inline-flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-300/50">
              <Sprout size={40} className="text-white" />
            </div>
            <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>Krishi Kavach</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Crop Shield for India's Farmers</p>
          </div>
        </div>

        {/* Card */}
        <div className={`rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#0f172a] border border-white/10' : 'bg-white border border-gray-100'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-center">
            <h2 className="text-2xl font-extrabold text-white">{t('Sign in to your account')}</h2>
            <p className="text-emerald-100 text-sm mt-1">Welcome back! Enter your credentials to continue.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobileNumber" className={`block text-sm font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Smartphone size={16} /> {t('Mobile Number')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className={`font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>+91</span>
                </div>
                <input id="mobileNumber" name="mobileNumber" type="tel" required
                  value={mobileNumber} onChange={e => setMobileNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                  className={`block w-full pl-14 pr-4 py-3.5 border-2 rounded-2xl outline-none transition-all ${isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    : 'border-gray-200 text-gray-800 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400'
                    }`} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={`block text-sm font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <Lock size={16} /> {t('Password')}
              </label>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`block w-full pl-4 pr-12 py-3.5 border-2 rounded-2xl outline-none transition-all ${isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    : 'border-gray-200 text-gray-800 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400'
                    }`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition-colors">
                  {showPassword
                    ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-emerald-300/60 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-3 text-base">
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>{t('Sign In')} <ArrowRight size={18} className="inline ml-1" /></>
              )}
            </button>

            {/* Register link */}
            <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t("Don't have an account?")}{' '}
              <Link to="/register" className="font-extrabold text-emerald-500 hover:text-emerald-400 transition-colors">
                {t('Register')}
              </Link>
            </p>
          </form>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: ShieldCheck, color: 'text-emerald-500', label: 'Secure Login' },
            { icon: Sprout, color: 'text-emerald-600', label: 'For Farmers' },
            { icon: Flag, color: 'text-orange-500', label: 'Made in India' },
          ].map((item, i) => (
            <div key={i} className={`backdrop-blur rounded-2xl py-3 px-2 shadow-sm ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/70 border border-white'}`}>
              <div className="flex justify-center mb-1">
                <item.icon size={24} className={item.color} />
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
