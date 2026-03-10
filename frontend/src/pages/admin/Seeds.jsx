import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Plus, Trash2, Tag, Info, Building, X } from 'lucide-react';
import { motion } from 'framer-motion';
import MultiImageUpload from '../../components/MultiImageUpload';

const Seeds = () => {
  const [seeds, setSeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', type: 'Cotton', variety: '', description: '', price: '', unit: 'kg', company: '', images: []
  });

  useEffect(() => {
    fetchSeeds();
  }, []);

  const fetchSeeds = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.listSeeds();
      setSeeds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = { ...formData };
      if (submissionData.type === 'Other' && formData.customType) {
        submissionData.type = formData.customType;
      }
      await adminAPI.addSeed(submissionData);
      setShowModal(false);
      fetchSeeds();
      setFormData({ name: '', type: 'Cotton', variety: '', description: '', price: '', unit: 'kg', company: '', images: [] });
    } catch (err) {
      alert("Error adding seed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this seed?")) return;
    try {
      await adminAPI.deleteSeed(id);
      fetchSeeds();
    } catch (err) {
      alert("Error deleting");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Seed Management</h1>
            <p className="text-gray-400">Manage verified seeds for recommendations</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-teal-600/20 transition-all"
          >
            <Plus size={20} /> Add Seed
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-3xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {seeds.map(s => (
              <div key={s._id} className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center">
                    🌱
                  </div>
                  <button onClick={() => handleDelete(s._id)} className="text-gray-500 hover:text-red-400 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
                {s.images?.[0] && <img src={s.images[0]} className="w-full h-32 object-cover rounded-xl mb-4" alt={s.name} />}
                <h3 className="text-lg font-bold text-white mb-1">{s.name}</h3>
                <p className="text-xs text-teal-500 font-bold uppercase mb-3">{s.type} • {s.variety}</p>
                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{s.description}</p>
                <div className="mt-auto flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-xs">
                    <p className="text-gray-500 uppercase font-black tracking-tighter">Price</p>
                    <p className="text-white font-bold">₹{s.price}/{s.unit}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-gray-500 uppercase font-black tracking-tighter">Company</p>
                    <p className="text-white font-bold truncate max-w-[80px]">{s.company || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-4xl w-full shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Seed</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Section: Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Seed Name</label>
                    <input className="kk-input w-full" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Crop Type</label>
                      <select 
                        className="kk-input w-full" 
                        value={formData.type} 
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option>Cotton</option>
                        <option>Grapes</option>
                        <option>Sugarcane</option>
                        <option>Soybean</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Variety</label>
                      <input className="kk-input w-full" value={formData.variety} onChange={e => setFormData({ ...formData, variety: e.target.value })} />
                    </div>
                  </div>

                  {formData.type === 'Other' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="block text-xs font-bold text-emerald-400 uppercase mb-2">Specify Crop Type</label>
                      <input 
                        className="kk-input w-full border-emerald-500/30" 
                        placeholder="e.g. Tomato"
                        onChange={e => setFormData({ ...formData, customType: e.target.value })}
                      />
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Price</label>
                      <input type="number" className="kk-input w-full" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Unit</label>
                      <input className="kk-input w-full" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Company</label>
                    <input className="kk-input w-full" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                  </div>
                </div>

                {/* Right Section: Media & Description */}
                <div className="space-y-4">
                  <MultiImageUpload 
                    images={formData.images} 
                    setImages={(urls) => setFormData({ ...formData, images: urls })} 
                    label="Seed Photos" 
                  />

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                    <textarea 
                      className="kk-input w-full h-32" 
                      placeholder="Enter seed characteristics, growth period, etc."
                      value={formData.description} 
                      onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-white/10 text-gray-400 rounded-2xl font-bold hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20">Save Seed</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seeds;
