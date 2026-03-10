import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const Farmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.listFarmers();
      setFarmers(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch farmers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (farmerId) => {
    if (!window.confirm('Are you sure you want to delete this farmer account?')) return;
    try {
      setDeletingId(farmerId);
      await adminAPI.deleteFarmer(farmerId);
      await fetchFarmers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete farmer');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-3xl">👨‍🌾</div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Farmers Management</h1>
              <p className="text-gray-400 text-sm mt-0.5">View and manage all registered farmer accounts</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
            ⚠️ <span>{error}</span>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600/80 to-green-700/80 px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-3">
                <span>👨‍🌾</span>
                <span>All Farmers</span>
                <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full font-bold">{farmers.length}</span>
              </h2>
              <button onClick={fetchFarmers}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 text-sm">
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {farmers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👨‍🌾</div>
                <p className="text-gray-400 font-semibold text-lg">No farmers registered yet.</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    {['Name', 'Mobile Number', 'District', 'Taluka', 'Language', 'Actions'].map(h => (
                      <th key={h} className={`px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {farmers.map((farmer) => (
                    <tr key={farmer._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-extrabold shadow">
                            {farmer.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-white">{farmer.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">📞 {farmer.mobileNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{farmer.address?.district ? `📍 ${farmer.address.district}` : <span className="text-gray-600">—</span>}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{farmer.address?.taluka || <span className="text-gray-600">—</span>}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
                          {farmer.language || 'en'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button onClick={() => handleDelete(farmer._id)} disabled={deletingId === farmer._id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                          {deletingId === farmer._id ? (
                            <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Deleting…</>
                          ) : (
                            <>🗑️ Delete</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Farmers;
