import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, MessageSquare } from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute';
import AppSidebar from './components/AppSidebar';
import AIChatbot from './components/AIChatbot';
import FarmInfoModal from './components/FarmInfoModal';
import ChatDrawer from './components/ChatDrawer';
import { useSidebar } from './context/SidebarContext';
import { useAuth } from './context/AuthContext';
import { cn } from './lib/utils';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import UserProfile from './pages/UserProfile';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import CropManagement from './pages/farmer/Crops';
import DiseaseReports from './pages/farmer/DiseaseReports';
import Weather from './pages/farmer/Weather';
import Market from './pages/farmer/Market';
import SupplyChainDashboard from './pages/farmer/SupplyChainDashboard';
import Schemes from './pages/farmer/Schemes';
import EquipmentMarketplace from './pages/farmer/EquipmentMarketplace';
import ConnectedRetailers from './pages/farmer/ConnectedRetailers';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Farmers from './pages/admin/Farmers';
import Agronomists from './pages/admin/Agronomists';
import Facilities from './pages/admin/Facilities';
import Seeds from './pages/admin/Seeds';
import Fertilizers from './pages/admin/Fertilizers';

// Agronomist Pages
import AgronomistDashboard from './pages/agronomist/AgronomistDashboard';
import AgronomistProfile from './pages/agronomist/AgronomistProfile';

// Retailer Pages
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import RetailerMarketplace from './pages/retailer/RetailerMarketplace';
import ConnectedFarmers from './pages/retailer/ConnectedFarmers';

// ── Public page minimal top bar ────────────────────────────────────────────
const PublicTopBar = () => {
  const { user } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-6 border-b border-sidebar-border bg-sidebar/80 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌾</span>
        <span className="font-black text-base tracking-tight text-sidebar-foreground">Krishi Kavach</span>
      </div>
      {!user && (
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm font-semibold text-sidebar-foreground hover:text-emerald-500 transition-colors">Sign In</a>
          <a href="/register" className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
            Get Started
          </a>
        </div>
      )}
    </header>
  );
};

// ── Authenticated App Shell (sidebar + content) ────────────────────────────
const AuthenticatedShell = ({ children }) => {
  const { collapsed, setMobileOpen } = useSidebar();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out',
        'lg:ml-64',
        collapsed && 'lg:ml-16'
      )}>
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 border-b border-sidebar-border bg-sidebar/80 backdrop-blur-md lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <span className="font-black text-sm text-sidebar-foreground">Krishi Kavach</span>
          </div>
          {user && (
            <button onClick={() => setIsChatOpen(true)} className="p-2 rounded-lg bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-colors relative">
              <MessageSquare size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          )}
        </div>

        {/* Desktop chat button */}
        {user && (
          <div className="hidden lg:flex fixed top-3 right-4 z-30">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar/80 backdrop-blur-md border border-sidebar-border text-sidebar-foreground hover:bg-emerald-600 hover:text-white transition-all text-sm font-medium relative"
            >
              <MessageSquare size={16} />
              <span className="hidden xl:inline">Chat</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>

      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

// ── Layout router ──────────────────────────────────────────────────────────
const PUBLIC_PATHS = ['/', '/login', '/register', '/unauthorized'];

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isPublic = PUBLIC_PATHS.some(p => location.pathname === p) || location.pathname.startsWith('/unauthorized');

  if (isPublic || !user) {
    return (
      <>
        <PublicTopBar />
        <div className="pt-14">{children}</div>
      </>
    );
  }
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppLayout>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          {/* Farmer */}
          <Route path="/farmer" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/farmer/crops" element={<ProtectedRoute allowedRoles={['farmer']}><CropManagement /></ProtectedRoute>} />
          <Route path="/farmer/disease-reports" element={<ProtectedRoute allowedRoles={['farmer']}><DiseaseReports /></ProtectedRoute>} />
          <Route path="/farmer/weather" element={<ProtectedRoute allowedRoles={['farmer']}><Weather /></ProtectedRoute>} />
          <Route path="/farmer/market" element={<ProtectedRoute allowedRoles={['farmer']}><Market /></ProtectedRoute>} />
          <Route path="/farmer/supply-chain" element={<ProtectedRoute allowedRoles={['farmer']}><SupplyChainDashboard /></ProtectedRoute>} />
          <Route path="/farmer/schemes/:id?" element={<ProtectedRoute allowedRoles={['farmer']}><Schemes /></ProtectedRoute>} />
          <Route path="/farmer/connected-retailers" element={<ProtectedRoute allowedRoles={['farmer']}><ConnectedRetailers /></ProtectedRoute>} />
          <Route path="/farmer/equipment" element={<ProtectedRoute allowedRoles={['farmer']}><EquipmentMarketplace /></ProtectedRoute>} />
          <Route path="/farmer/profile" element={<ProtectedRoute allowedRoles={['farmer']}><UserProfile /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/farmers" element={<ProtectedRoute allowedRoles={['admin']}><Farmers /></ProtectedRoute>} />
          <Route path="/admin/agronomists" element={<ProtectedRoute allowedRoles={['admin']}><Agronomists /></ProtectedRoute>} />
          <Route path="/admin/facilities" element={<ProtectedRoute allowedRoles={['admin']}><Facilities /></ProtectedRoute>} />
          <Route path="/admin/seeds" element={<ProtectedRoute allowedRoles={['admin']}><Seeds /></ProtectedRoute>} />
          <Route path="/admin/fertilizers" element={<ProtectedRoute allowedRoles={['admin']}><Fertilizers /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><UserProfile /></ProtectedRoute>} />

          {/* Agronomist */}
          <Route path="/agronomist" element={<ProtectedRoute allowedRoles={['agronomist']}><AgronomistDashboard /></ProtectedRoute>} />
          <Route path="/agronomist/profile" element={<ProtectedRoute allowedRoles={['agronomist']}><AgronomistProfile /></ProtectedRoute>} />

          {/* Retailer */}
          <Route path="/retailer" element={<ProtectedRoute allowedRoles={['retailer']}><RetailerDashboard /></ProtectedRoute>} />
          <Route path="/retailer/marketplace" element={<ProtectedRoute allowedRoles={['retailer']}><RetailerMarketplace /></ProtectedRoute>} />
          <Route path="/retailer/connected-farmers" element={<ProtectedRoute allowedRoles={['retailer']}><ConnectedFarmers /></ProtectedRoute>} />
          <Route path="/retailer/weather" element={<ProtectedRoute allowedRoles={['retailer']}><Weather /></ProtectedRoute>} />
          <Route path="/retailer/market" element={<ProtectedRoute allowedRoles={['retailer']}><Market /></ProtectedRoute>} />
          <Route path="/retailer/supply-chain" element={<ProtectedRoute allowedRoles={['retailer']}><SupplyChainDashboard /></ProtectedRoute>} />
          <Route path="/retailer/profile" element={<ProtectedRoute allowedRoles={['retailer']}><UserProfile /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>

      <AIChatbot />
      <FarmInfoModal />
    </Router>
  );
}

export default App;
