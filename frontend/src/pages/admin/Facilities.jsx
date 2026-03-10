import { useState, useEffect, useRef } from 'react';
import { adminAPI, marketAPI } from '../../services/api';
import { Plus, Trash2, MapPin, Phone, Building2, Image as ImageIcon, ChevronLeft, ChevronRight, Table as TableIcon, Globe, Map as MapIcon, X, RefreshCcw, Edit2 } from 'lucide-react';
import MultiImageUpload from '../../components/MultiImageUpload';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lng, e.latlng.lat]);
    },
  });
  return position ? <Marker position={[position[1], position[0]]} /> : null;
};

const JsonEditorModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [json, setJson] = useState(JSON.stringify(initialData || [], null, 2));
  const [err, setErr] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      const parsed = JSON.parse(json);
      onSave(parsed);
      onClose();
    } catch (e) {
      setErr('Invalid JSON format. Please check your syntax.');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }
      `}</style>
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <TableIcon className="text-emerald-400" size={20} />
            <h2 className="text-xl font-bold text-white">Edit Market Prices</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">JSON Format: <code className="bg-white/5 px-1 rounded">{'[{"crop": "Name", "price": 0, "unit": "kg"}]'}</code></p>
          <textarea
            className="kk-input w-full h-[300px] font-mono text-sm leading-relaxed border-white/5 focus:border-emerald-500/50"
            placeholder='[
  {
    "crop": "Cotton",
    "price": 7200,
    "unit": "quintal"
  }
]'
            value={json}
            onChange={(e) => {
              setJson(e.target.value);
              setErr('');
            }}
          />
          {err && <p className="text-red-400 text-[10px] mt-2 font-bold">{err}</p>}
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 px-6 py-3 border border-white/10 text-gray-400 rounded-2xl font-bold hover:bg-white/5">Cancel</button>
          <button onClick={handleSave} className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const Facilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Ginning Mill',
    city: '',
    contact: '',
    website: '',
    location: { type: 'Point', coordinates: [74.26, 16.65] },
    images: [],
    marketPrices: []
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.listFacilities();
      setFacilities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerScrape = async () => {
    try {
      setScraping(true);
      await marketAPI.triggerScrape();
      alert("Manual scrape triggered! Facilities and prices are being updated in the background.");
      fetchFacilities();
    } catch (err) {
      alert("Error triggering scrape");
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedFacility && showModal) {
        await adminAPI.updateFacility(selectedFacility._id, formData);
      } else {
        await adminAPI.addFacility(formData);
      }
      setShowModal(false);
      fetchFacilities();
      resetForm();
    } catch (err) {
      alert("Error saving facility");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', type: 'Ginning Mill', city: '', contact: '', website: '',
      location: { type: 'Point', coordinates: [74.26, 16.65] },
      images: [], marketPrices: []
    });
    setSelectedFacility(null);
  };

  const handleUpdatePrices = async (id, marketPrices) => {
    try {
      await adminAPI.updateFacility(id, { marketPrices });
      fetchFacilities();
    } catch (err) {
      alert("Error updating prices");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this facility?")) return;
    try {
      await adminAPI.deleteFacility(id);
      fetchFacilities();
    } catch (err) {
      alert("Error deleting");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Facility Management</h1>
            <p className="text-gray-400">Manage Ginning Mills, Processing Centers, and Warehouses</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleTriggerScrape}
              disabled={scraping}
              className="px-6 py-3 bg-white/5 border border-white/10 text-emerald-400 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <RefreshCcw size={20} className={scraping ? 'animate-spin' : ''} />
              {scraping ? 'Updating...' : 'Sync Data'}
            </button>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-600/20 transition-all"
            >
              <Plus size={20} /> Add Facility
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-3xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {facilities.map(f => (
              <div key={f._id} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur flex flex-col group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center">
                    <Building2 size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedFacility(f);
                        setFormData({
                          name: f.name,
                          type: f.type,
                          city: f.city,
                          contact: f.contact,
                          website: f.website,
                          location: f.location,
                          images: f.images || [],
                          marketPrices: f.marketPrices || []
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-400 hover:bg-blue-400/10 p-2 rounded-xl transition-all"
                      title="Edit Details"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFacility(f);
                        setShowPriceModal(true);
                      }}
                      className="text-emerald-400 hover:bg-emerald-400/10 p-2 rounded-xl transition-all"
                      title="Edit Prices JSON"
                    >
                      <TableIcon size={18} />
                    </button>
                    <button onClick={() => handleDelete(f._id)} className="text-gray-500 hover:text-red-400 p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{f.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{f.type}</p>
                <div className="space-y-2 text-sm text-gray-300">
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-emerald-500" /> {f.city}</p>
                  <p className="flex items-center gap-2"><Phone size={14} className="text-blue-500" /> {f.contact || 'N/A'}</p>
                  {f.website && (
                    <a href={f.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-400 hover:underline">
                      <Globe size={14} /> Website
                    </a>
                  )}
                </div>

                {/* Price Preview */}
                {f.marketPrices?.length > 0 && (
                  <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Live Rates</p>
                    <div className="space-y-1">
                      {f.marketPrices.slice(0, 2).map((p, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-400">{p.crop}</span>
                          <span className="text-emerald-400 font-bold">₹{p.price}/{p.unit}</span>
                        </div>
                      ))}
                      {f.marketPrices.length > 2 && <p className="text-[10px] text-gray-500 text-center mt-1">+{f.marketPrices.length - 2} more</p>}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Images: {f.images?.length || 0}</span>
                  <span className="text-xs text-gray-500 font-bold bg-white/5 px-2 py-1 rounded-lg">
                    {f.source}
                  </span>
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
              <h2 className="text-xl font-bold text-white">{selectedFacility ? 'Edit Facility' : 'Add New Facility'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Facility Name</label>
                    <input
                      className="kk-input w-full"
                      placeholder="e.g. Royal Ginning Mill"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Type</label>
                    <select
                      className="kk-input w-full"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option>Ginning Mill</option>
                      <option>Processing Center</option>
                      <option>Warehouse</option>
                      <option>Agri Market</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">City</label>
                      <input
                        className="kk-input w-full"
                        placeholder="e.g. Sangli"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Contact</label>
                      <input
                        className="kk-input w-full"
                        placeholder="Phone number"
                        value={formData.contact}
                        onChange={e => setFormData({ ...formData, contact: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Website Link</label>
                    <input
                      className="kk-input w-full"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-gray-400 uppercase">Location Coordinates</label>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(!showMapPicker)}
                      className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1 hover:underline"
                    >
                      <MapIcon size={12} /> {showMapPicker ? 'Hide Map' : 'Pick from Map'}
                    </button>
                  </div>

                  {showMapPicker && (
                    <div className="h-48 rounded-2xl overflow-hidden border border-white/10 relative">
                      <MapContainer center={[formData.location.coordinates[1], formData.location.coordinates[0]]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker position={formData.location.coordinates} setPosition={(coords) => setFormData({ ...formData, location: { ...formData.location, coordinates: coords } })} />
                      </MapContainer>
                      <div className="absolute top-2 right-2 z-[400] bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-[8px] text-white">Click map to set location</div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase mb-1">Longitude</label>
                      <input
                        type="number" step="0.000001"
                        className="kk-input w-full text-sm"
                        value={formData.location.coordinates[0]}
                        onChange={e => setFormData({
                          ...formData,
                          location: { ...formData.location, coordinates: [parseFloat(e.target.value), formData.location.coordinates[1]] }
                        })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase mb-1">Latitude</label>
                      <input
                        type="number" step="0.000001"
                        className="kk-input w-full text-sm"
                        value={formData.location.coordinates[1]}
                        onChange={e => setFormData({
                          ...formData,
                          location: { ...formData.location, coordinates: [formData.location.coordinates[0], parseFloat(e.target.value)] }
                        })}
                        required
                      />
                    </div>
                  </div>

                  <MultiImageUpload images={formData.images} setImages={(urls) => setFormData({ ...formData, images: urls })} label="Facility Photos" />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-6 py-3 border border-white/10 text-gray-400 rounded-2xl font-bold hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">Save Facility</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPriceModal && selectedFacility && (
        <JsonEditorModal
          isOpen={showPriceModal}
          onClose={() => setShowPriceModal(false)}
          initialData={selectedFacility.marketPrices}
          onSave={(data) => handleUpdatePrices(selectedFacility._id, data)}
        />
      )}
    </div>
  );
};

export default Facilities;
