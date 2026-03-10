import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Unauthorized = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('Unauthorized Access')}</h2>
        <p className="text-gray-600 mb-8">{t("You don't have permission to access this page.")}</p>
        <Link
          to="/"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md"
        >
          {t('Go Home')}
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;









