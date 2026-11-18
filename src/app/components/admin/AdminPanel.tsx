import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, Package, BookOpen, Users, Settings,
  DollarSign, LogOut, ChevronRight, ShieldAlert, Megaphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import DashboardTab from './tabs/DashboardTab';
import ProductsTab from './tabs/ProductsTab';
import CoursesTab from './tabs/CoursesTab';
import RevenueTab from './tabs/RevenueTab';
import UsersTab from './tabs/UsersTab';
import SettingsTab from './tabs/SettingsTab';
import BannerTab from './tabs/BannerTab';
import fullLogo from '../../../imports/ChatGPT_Image_4_sept_2026__02_25_20_p.m..png';

type Tab = 'dashboard' | 'products' | 'courses' | 'revenue' | 'users' | 'banner' | 'settings';

const NAV_ITEMS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard',     Icon: LayoutDashboard },
  { id: 'products',  label: 'Productos',     Icon: Package },
  { id: 'courses',   label: 'Cursos',        Icon: BookOpen },
  { id: 'revenue',   label: 'Ingresos',      Icon: DollarSign },
  { id: 'users',     label: 'Usuarios',      Icon: Users },
  { id: 'banner',    label: 'Banner',        Icon: Megaphone },
  { id: 'settings',  label: 'Configuración', Icon: Settings },
];

export default function AdminPanel() {
  const { user, users, logout, adminProducts: products, setAdminProducts: setProducts, adminCourses: courses, setAdminCourses: setCourses, discountRules, setDiscountRules } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm w-full">
          <ShieldAlert className="w-14 h-14 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso restringido</h2>
          <p className="text-gray-500 text-sm mb-6">Esta área es solo para administradores.</p>
          <button onClick={() => navigate('/')}
            className="px-8 py-3 rounded-xl text-white font-medium text-sm"
            style={{ background: 'var(--brand-green)' }}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => { logout(); navigate('/'); };
  const currentNav  = NAV_ITEMS.find(n => n.id === activeTab)!;

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Desktop sidebar (lg+) ─────────────────────────── */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-gray-100 shadow-sm sticky top-0 h-screen">
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 shrink-0">
          <img src={fullLogo} alt="La Tia Richard" className="h-7 w-auto"
            style={{ filter: 'invert(22%) sepia(60%) saturate(600%) hue-rotate(95deg) brightness(0.75)' }} />
          <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-bold shrink-0"
            style={{ background: 'var(--brand-orange)', fontSize: '0.6rem' }}>ADMIN</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                style={active ? { background: 'var(--brand-section-green)', color: 'var(--brand-green)' } : { color: 'var(--muted-foreground)' }}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 text-left">{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--brand-green)' }} />}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-gray-50 shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'var(--brand-orange)' }}>
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--brand-green)' }}>{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <button onClick={() => navigate('/')}
              className="py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50">
              ← Ver sitio
            </button>
            <button onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50">
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar — desktop only (mobile has no top bar; bottom nav suffices) */}
        <header className="hidden lg:flex sticky top-0 z-20 bg-white border-b border-gray-100 px-6 items-center gap-3 h-14 shrink-0">
          <currentNav.Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--brand-green)' }} />
          <h1 className="font-semibold text-gray-700 text-sm">{currentNav.label}</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'var(--brand-orange)' }}>
              {user.name[0]}
            </div>
          </div>
        </header>

        {/* Mobile top bar — empty spacer so content clears the status bar */}
        <div className="lg:hidden h-2 shrink-0" />

        {/* Tab content — pb-16 on mobile to clear bottom nav */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full">
              {activeTab === 'dashboard' && <DashboardTab products={products} courses={courses} users={users} />}
              {activeTab === 'products'  && <ProductsTab  products={products} setProducts={setProducts} discountRules={discountRules} />}
              {activeTab === 'courses'   && <CoursesTab   courses={courses}   setCourses={setCourses} discountRules={discountRules} />}
              {activeTab === 'revenue'   && <RevenueTab />}
              {activeTab === 'users'     && <UsersTab users={users} products={products} courses={courses} />}
              {activeTab === 'banner'    && <BannerTab />}
              {activeTab === 'settings'  && <SettingsTab discountRules={discountRules} setDiscountRules={setDiscountRules} onLogout={handleLogout} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Mobile bottom nav (no sidebar on mobile) ──── */}
        <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white border-t border-gray-100"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.07)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="grid grid-cols-6 h-14">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)}
                  className="flex flex-col items-center justify-center gap-0.5 pt-1 relative"
                  style={{ color: active ? 'var(--brand-green)' : 'var(--brand-inactive)' }}>
                  {active && (
                    <motion.div layoutId="adminBottomNav"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                      style={{ background: 'var(--brand-green)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                  )}
                  <Icon className="w-4 h-4" />
                  <span className="font-medium leading-none truncate max-w-full px-0.5"
                    style={{ fontSize: '0.55rem' }}>
                    {label === 'Configuración' ? 'Config.' : label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
