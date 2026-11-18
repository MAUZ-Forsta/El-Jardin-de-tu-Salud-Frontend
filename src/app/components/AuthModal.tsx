import { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Eye, EyeOff, Leaf, User, Lock, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthModal({ open, onClose, defaultTab = 'login', onSuccess }: Props) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ name: '', email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(loginData.email, loginData.password);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? 'Error al iniciar sesión'); return; }
    if (res.user?.role === 'admin') { onClose(); navigate('/admin'); return; }
    onSuccess?.();
    onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regData.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    setError('');
    const res = await register(regData.name, regData.email, regData.password);
    setLoading(false);
    if (!res.ok) { setError(res.error ?? 'Error al registrarse'); return; }
    onSuccess?.();
    onClose();
  };

  const switchTab = (t: 'login' | 'register') => { setTab(t); setError(''); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4" style={{ background: 'var(--brand-green)' }}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">El Jardín de tu Salud</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Tu comunidad de bienestar natural</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
                {(['login', 'register'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                    style={tab === t
                      ? { background: 'var(--card)', color: 'var(--brand-green)' }
                      : { color: 'rgba(255,255,255,0.7)' }}
                  >
                    {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-100">
                  {error}
                </div>
              )}

              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email" required placeholder="tu@correo.com"
                        value={loginData.email}
                        onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2"
                        style={{ outlineColor: 'var(--brand-green)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPass ? 'text' : 'password'} required placeholder="••••••••"
                        value={loginData.password}
                        onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2"
                        style={{ outlineColor: 'var(--brand-green)' }}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ background: 'var(--brand-green)' }}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </button>

                  {/* Admin hint */}
                  <div className="p-3 rounded-xl text-xs" style={{ background: 'var(--brand-section-green)' }}>
                    <p className="font-medium mb-1" style={{ color: 'var(--brand-green)' }}>Credenciales de demo:</p>
                    <p className="text-gray-600">Admin: <strong>admin@jardin.com</strong> / <strong>admin123</strong></p>
                    <p className="text-gray-600">Usuario: <strong>maria@email.com</strong> / <strong>pass123</strong></p>
                  </div>

                  <p className="text-center text-sm text-gray-500">
                    ¿No tienes cuenta?{' '}
                    <button type="button" onClick={() => switchTab('register')}
                      className="font-medium hover:underline" style={{ color: 'var(--brand-green)' }}>
                      Regístrate gratis
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" required placeholder="Juan García"
                        value={regData.name}
                        onChange={e => setRegData(p => ({ ...p, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2"
                        style={{ outlineColor: 'var(--brand-green)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email" required placeholder="tu@correo.com"
                        value={regData.email}
                        onChange={e => setRegData(p => ({ ...p, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2"
                        style={{ outlineColor: 'var(--brand-green)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPass ? 'text' : 'password'} required placeholder="Mínimo 6 caracteres"
                        value={regData.password}
                        onChange={e => setRegData(p => ({ ...p, password: e.target.value }))}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2"
                        style={{ outlineColor: 'var(--brand-green)' }}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ background: 'var(--brand-orange)' }}>
                    {loading ? 'Creando cuenta...' : 'Crear mi cuenta gratis'}
                  </button>
                  <p className="text-center text-sm text-gray-500">
                    ¿Ya tienes cuenta?{' '}
                    <button type="button" onClick={() => switchTab('login')}
                      className="font-medium hover:underline" style={{ color: 'var(--brand-green)' }}>
                      Inicia sesión
                    </button>
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
