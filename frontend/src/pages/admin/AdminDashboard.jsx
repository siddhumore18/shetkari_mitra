import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ farmers: '—', agronomists: '—', pending: '—' });
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [fRes, aRes, alertRes] = await Promise.all([
          adminAPI.listFarmers?.().catch(() => null),
          adminAPI.listAgronomists?.().catch(() => null),
          adminAPI.getOutbreakAlerts?.().catch(() => null),
        ]);
        setCounts({
          farmers: fRes?.data?.length ?? '—',
          agronomists: aRes?.data?.length ?? '—',
          pending: aRes?.data?.filter(a => !a.isVerified)?.length ?? '—',
        });
        setAlerts(alertRes?.data ?? []);
      } catch { /* silent */ } finally {
        setLoadingAlerts(false);
      }
    };
    loadCounts();
  }, []);

  const adminCards = [
    { to: '/admin/farmers', icon: '👨‍🌾', title: 'Farmers', description: 'View and manage all registered farmer accounts.', gradient: 'from-emerald-500 to-green-600', stat: counts.farmers, statLabel: 'Total Farmers' },
    { to: '/admin/agronomists', icon: '🔬', title: 'Agronomists', description: 'Verify agronomist accounts and manage professional registrations.', gradient: 'from-blue-500 to-indigo-600', stat: counts.agronomists, statLabel: 'Total Agronomists' },
    { to: '/admin/facilities', icon: '🏭', title: 'Facilities', description: 'Manage Ginning Mills, Warehouses, and Processing Centers.', gradient: 'from-orange-500 to-red-600', statLabel: 'System Verified' },
    { to: '/admin/seeds', icon: '🌱', title: 'Seeds', description: 'Manage verified seeds for better yield recommendations.', gradient: 'from-teal-500 to-emerald-600', statLabel: 'Verified Quality' },
    { to: '/admin/fertilizers', icon: '🧪', title: 'Fertilizers', description: 'Manage verified fertilizers and chemical inputs.', gradient: 'from-purple-500 to-pink-600', statLabel: 'Expert Approved' },
  ];

  const quickStats = [
    { icon: '✅', label: 'System Status', value: 'All Operational', color: 'text-emerald-500' },
    { icon: '⏳', label: 'Pending Verifications', value: counts.pending, color: 'text-amber-500' },
    { icon: '📅', label: 'Last Updated', value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">

      {/* ── Admin Banner ── */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-slate-700 via-gray-800 to-slate-700 text-white shadow-2xl">
        <div className="absolute top-0 right-0 text-[160px] leading-none opacity-5 select-none -mt-4 -mr-4">🛡️</div>
        <CardContent className="p-8">
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/20 shrink-0">🛡️</div>
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Administrator</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1 max-w-lg">Manage farmers, verify agronomists, and monitor platform health.</p>
              </div>
            </div>
            <Badge className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 text-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((s, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="text-3xl">{s.icon}</div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-extrabold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Management Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {adminCards.map((card) => (
          <Link key={card.to} to={card.to} className="group">
            <Card className="h-full bg-card border-border hover:border-emerald-500/50 hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer">
              <div className={`h-1.5 bg-gradient-to-r ${card.gradient}`} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  {card.stat !== undefined && (
                    <div className="text-right">
                      <p className="text-3xl font-extrabold text-foreground">{card.stat}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{card.statLabel}</p>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-foreground mb-1">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{card.description}</p>
                <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm group-hover:gap-3 transition-all">
                  Manage {card.title}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── Disease Outbreak Alerts ── */}
      <Card className={`border-border ${alerts.length > 0 ? 'border-red-500/50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${alerts.length > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-muted'}`}>🚨</span>
              Disease Outbreak Alerts
            </CardTitle>
            {alerts.length > 0 && (
              <Badge variant="destructive" className="uppercase tracking-widest text-[10px] font-black">Action Required</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingAlerts ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="w-6 h-6 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground font-bold">Scanning for outbreaks...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground font-medium">No outbreaks detected in the last 14 days.</p>
              <p className="text-xs text-muted-foreground mt-1">Platform monitor is active and stable.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert, idx) => (
                <Card key={idx} className="bg-red-500/5 border-red-500/20 hover:bg-red-500/10 transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">High Risk Hotspot</p>
                        <h4 className="text-lg font-extrabold text-foreground">{alert._id.disease}</h4>
                      </div>
                      <div className="bg-red-500/20 text-red-500 font-black text-xl px-3 py-1 rounded-xl">{alert.count}</div>
                    </div>
                    <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">📍 {alert._id.district} District</p>
                    <div className="space-y-1 mb-4">
                      <p className="text-xs text-muted-foreground">Affected Farmers: {alert.farmers.join(', ')}</p>
                      <p className="text-xs text-muted-foreground">Last Detected: {new Date(alert.lastDetected).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        const message = `URGENT: Disease Outbreak Alert\nDisease: ${alert._id.disease}\nDistrict: ${alert._id.district}\nAffected Farmers: ${alert.count}\nDetected on: ${new Date(alert.lastDetected).toLocaleDateString()}\n\nPlease take immediate control measures.`;
                        window.open(`mailto:officer@agriculture.gov.in?subject=Disease Alert: ${alert._id.disease} in ${alert._id.district}&body=${encodeURIComponent(message)}`);
                      }}
                      className="w-full bg-red-500/10 border border-red-500/30 text-red-500 group-hover:bg-red-500 group-hover:text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                    >
                      🚀 Notify Government Officer
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
