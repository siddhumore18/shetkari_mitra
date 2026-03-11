import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home, Sprout, ClipboardList, CloudSun, BarChart3, Users, Microscope,
    UserCircle, LogOut, Truck, ChevronRight, ChevronLeft, Menu,
    Sun, Moon, Globe, MessageSquare, Settings, ShieldCheck, X, PanelLeft, Store, Tractor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';

// ── Nav config per role ────────────────────────────────────────────────────
const NAV_CONFIG = {
    farmer: [
        { path: '/farmer', label: 'Dashboard', icon: Home },
        { path: '/farmer/crops', label: 'My Crops', icon: Sprout },
        { path: '/farmer/disease-reports', label: 'Disease Reports', icon: ClipboardList },
        { path: '/farmer/weather', label: 'Weather Updates', icon: CloudSun },
        { path: '/farmer/market', label: 'Market Trends', icon: BarChart3 },
        { path: '/farmer/schemes', label: 'Govt Schemes', icon: ClipboardList },
        { path: '/farmer/connected-retailers', label: 'Connected Retailers', icon: Users },
        { path: '/farmer/equipment', label: 'Equipment Market', icon: Tractor },
        { path: '/farmer/supply-chain', label: 'Supply Chain', icon: Truck },
        { path: '/messages', label: 'Messages', icon: MessageSquare },
    ],
    admin: [
        { path: '/admin', label: 'Dashboard', icon: Home },
        { path: '/admin/farmers', label: 'Farmers', icon: Users },
        { path: '/admin/agronomists', label: 'Agronomists', icon: Microscope },
        { path: '/admin/facilities', label: 'Facilities', icon: Settings },
        { path: '/admin/seeds', label: 'Seeds', icon: Sprout },
        { path: '/admin/fertilizers', label: 'Fertilizers', icon: ClipboardList },
        { path: '/messages', label: 'Messages', icon: MessageSquare },
    ],
    agronomist: [
        { path: '/agronomist', label: 'Dashboard', icon: Home },
        { path: '/agronomist/profile', label: 'Profile Settings', icon: UserCircle },
        { path: '/messages', label: 'Messages', icon: MessageSquare },
    ],
    retailer: [
        { path: '/retailer', label: 'Dashboard', icon: Home },
        { path: '/retailer/marketplace', label: 'Marketplace', icon: Store },
        { path: '/retailer/connected-farmers', label: 'Connected Farmers', icon: Users },
        { path: '/retailer/weather', label: 'Weather Updates', icon: CloudSun },
        { path: '/retailer/market', label: 'Market Trends', icon: BarChart3 },
        { path: '/retailer/supply-chain', label: 'Supply Chain', icon: Truck },
        { path: '/messages', label: 'Messages', icon: MessageSquare },
    ],
};

const ROLE_COLORS = {
    farmer: { bg: 'bg-emerald-600', ring: 'ring-emerald-400', label: 'Farmer', icon: '👨‍🌾' },
    admin: { bg: 'bg-indigo-600', ring: 'ring-indigo-400', label: 'Admin', icon: '🛡️' },
    agronomist: { bg: 'bg-teal-600', ring: 'ring-teal-400', label: 'Expert', icon: '🔬' },
    retailer: { bg: 'bg-blue-600', ring: 'ring-blue-400', label: 'Retailer', icon: '🏪' },
};

// ── Sidebar Nav Item ───────────────────────────────────────────────────────
const NavItem = ({ link, active, collapsed, t, onClick }) => {
    const Icon = link.icon;
    const item = (
        <Link
            to={link.path}
            onClick={onClick}
            className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
        >
            <Icon size={18} className={cn('shrink-0', active ? 'text-white' : 'opacity-70 group-hover:opacity-100')} />
            {!collapsed && (
                <span className="truncate">{t(link.label)}</span>
            )}
            {!collapsed && active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
        </Link>
    );

    if (collapsed) {
        return (
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>{item}</TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground border border-border">
                    {t(link.label)}
                </TooltipContent>
            </Tooltip>
        );
    }
    return item;
};

// ── Language Switcher ──────────────────────────────────────────────────────
const LanguageSwitcher = ({ collapsed }) => {
    const { lang, selectLanguage, SUPPORTED_LANGUAGES } = useLanguage();
    const current = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];
    const [open, setOpen] = useState(false);

    const btn = (
        <button
            onClick={() => setOpen(o => !o)}
            className={cn(
                'group flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
        >
            <Globe size={18} className="shrink-0 opacity-70 group-hover:opacity-100" />
            {!collapsed && (
                <>
                    <span className="truncate">{current.flag} {current.nativeName}</span>
                    <ChevronRight size={14} className={cn('ml-auto transition-transform', open && 'rotate-90')} />
                </>
            )}
        </button>
    );

    return (
        <div className="relative">
            {collapsed ? (
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-popover text-popover-foreground border border-border">
                        Language: {current.name}
                    </TooltipContent>
                </Tooltip>
            ) : btn}

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            'absolute z-50 w-44 rounded-lg border border-border bg-popover shadow-lg overflow-hidden',
                            collapsed ? 'left-full top-0 ml-2' : 'left-0 bottom-full mb-1'
                        )}
                    >
                        {SUPPORTED_LANGUAGES.map(l => (
                            <button
                                key={l.code}
                                onClick={() => { selectLanguage(l.code); setOpen(false); }}
                                className={cn(
                                    'flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent',
                                    lang === l.code ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'text-popover-foreground'
                                )}
                            >
                                <span className="text-base">{l.flag}</span>
                                <span>{l.nativeName}</span>
                                {lang === l.code && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Recommended Scheme (Farmer Only) ──────────────────────────────────────
const SCHEME_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const RecommendedScheme = ({ onClose }) => {
    const { lang, t } = useLanguage();
    const [scheme, setScheme] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const cacheKey = `sidebar_scheme_${lang}`;

        const loadScheme = async () => {
            // Check localStorage cache first
            try {
                const cached = JSON.parse(localStorage.getItem(cacheKey));
                if (cached && Date.now() - cached.ts < SCHEME_CACHE_TTL && cached.scheme) {
                    if (!cancelled) setScheme(cached.scheme);
                    return; // serve from cache, no API call needed
                }
            } catch { }

            // Fetch fresh
            try {
                const { schemeAPI } = await import('../services/api');
                const res = await schemeAPI.getRecommendations(lang);
                const first = res.data.recommendations?.[0];
                if (first && !cancelled) {
                    setScheme(first);
                    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), scheme: first }));
                }
            } catch { }
        };

        loadScheme();
        return () => { cancelled = true; };
    }, [lang]);

    if (!scheme) return null;
    return (
        <div className="mx-3 mt-2 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 p-3 overflow-hidden">
            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Matched Scheme</span>
            <h5 className="text-xs font-bold text-foreground mt-1 mb-1 line-clamp-1">{scheme.title}</h5>
            <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2 italic">"{scheme.shortDescription}"</p>
            <Link to={`/farmer/schemes/${scheme.id}`} onClick={onClose} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
                {t('View Details')} <ChevronRight size={11} />
            </Link>
        </div>
    );
};

// ── Main AppSidebar ────────────────────────────────────────────────────────
const AppSidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const { isDark, toggleTheme } = useTheme();
    const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebar();

    const navLinks = user ? (NAV_CONFIG[user.role] || []) : [];
    const rc = user ? (ROLE_COLORS[user.role] || ROLE_COLORS.farmer) : ROLE_COLORS.farmer;

    const isActive = (path) =>
        location.pathname === path ||
        (path !== '/' && path !== '/farmer' && path !== '/admin' && path !== '/agronomist' && location.pathname.startsWith(path));

    const handleLogout = async () => {
        setMobileOpen(false);
        await logout();
        navigate('/login');
    };

    const closeMobile = () => setMobileOpen(false);

    // Sidebar inner content (shared between desktop and mobile)
    const SidebarContent = ({ isMobile = false }) => (
        <div className="flex flex-col h-full">
            {/* ── Logo + Collapse Toggle ── */}
            <div className={cn('flex items-center h-16 px-4 border-b border-sidebar-border shrink-0',
                collapsed && !isMobile ? 'justify-center' : 'justify-between'
            )}>
                {(!collapsed || isMobile) && (
                    <Link to="/" className="flex items-center gap-2.5" onClick={isMobile ? closeMobile : undefined}>
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                            <Sprout size={16} className="text-white" />
                        </div>
                        <span className="font-black text-base tracking-tight text-sidebar-foreground">Krishi Kavach</span>
                    </Link>
                )}
                {collapsed && !isMobile && (
                    <Link to="/" title="Krishi Kavach">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <Sprout size={16} className="text-white" />
                        </div>
                    </Link>
                )}
                {isMobile ? (
                    <button onClick={closeMobile} className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
                        <X size={18} />
                    </button>
                ) : (
                    <button
                        onClick={toggle}
                        className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <PanelLeft size={18} className={cn('transition-transform', collapsed && 'rotate-180')} />
                    </button>
                )}
            </div>

            {/* ── Nav Links ── */}
            <ScrollArea className="flex-1 py-4">
                <div className={cn('space-y-1', collapsed && !isMobile ? 'px-2' : 'px-3')}>
                    {navLinks.map(link => (
                        <NavItem
                            key={link.path}
                            link={link}
                            active={isActive(link.path)}
                            collapsed={collapsed && !isMobile}
                            t={t}
                            onClick={isMobile ? closeMobile : undefined}
                        />
                    ))}
                </div>

                {/* Recommended scheme for Farmers */}
                {user?.role === 'farmer' && !collapsed && (
                    <div className="mt-4">
                        <div className="px-3 mb-2">
                            <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 p-3 text-white">
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200 mb-0.5">New Opportunity</p>
                                <h4 className="text-xs font-bold mb-2">Govt Agriculture Schemes</h4>
                                <Link
                                    to="/farmer/schemes"
                                    onClick={isMobile ? closeMobile : undefined}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-emerald-700 text-[10px] font-black rounded-lg hover:bg-emerald-50 transition-colors"
                                >
                                    View Matches <ChevronRight size={11} />
                                </Link>
                            </div>
                        </div>
                        <RecommendedScheme onClose={isMobile ? closeMobile : undefined} />
                    </div>
                )}
            </ScrollArea>

            {/* ── Bottom Section ── */}
            <div className={cn('border-t border-sidebar-border py-3 space-y-1 shrink-0',
                collapsed && !isMobile ? 'px-2' : 'px-3'
            )}>
                {/* Theme Toggle */}
                {collapsed && !isMobile ? (
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <button
                                onClick={toggleTheme}
                                className="group flex items-center justify-center w-full rounded-lg p-2.5 text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
                            >
                                {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">{isDark ? 'Switch to Light' : 'Switch to Dark'}</TooltipContent>
                    </Tooltip>
                ) : (
                    <button
                        onClick={toggleTheme}
                        className="group flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                        {isDark ? <Sun size={18} className="shrink-0 text-amber-400" /> : <Moon size={18} className="shrink-0 text-indigo-500" />}
                        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                )}

                {/* Language Switcher */}
                <LanguageSwitcher collapsed={collapsed && !isMobile} />

                <Separator className="my-2 bg-sidebar-border" />

                {/* User Card */}
                {user && (
                    <>
                        {(!collapsed || isMobile) && (
                            <Link
                                to={`/${user.role}/profile`}
                                onClick={isMobile ? closeMobile : undefined}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-sidebar-accent transition-colors group"
                            >
                                <Avatar className="h-8 w-8 shrink-0">
                                    {user.profilePhoto?.url ? (
                                        <AvatarImage src={user.profilePhoto.url} alt={user.fullName} />
                                    ) : null}
                                    <AvatarFallback className={cn(rc.bg, 'text-white text-xs font-bold')}>
                                        {user.fullName?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.fullName}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{rc.label}</p>
                                </div>
                                <UserCircle size={15} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        )}
                        {collapsed && !isMobile && (
                            <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <Link to={`/${user.role}/profile`} className="flex items-center justify-center w-full rounded-lg p-2 hover:bg-sidebar-accent transition-colors">
                                        <Avatar className="h-7 w-7">
                                            {user.profilePhoto?.url && <AvatarImage src={user.profilePhoto.url} alt={user.fullName} />}
                                            <AvatarFallback className={cn(rc.bg, 'text-white text-xs font-bold shrink-0')}>
                                                {user.fullName?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">{user.fullName} · {rc.label}</TooltipContent>
                            </Tooltip>
                        )}
                    </>
                )}

                {/* Logout */}
                {collapsed && !isMobile ? (
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <button onClick={handleLogout} className="flex items-center justify-center w-full rounded-lg p-2.5 text-red-500 hover:bg-red-500/10 transition-colors">
                                <LogOut size={18} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Logout</TooltipContent>
                    </Tooltip>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} className="shrink-0" />
                        <span>Logout</span>
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <TooltipProvider>
            {/* ── Desktop Sidebar (always visible) ── */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-40 h-screen',
                    'bg-sidebar border-r border-sidebar-border',
                    'transition-[width] duration-300 ease-in-out',
                    'hidden lg:flex flex-col',
                    collapsed ? 'w-16' : 'w-64'
                )}
            >
                <SidebarContent />
            </aside>

            {/* ── Mobile Overlay ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobile}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-72 z-[70] bg-sidebar border-r border-sidebar-border lg:hidden flex flex-col"
                        >
                            <SidebarContent isMobile={true} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </TooltipProvider>
    );
};

export default AppSidebar;
