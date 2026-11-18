import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  ShoppingCart, Leaf, Phone, Mail, Instagram, Facebook,
  ChevronUp, User, LogOut, Settings, Home, ShoppingBag,
  BookOpen, X, Sun, Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { PromoBanner } from './PromoBanner';
import fullLogo from '../../imports/ChatGPT_Image_4_sept_2026__02_25_20_p.m..png';
import isotipo from '../../imports/Isotipo-1.png';

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/cursos', label: 'Cursos' },
];

const bottomNavItems = [
  { to: '/', Icon: Home, label: 'Inicio' },
  { to: '/tienda', Icon: ShoppingBag, label: 'Tienda' },
  { to: '/cursos', Icon: BookOpen, label: 'Cursos' },
  { to: '/carrito', Icon: ShoppingCart, label: 'Carrito' },
  { to: null, Icon: User, label: 'Cuenta' },
];

function BottomNav({ onAccountTap, isMenuOpen }: { onAccountTap: () => void; isMenuOpen: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const isActive = (path: string | null) => {
    if (!path) return false;
    return path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t"
      style={{
        background: 'var(--brand-overlay-scroll)',
        borderColor: 'var(--border)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        /* max() ensures min 10px padding on physical-button devices where safe-area = 0 */
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="grid grid-cols-5 h-16">
        {bottomNavItems.map(({ to, Icon, label }) => {
          const isCart = label === 'Carrito';
          const isAccount = label === 'Cuenta';
          const active = isAccount ? isMenuOpen : isActive(to);

          return (
            <button
              key={label}
              onClick={() => {
                if (isAccount) { onAccountTap(); return; }
                if (to) navigate(to);
              }}
              className="relative flex flex-col items-center justify-center gap-0.5 pt-1"
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: 'var(--brand-green)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <div className="relative">
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: active
                      ? 'var(--brand-green)'
                      : isAccount && user
                        ? 'var(--brand-orange)'
                        : 'var(--brand-inactive)',
                  }}
                />
                {isCart && totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                    style={{ background: 'var(--brand-orange)', fontSize: '0.6rem' }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
                {isAccount && user && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2"
                    style={{ background: 'var(--brand-green)', borderColor: 'var(--brand-overlay-scroll)' }}
                  />
                )}
              </div>
              <span
                className="text-xs leading-none"
                style={{
                  color: active ? 'var(--brand-green)' : 'var(--brand-inactive)',
                  fontSize: '0.65rem',
                }}
              >
                {isAccount && user ? user.name.split(' ')[0] : label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function Layout() {
  const [scrollY, setScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('login');

  /* ── Dark mode ─────────────────────────────────────────── */
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleDark = () => setIsDark(v => !v);

  /* ── Scroll ────────────────────────────────────────────── */
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isScrolled = scrollY > 60;

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const openAuth = (tab: 'login' | 'register') => {
    setAuthDefaultTab(tab);
    setAuthModal(true);
  };

  /* On mobile, Cuenta always opens the drawer (with login CTA when not authenticated) */
  const handleAccountTap = () => setUserMenuOpen(v => !v);

  /* ── Derived values ────────────────────────────────────── */
  /* New logo is black-on-white PNG. mix-blend-mode removes the white bg:
     multiply in light mode (white × cream bg = invisible), screen in dark mode */
  const logoFilter = isDark
    ? 'invert(1) brightness(0.82) sepia(25%) saturate(160%)'
    : 'none';
  const logoBlend: React.CSSProperties['mixBlendMode'] = isDark ? 'screen' : 'multiply';

  /* Nav bg is noticeably lighter/crisper than the warm cream page background (#fdf4e8)
     so the header reads as a distinct surface rather than blending into the content */
  const navBg        = isDark ? 'rgba(30,22,14,1)'     : 'rgba(255,253,248,0.99)';
  const navBgScroll  = isDark ? 'rgba(38,28,18,0.98)'  : 'rgba(255,252,244,0.97)';
  const navShadow    = isDark ? '0 1px 0 rgba(200,130,40,0.24)' : '0 1px 0 rgba(120,70,15,0.22)';
  const navShadowScr = isDark ? '0 4px 24px rgba(0,0,0,0.52)'  : '0 4px 20px rgba(100,50,10,0.14)';

  /* Botanical pattern: colours react to dark mode */
  const p = {
    leaf:   isDark ? '#3a7020' : '#1a4d0a',
    flower: isDark ? '#e07020' : '#c85a00',
    acorn:  isDark ? '#c88020' : '#c8780a',
    drop:   isDark ? '#e09020' : '#d4860a',
    leafOp: isDark ? 0.18      : 0.14,
    flOp:   isDark ? 0.15      : 0.12,
  };

  /* ── Admin bypass ──────────────────────────────────────── */
  if (location.pathname.startsWith('/admin')) return <Outlet />;

  const isHomePage = location.pathname === '/';

  return (
    <>
      {/* ── Botanical background (WhatsApp-style tile) ─────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -1, background: 'var(--background)', transition: 'background 0.3s ease' }}
        aria-hidden="true"
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="botanical-bg" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              {/* Leaf — top-left */}
              <g transform="translate(28,25) rotate(-20)" opacity={p.leafOp}>
                <path d="M0 28C-13 17-13 3-5 0 0 7 5 7 9 0 21 3 21 17 0 28Z" fill={p.leaf}/>
                <path d="M0 28V3" stroke={p.leaf} strokeWidth="1.1" fill="none"/>
              </g>
              {/* 8-petal flower — top-right */}
              <g transform="translate(160,38)" opacity={p.flOp}>
                <circle r="4" fill={p.flower}/>
                <ellipse ry="7" rx="4.5" cy="-12" fill={p.flower}/>
                <ellipse ry="7" rx="4.5" cy="12" fill={p.flower}/>
                <ellipse rx="7" ry="4.5" cx="-12" fill={p.flower}/>
                <ellipse rx="7" ry="4.5" cx="12" fill={p.flower}/>
                <ellipse ry="6" rx="3.8" cx="-8" cy="-8" fill={p.flower} transform="rotate(45 -8 -8)"/>
                <ellipse ry="6" rx="3.8" cx="8" cy="-8" fill={p.flower} transform="rotate(-45 8 -8)"/>
                <ellipse ry="6" rx="3.8" cx="-8" cy="8" fill={p.flower} transform="rotate(-45 -8 8)"/>
                <ellipse ry="6" rx="3.8" cx="8" cy="8" fill={p.flower} transform="rotate(45 8 8)"/>
              </g>
              {/* Herb sprig — bottom-left */}
              <g transform="translate(40,150)" opacity={p.leafOp}>
                <line x1="0" y1="22" x2="0" y2="-18" stroke={p.leaf} strokeWidth="1.6"/>
                <path d="M0 6C-11 1-13-12-5-15-3-7 0 0 0 6Z" fill={p.leaf}/>
                <path d="M0 6C11 1 13-12 5-15 3-7 0 0 0 6Z" fill={p.leaf}/>
                <path d="M0-5C-8-9-9-20-2-19 0-15 0-9 0-5Z" fill={p.leaf}/>
              </g>
              {/* Acorn — bottom-right */}
              <g transform="translate(160,152)" opacity={p.flOp}>
                <ellipse cy="9" rx="8.5" ry="11" fill={p.acorn}/>
                <path d="M-11 2Q0-13 11 2Z" fill={p.leaf}/>
                <line x1="0" y1="-13" x2="0" y2="-20" stroke={p.leaf} strokeWidth="1.6"/>
              </g>
              {/* Small leaf — center */}
              <g transform="translate(96,96) rotate(18)" opacity={isDark ? 0.12 : 0.09}>
                <path d="M0 17C-9 10-9 2-3 0 0 4 3 4 7 0 12 2 12 10 0 17Z" fill={p.leaf}/>
                <path d="M0 17V1" stroke={p.leaf} strokeWidth="0.9" fill="none"/>
              </g>
              {/* Berry cluster — mid-left */}
              <g transform="translate(14,96)" opacity={isDark ? 0.14 : 0.11}>
                <circle cx="0" cy="0" r="3.5" fill={p.flower}/>
                <circle cx="8" cy="-6" r="3" fill={p.flower}/>
                <circle cx="9" cy="5" r="2.8" fill={p.flower}/>
                <line x1="0" y1="3.5" x2="0" y2="14" stroke={p.leaf} strokeWidth="1.2"/>
              </g>
              {/* Maple leaf — top-center */}
              <g transform="translate(96,18)" opacity={isDark ? 0.13 : 0.10}>
                <path d="M0-14 L3-6 L10-8 L7-2 L14 2 L8 4 L10 12 L0 9 L-10 12 L-8 4 L-14 2 L-7-2 L-10-8 L-3-6 Z" fill={p.flower}/>
                <line x1="0" y1="12" x2="0" y2="18" stroke={p.leaf} strokeWidth="1.2"/>
              </g>
              {/* Seed/droplet — center-right */}
              <g transform="translate(178,96)" opacity={isDark ? 0.13 : 0.10}>
                <path d="M0-10 C6-4 6 4 0 8 C-6 4-6-4 0-10Z" fill={p.drop}/>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#botanical-bg)"/>
        </svg>
      </div>

      <div className="min-h-screen flex flex-col">
        {/* ── Promo banner — top of every page ─────────────── */}
        <PromoBanner />

        {/* ── Navbar — hidden on home (hero shows branding), desktop only elsewhere ── */}
        <motion.header
          className={isHomePage ? 'hidden' : 'hidden md:block md:sticky md:top-0 md:z-40'}
          animate={{
            backgroundColor: isScrolled ? navBgScroll : navBg,
            boxShadow: isScrolled ? navShadowScr : navShadow,
          }}
          transition={{ duration: 0.3 }}
        >
          <nav
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4"
            style={{ height: isScrolled ? '52px' : '64px', transition: 'height 0.3s ease' }}
          >
            {/* Logo */}
            <Link to="/" className="shrink-0 relative flex items-center" style={{ height: '44px' }}>
              <AnimatePresence mode="wait">
                {isScrolled ? (
                  <motion.img
                    key="isotipo"
                    src={isotipo}
                    alt="La Tia Richard"
                    initial={{ opacity: 0, scale: 0.75, rotate: -6 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.75, rotate: -6 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{
                      height: '38px', width: 'auto',
                      filter: isDark
                        ? 'invert(1) brightness(0.85) sepia(20%)'
                        : 'invert(18%) sepia(70%) saturate(700%) hue-rotate(92deg) brightness(0.68)',
                    }}
                  />
                ) : (
                  <motion.img
                    key="fulllogo"
                    src={fullLogo}
                    alt="La Tia Richard"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{ height: '38px', width: 'auto', filter: logoFilter, mixBlendMode: logoBlend }}
                  />
                )}
              </AnimatePresence>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium transition-colors relative"
                  style={{ color: isActive(link.to) ? 'var(--brand-green)' : 'var(--muted-foreground)' }}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: 'var(--brand-green)' }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="flex items-center gap-1">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                className="p-2.5 rounded-full transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--secondary)')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
              >
                {isDark ? <Sun className="w-4.5 h-4.5 w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Cart — desktop */}
              <button
                onClick={() => navigate('/carrito')}
                className="relative p-2.5 rounded-full transition-colors hidden md:flex"
                aria-label="Carrito"
                style={{ color: 'var(--muted-foreground)' }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--secondary)')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                      style={{ background: 'var(--brand-orange)' }}
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Cart — mobile */}
              <button
                onClick={() => navigate('/carrito')}
                className="relative p-2.5 rounded-full transition-colors md:hidden"
                aria-label="Carrito"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge-m"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                      style={{ background: 'var(--brand-orange)' }}
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Auth — desktop */}
              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full transition-colors"
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--secondary)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: user.role === 'admin' ? 'var(--brand-orange)' : 'var(--brand-green)' }}
                    >
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--brand-green)' }}>
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 rounded-2xl shadow-xl overflow-hidden z-50"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                      >
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                          <p className="font-medium text-sm" style={{ color: 'var(--brand-green)' }}>{user.name}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{user.email}</p>
                          {user.role === 'admin' && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: 'var(--brand-orange)' }}>
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="py-1">
                          {user.role === 'admin' && (
                            <button
                              onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left"
                              style={{ color: 'var(--brand-orange)' }}
                              onMouseOver={e => (e.currentTarget.style.background = 'var(--brand-orange-soft)')}
                              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <Settings className="w-4 h-4" /> Panel de administración
                            </button>
                          )}
                          <button
                            onClick={() => { navigate('/perfil'); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left"
                            style={{ color: 'var(--foreground)' }}
                            onMouseOver={e => (e.currentTarget.style.background = 'var(--secondary)')}
                            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <User className="w-4 h-4" /> Mi perfil
                          </button>
                          <button
                            onClick={() => { navigate('/cursos'); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left"
                            style={{ color: 'var(--foreground)' }}
                            onMouseOver={e => (e.currentTarget.style.background = 'var(--secondary)')}
                            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <BookOpen className="w-4 h-4" /> Mis cursos
                          </button>
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 text-left hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" /> Cerrar sesión
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => openAuth('login')}
                    className="px-4 py-2 text-sm font-medium rounded-full transition-colors hover:bg-gray-100"
                    style={{ color: 'var(--brand-green)' }}
                  >
                    Ingresar
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="px-4 py-2 text-sm font-medium rounded-full text-white hover:opacity-90"
                    style={{ background: 'var(--brand-green)' }}
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </nav>
        </motion.header>

        {/* ── Mobile account drawer — always accessible via bottom nav ── */}
        <AnimatePresence>
          {userMenuOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 md:hidden"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setUserMenuOpen(false)}
              />
              <motion.div
                className="fixed inset-x-0 z-50 md:hidden rounded-t-3xl overflow-hidden"
                style={{
                  background: 'var(--card)',
                  boxShadow: '0 -8px 32px rgba(0,0,0,0.20)',
                  /* Sits right above the bottom nav, accounting for safe area on both
                     gesture-based and physical-button devices */
                  bottom: 'calc(4rem + max(env(safe-area-inset-bottom, 0px), 10px))',
                }}
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              >
                {/* Drag handle */}
                <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: 'var(--border)' }} />

                {/* ── Logged-in view ── */}
                {user ? (
                  <>
                    <div className="px-5 pt-2 pb-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ background: user.role === 'admin' ? 'var(--brand-orange)' : 'var(--brand-green)' }}>
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--brand-green)' }}>{user.name}</p>
                          <p className="text-xs leading-tight" style={{ color: 'var(--muted-foreground)' }}>{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: 'var(--brand-orange)' }}>Admin</span>
                        )}
                        <button onClick={() => setUserMenuOpen(false)} style={{ color: 'var(--muted-foreground)' }} className="p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      {user.role === 'admin' && (
                        <button
                          onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-left"
                          style={{ background: 'var(--brand-orange-soft)', color: 'var(--brand-orange)' }}
                        >
                          <Settings className="w-5 h-5" /> Panel de administración
                        </button>
                      )}
                      <button
                        onClick={() => { navigate('/perfil'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-left hover:bg-gray-50"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <User className="w-5 h-5" style={{ color: 'var(--brand-green)' }} /> Mi perfil
                      </button>
                      <button
                        onClick={() => { navigate('/cursos'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-left hover:bg-gray-50"
                        style={{ color: 'var(--foreground)' }}
                      >
                        <BookOpen className="w-5 h-5" style={{ color: 'var(--brand-green)' }} /> Mis cursos
                      </button>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-5 h-5" /> Cerrar sesión
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── Guest view — login / register ── */
                  <div className="px-5 pt-3 pb-5">
                    <div className="flex flex-col items-center text-center pb-4 mb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                      <img
                        src={isotipo} alt=""
                        className="h-14 w-auto mb-2"
                        style={{
                          filter: isDark
                            ? 'invert(1) brightness(0.85) sepia(20%)'
                            : 'invert(18%) sepia(70%) saturate(700%) hue-rotate(92deg) brightness(0.68)',
                        }}
                      />
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Bienvenido</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Inicia sesión para acceder a tu cuenta</p>
                    </div>
                    <div className="space-y-2.5">
                      <button
                        onClick={() => { openAuth('login'); setUserMenuOpen(false); }}
                        className="w-full px-4 py-3.5 rounded-xl text-sm font-medium text-white"
                        style={{ background: 'var(--brand-green)' }}
                      >
                        Iniciar sesión
                      </button>
                      <button
                        onClick={() => { openAuth('register'); setUserMenuOpen(false); }}
                        className="w-full px-4 py-3.5 rounded-xl text-sm font-medium border"
                        style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--secondary)' }}
                      >
                        Crear cuenta
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Dark mode toggle — always visible ── */}
                <div className="px-5 pb-4 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={toggleDark}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}
                  >
                    <span className="flex items-center gap-3">
                      {isDark ? <Sun className="w-5 h-5" style={{ color: 'var(--brand-orange)' }} /> : <Moon className="w-5 h-5" style={{ color: 'var(--brand-green)' }} />}
                      {isDark ? 'Modo claro' : 'Modo oscuro'}
                    </span>
                    {/* Visual toggle pill */}
                    <span
                      className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-300"
                      style={{ background: isDark ? 'var(--brand-orange)' : 'var(--muted)' }}
                    >
                      <span
                        className="inline-block h-5 w-5 rounded-full shadow transition-transform duration-300 my-0.5"
                        style={{
                          transform: isDark ? 'translateX(1.25rem)' : 'translateX(0.125rem)',
                          background: isDark ? '#f0e4d0' : '#e8dcc8',
                        }}
                      />
                    </span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Page content ───────────────────────────────────── */}
        <main className="flex-1 main-mobile-pad md:pb-0">
          <Outlet />
        </main>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer style={{ background: 'var(--brand-footer)' }} className="text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start">
                <img
                  src={isotipo}
                  alt="La Tia Richard"
                  className="h-32 w-auto mb-4"
                  style={{ filter: 'invert(1) brightness(1.4) sepia(20%) saturate(130%)', mixBlendMode: 'screen' }}
                />
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Tu fuente de bienestar natural. Plantas medicinales, tratamientos y cursos.
                </p>
                <div className="flex gap-4 mt-4">
                  {[Instagram, Facebook].map((Icon, i) => (
                    <a
                      key={i} href="#"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                      onMouseOver={e => (e.currentTarget.style.color = '#fff')}
                      onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Tienda */}
              <div>
                <h4 className="text-white mb-3 text-xs font-semibold uppercase tracking-wider">Tienda</h4>
                <div className="flex flex-col gap-2">
                  {['Plantas', 'Tés', 'Tinturas', 'Aceites', 'Suplementos'].map(item => (
                    <Link
                      key={item} to="/tienda"
                      className="text-xs transition-colors"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                      onMouseOver={e => (e.currentTarget.style.color = '#fff')}
                      onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div>
                <h4 className="text-white mb-3 text-xs font-semibold uppercase tracking-wider">Información</h4>
                <div className="flex flex-col gap-2">
                  {['Sobre Nosotros', 'Blog de Salud', 'Preguntas Frecuentes', 'Privacidad'].map(item => (
                    <a
                      key={item} href="#"
                      className="text-xs transition-colors"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                      onMouseOver={e => (e.currentTarget.style.color = '#fff')}
                      onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-white mb-3 text-xs font-semibold uppercase tracking-wider">Contacto</h4>
                <div className="flex flex-col gap-2.5">
                  {[
                    { Icon: Phone, text: '+52 55 1234 5678' },
                    { Icon: Mail, text: 'hola@jardindesalud.com' },
                    { Icon: Leaf, text: 'Envíos a Latinoamérica' },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <Icon className="w-3.5 h-3.5 shrink-0" /><span>{text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Pagos seguros:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['VISA', 'MC', 'PayPal'].map(p => (
                      <span
                        key={p}
                        className="text-xs px-2 py-0.5 rounded border"
                        style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.55)' }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="border-t mt-8 pt-5 flex flex-col sm:flex-row justify-between items-center gap-2"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            >
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                © 2024 El Jardín de tu Salud · Todos los derechos reservados
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Hecho con 🌿 para tu bienestar</p>
            </div>
          </div>
        </footer>

        {/* ── Scroll-to-top ───────────────────────────────────── */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={scrollToTop}
              className="fixed right-4 z-50 w-11 h-11 rounded-full text-white shadow-lg flex items-center justify-center"
              style={{ background: 'var(--brand-green)', bottom: 'calc(4rem + max(env(safe-area-inset-bottom, 0px), 10px) + 0.75rem)' }}
              aria-label="Volver al inicio"
            >
              <ChevronUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        <BottomNav onAccountTap={handleAccountTap} isMenuOpen={userMenuOpen} />
        <AuthModal open={authModal} onClose={() => setAuthModal(false)} defaultTab={authDefaultTab} />
      </div>
    </>
  );
}
