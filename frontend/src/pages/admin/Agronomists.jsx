import { useState, useEffect } from 'react';
import { adminAPI, agronomistAPI } from '../../services/api';

const Agronomists = () => {
  const [agronomists, setAgronomists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);

  useEffect(() => {
    fetchAgronomists();
  }, []);

  const fetchAgronomists = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.listAgronomists();
      setAgronomists(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch agronomists');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (profileId, status) => {
    try {
      setStatusUpdating(profileId + status);
      await agronomistAPI.verifyAgronomist(profileId, status);
      await fetchAgronomists();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update agronomist status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!userId) {
      setError('Agronomist account missing user reference.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this agronomist account?')) return;
    try {
      setDeletingId(userId);
      await adminAPI.deleteAgronomist(userId);
      await fetchAgronomists();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete agronomist');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      verified: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
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
            <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-3xl">🔬</div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Agronomists Management</h1>
              <p className="text-gray-400 text-sm mt-0.5">Verify, approve, and manage all agronomist accounts</p>
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
          <div className="bg-gradient-to-r from-blue-600/80 to-indigo-700/80 px-6 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-3">
                <span>🔬</span>
                <span>All Agronomists</span>
                <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full font-bold">{agronomists.length}</span>
              </h2>
              <button onClick={fetchAgronomists}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 text-sm">
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {agronomists.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔬</div>
                <p className="text-gray-400 font-semibold text-lg">No agronomists registered yet.</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    {['Name', 'Mobile', 'Qualification', 'Experience', 'Status', 'ID Proof', 'Actions'].map(h => (
                      <th key={h} className={`px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {agronomists.map((agronomist) => (
                    <tr key={agronomist._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-extrabold shadow">
                            {(agronomist.user?.fullName || agronomist.fullName)?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-white">
                            {agronomist.user?.fullName || agronomist.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">📞 {agronomist.user?.mobileNumber || agronomist.mobileNumber}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">{agronomist.qualification || <span className="text-gray-600">—</span>}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">{agronomist.experience || 0} yrs</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${agronomist.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            agronomist.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                          {agronomist.status === 'verified' ? '✓' : agronomist.status === 'rejected' ? '✗' : '⏳'} {agronomist.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm">
                        {agronomist.idProof?.url ? (
                          <button onClick={() => setViewingDocument(agronomist.idProof)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-xl font-semibold transition-colors text-xs">
                            👁️ {agronomist.idProof?.contentType === 'application/pdf' ? 'View PDF' : 'View Image'}
                          </button>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {agronomist.status !== 'verified' && (
                            <button onClick={() => handleStatusChange(agronomist._id, 'verified')}
                              disabled={statusUpdating === agronomist._id + 'verified'}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold transition-colors disabled:opacity-50 text-xs">
                              {statusUpdating === agronomist._id + 'verified' ? '…' : '✓ Approve'}
                            </button>
                          )}
                          {agronomist.status !== 'rejected' && (
                            <button onClick={() => handleStatusChange(agronomist._id, 'rejected')}
                              disabled={statusUpdating === agronomist._id + 'rejected'}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-xl font-bold transition-colors disabled:opacity-50 text-xs">
                              {statusUpdating === agronomist._id + 'rejected' ? '…' : '✗ Reject'}
                            </button>
                          )}
                          <button onClick={() => handleDelete(agronomist.user?._id)}
                            disabled={deletingId === agronomist.user?._id}
                            className="inline-flex items-center gap-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-bold transition-colors disabled:opacity-50 text-xs">
                            {deletingId === agronomist.user?._id ? '…' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewingDocument(null)}>
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-gray-900 text-white px-6 py-4 flex justify-between items-center rounded-t-3xl">
              <h3 className="text-lg font-extrabold">
                📄 {viewingDocument.contentType === 'application/pdf' ? 'ID Proof — PDF' : 'ID Proof — Image'}
              </h3>
              <button onClick={() => setViewingDocument(null)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/20 text-2xl transition-colors">×</button>
            </div>
            <div className="p-6">
              {viewingDocument.contentType === 'application/pdf' ? (
                <object data={`${viewingDocument.url}#toolbar=1`} type="application/pdf" className="w-full h-[75vh] border-0 rounded-2xl" title="PDF Viewer">
                  <a href={viewingDocument.url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">
                    ⬇️ Download PDF
                  </a>
                </object>
              ) : (
                <div className="flex justify-center">
                  <img src={viewingDocument.url} alt="ID Proof" className="max-w-full max-h-[75vh] rounded-2xl object-contain shadow-lg" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agronomists;
