import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Plus, Trash2, Beaker, X } from 'lucide-react';
import { motion } from 'framer-motion';
import MultiImageUpload from '../../components/MultiImageUpload';

const Fertilizers = () => {
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', type: 'Organic', components: '', description: '', price: '', unit: 'kg', company: '', images: []
  });

  useEffect(() => {
    fetchFertilizers();
  }, []);

  const fetchFertilizers = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.listFertilizers();
      setFertilizers(data);
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
      if (submissionData.cropType === 'Other' && formData.customCropType) {
        submissionData.cropType = formData.customCropType;
      }
      await adminAPI.addFertilizer(submissionData);
      setShowModal(false);
      fetchFertilizers();
      setFormData({ name: '', type: 'Organic', cropType: 'Cotton', components: '', description: '', price: '', unit: 'kg', company: '', images: [] });
    } catch (err) {
      alert("Error adding fertilizer");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fertilizer?")) return;
    try {
      await adminAPI.deleteFertilizer(id);
      fetchFertilizers();
    } catch (err) {
      alert("Error deleting");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Fertilizer Management</h1>
            <p className="text-gray-400">Manage verified fertilizers and chemical inputs</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
          >
            <Plus size={20} /> Add Fertilizer
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-3xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {fertilizers.map(f => (
              <div key={f._id} className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
                    <Beaker size={20} />
                  </div>
                  <button onClick={() => handleDelete(f._id)} className="text-gray-500 hover:text-red-400 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
                {f.images?.[0] && <img src={f.images[0]} className="w-full h-32 object-cover rounded-xl mb-4" alt={f.name} />}
                <h3 className="text-lg font-bold text-white mb-1">{f.name}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold border border-purple-500/20 uppercase">{f.type}</span>
                  {f.cropType && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20 uppercase">{f.cropType}</span>}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{f.description}</p>
                <div className="mt-auto flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                   <div className="text-xs">
                      <p className="text-gray-500 uppercase font-black tracking-tighter">Price</p>
                      <p className="text-white font-bold">₹{f.price}/{f.unit}</p>
                   </div>
                   <div className="text-right text-xs">
                      <p className="text-gray-500 uppercase font-black tracking-tighter">Company</p>
                      <p className="text-white font-bold truncate max-w-[80px]">{f.company || '—'}</p>
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
              <h2 className="text-2xl font-bold text-white">Add New Fertilizer</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Section: Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Name</label>
                    <input className="kk-input w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Fertilizer Type</label>
                      <select className="kk-input w-full" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option>Organic</option><option>Nitrogenous</option><option>Phosphatic</option><option>Potassic</option><option>Micronutrient</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Target Crop</label>
                      <select className="kk-input w-full" value={formData.cropType} onChange={e => setFormData({...formData, cropType: e.target.value})}>
                        <option>General</option><option>Cotton</option><option>Grapes</option><option>Sugarcane</option><option>Soybean</option><option>Other</option>
                      </select>
                    </div>
                  </div>

                  {formData.cropType === 'Other' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="block text-xs font-bold text-emerald-400 uppercase mb-2">Specify Crop Type</label>
                      <input 
                        className="kk-input w-full border-emerald-500/30" 
                        placeholder="e.g. Tomato"
                        onChange={e => setFormData({ ...formData, customCropType: e.target.value })}
                      />
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Components</label>
                    <input className="kk-input w-full" placeholder="e.g. NPK 10:26:26" value={formData.components} onChange={e => setFormData({...formData, components: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Price</label>
                      <input type="number" className="kk-input w-full" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Unit</label>
                      <input className="kk-input w-full" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Company</label>
                    <input className="kk-input w-full" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                  </div>
                </div>

                {/* Right Section: Media */}
                <div className="space-y-4">
                  <MultiImageUpload images={formData.images} setImages={(urls) => setFormData({...formData, images: urls})} label="Fertilizer Photos" />

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                    <textarea 
                      className="kk-input w-full h-32" 
                      placeholder="Usage instructions, benefits, etc."
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-white/10 text-gray-400 rounded-2xl font-bold hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20">Save Fertilizer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fertilizers;
