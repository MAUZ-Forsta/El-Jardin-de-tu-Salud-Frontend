import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  User, ShoppingBag, Star, ChevronDown, ChevronUp,
  Check, Lock, Eye, EyeOff, Package, Truck, CheckCircle2, XCircle,
  Edit3, Save, AlertTriangle, MapPin, Phone, Mail, Globe, Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import type { Purchase } from '../context/AuthContext';

type Tab = 'profile' | 'orders' | 'reviews';

const COUNTRIES = [
  'México','Colombia','Argentina','España','Chile','Perú',
  'Venezuela','Ecuador','Bolivia','Uruguay',
];

/* ── Star Rating ─────────────────────────────────────────── */
function StarRating({
  value, onChange, size = 'md', readonly,
}: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' | 'lg'; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  const px = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" disabled={readonly}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${px} transition-transform ${!readonly ? 'active:scale-110' : 'cursor-default'}`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Star className={`${px} transition-colors`}
            style={{ color: s <= (hovered || value) ? 'var(--brand-orange)' : '#e5e7eb' }}
            fill={s <= (hovered || value) ? 'var(--brand-orange)' : 'none'} />
        </button>
      ))}
    </div>
  );
}

/* ── Status config ───────────────────────────────────────── */
const STATUS_CONFIG = {
  preparing: { label: 'En preparación', color: 'var(--brand-orange)', bg: '#fff7ed', Icon: Package },
  shipped:   { label: 'Enviado',        color: '#1565c0', bg: '#e3f2fd', Icon: Truck },
  delivered: { label: 'Entregado',      color: 'var(--brand-green)', bg: 'var(--brand-section-green)', Icon: CheckCircle2 },
  cancelled: { label: 'Cancelado',      color: '#b91c1c', bg: '#fef2f2', Icon: XCircle },
} as const;

function StatusPill({ status }: { status: Purchase['status'] }) {
  const { label, color, bg, Icon } = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color, background: bg }}>
      <Icon className="w-3 h-3" />{label}
    </span>
  );
}

/* ── Order Card ──────────────────────────────────────────── */
function OrderCard({ purchase, onCancel }: { purchase: Purchase; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const canCancel = purchase.status === 'preparing';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header row — always visible */}
      <button
        className="w-full text-left px-4 py-4"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--brand-section-green)' }}>
              <ShoppingBag className="w-5 h-5" style={{ color: 'var(--brand-green)' }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--brand-green)' }}>
                #JDS-{purchase.orderNumber}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(purchase.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusPill status={purchase.status} />
            <p className="text-sm font-bold" style={{ color: 'var(--brand-green)' }}>${purchase.total.toFixed(2)}</p>
          </div>
        </div>
        {/* Item thumbnails preview */}
        <div className="flex items-center gap-1.5 mt-3 justify-between">
          <div className="flex -space-x-2">
            {purchase.items.slice(0, 3).map(item => (
              <img key={item.productId} src={item.productImage} alt={item.productName}
                className="w-8 h-8 rounded-lg object-cover border-2 border-white" />
            ))}
            {purchase.items.length > 3 && (
              <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center">
                <span className="text-xs font-bold text-gray-500">+{purchase.items.length - 3}</span>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Ocultar' : 'Ver detalle'}
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-50 px-4 pt-4 pb-4 space-y-3">
              {/* Products */}
              {purchase.items.map(item => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.productImage} alt={item.productName}
                    className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--brand-green)' }}>{item.productName}</p>
                    <p className="text-xs text-gray-400">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold shrink-0" style={{ color: 'var(--brand-green)' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              {/* Address */}
              <div className="flex items-start gap-2 pt-1 border-t border-gray-50">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500">{purchase.shippingAddress}</p>
              </div>

              {/* Tracking steps */}
              <div className="flex items-center gap-0 mt-1">
                {(['preparing', 'shipped', 'delivered'] as const).map((s, i) => {
                  const cfg = STATUS_CONFIG[s];
                  const statuses: Purchase['status'][] = ['preparing', 'shipped', 'delivered', 'cancelled'];
                  const currentIdx = statuses.indexOf(purchase.status);
                  const stepIdx = i;
                  const isDone = purchase.status === 'cancelled'
                    ? false
                    : currentIdx > stepIdx || (currentIdx === stepIdx && purchase.status !== 'cancelled');
                  return (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: isDone ? cfg.bg : '#f3f4f6' }}>
                          <cfg.Icon className="w-3.5 h-3.5" style={{ color: isDone ? cfg.color : '#d1d5db' }} />
                        </div>
                        <span className="text-xs" style={{ color: isDone ? cfg.color : '#9ca3af', fontSize: '0.6rem' }}>
                          {s === 'preparing' ? 'Prep.' : s === 'shipped' ? 'Envío' : 'Entrega'}
                        </span>
                      </div>
                      {i < 2 && (
                        <div className="flex-1 h-0.5 -mt-4"
                          style={{ background: isDone && currentIdx > stepIdx ? 'var(--brand-green)' : '#e5e7eb' }} />
                      )}
                    </div>
                  );
                })}
                {purchase.status === 'cancelled' && (
                  <div className="flex items-center gap-1.5 ml-3">
                    <XCircle className="w-4 h-4" style={{ color: '#b91c1c' }} />
                    <span className="text-xs font-semibold" style={{ color: '#b91c1c' }}>Cancelado</span>
                  </div>
                )}
              </div>

              {/* Cancel action */}
              {canCancel && (
                <div className="pt-1 border-t border-gray-50">
                  {!confirmCancel ? (
                    <button
                      onClick={() => setConfirmCancel(true)}
                      className="w-full py-3 rounded-xl border-2 text-sm font-semibold transition-colors"
                      style={{ borderColor: '#fca5a5', color: '#b91c1c', background: '#fef2f2' }}
                    >
                      Cancelar pedido
                    </button>
                  ) : (
                    <div className="rounded-xl border border-red-100 bg-red-50 p-3 space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-700 font-medium leading-relaxed">
                          ¿Seguro que quieres cancelar este pedido? Esta acción no se puede deshacer.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setConfirmCancel(false)}
                          className="py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 bg-white">
                          Mantener
                        </button>
                        <button
                          onClick={() => { onCancel(purchase.id); setConfirmCancel(false); setExpanded(false); }}
                          className="py-2.5 rounded-xl text-white text-sm font-semibold"
                          style={{ background: '#b91c1c' }}>
                          Sí, cancelar
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-center text-gray-400 mt-2">
                    Solo puedes cancelar pedidos en preparación
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Reviewable Item ─────────────────────────────────────── */
function ReviewableItem({
  item, existingReview, onSubmit,
}: {
  item: { productId: string; productName: string; productImage: string; price: number };
  existingReview?: { rating: number; text: string; date: string } | null;
  onSubmit: (productId: string, productName: string, productImage: string, rating: number, text: string) => void;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [text, setText] = useState(existingReview?.text ?? '');
  const [editing, setEditing] = useState(!existingReview);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    onSubmit(item.productId, item.productName, item.productImage, rating, text);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Product row */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-50">
        <img src={item.productImage} alt={item.productName}
          className="w-14 h-14 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--brand-green)' }}>
            {item.productName}
          </p>
          {existingReview && !editing && (
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(existingReview.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
          <div className="mt-1.5">
            <StarRating value={rating} onChange={editing ? setRating : undefined} size="sm" readonly={!editing} />
          </div>
        </div>
        {existingReview && !editing && (
          <button onClick={() => setEditing(true)}
            className="shrink-0 p-2.5 rounded-xl active:bg-gray-100"
            style={{ color: 'var(--brand-green)' }}>
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Review body */}
      <div className="p-4">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={3}
              placeholder="Cuéntanos tu experiencia con este producto..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              {existingReview && (
                <button type="button"
                  onClick={() => { setRating(existingReview.rating); setText(existingReview.text); setEditing(false); }}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-500">
                  Cancelar
                </button>
              )}
              <button type="submit" disabled={!rating}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                style={{ background: 'var(--brand-green)' }}>
                <Save className="w-4 h-4" />
                {existingReview ? 'Actualizar' : 'Publicar reseña'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            {text ? (
              <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Sin comentario escrito</p>
            )}
            {saved && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 mt-2 text-xs font-medium" style={{ color: 'var(--brand-green)' }}>
                <Check className="w-3.5 h-3.5" /> Reseña guardada
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Field row (read-only display) ──────────────────────── */
function FieldRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: 'var(--brand-section-green)' }}>
        <Icon className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-700 truncate">{value}</p>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function UserProfile() {
  const { user, updateUser, cancelPurchase, getUserPurchases, getUserReviews, addReview } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Purchase['status'] | 'all'>('all');

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
    country: user?.country ?? 'México',
    zip: user?.zip ?? '',
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 mx-auto"
          style={{ background: 'var(--brand-section-green)' }}>
          <User className="w-10 h-10" style={{ color: 'var(--brand-green)' }} />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Inicia sesión</h2>
        <p className="text-sm text-gray-400 mb-6">Accede a tu perfil, pedidos y reseñas</p>
        <button onClick={() => navigate('/')}
          className="px-8 py-3.5 rounded-2xl text-white font-semibold"
          style={{ background: 'var(--brand-green)' }}>Ir al inicio</button>
      </div>
    );
  }

  const purchases = getUserPurchases(user.id);
  const myReviews = getUserReviews(user.id);

  const filteredPurchases = filterStatus === 'all'
    ? purchases
    : purchases.filter(p => p.status === filterStatus);

  const reviewableItems = (() => {
    const seen = new Set<string>();
    const result: { productId: string; productName: string; productImage: string; price: number }[] = [];
    for (const p of purchases) {
      if (p.status !== 'delivered') continue;
      for (const item of p.items) {
        if (!seen.has(item.productId)) {
          seen.add(item.productId);
          result.push({ productId: item.productId, productName: item.productName, productImage: item.productImage, price: item.price });
        }
      }
    }
    return result;
  })();

  const setF = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(user.id, form);
    setEditingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next.length < 6) { setPwError('Mínimo 6 caracteres'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Las contraseñas no coinciden'); return; }
    setPwError('');
    setPwForm({ current: '', next: '', confirm: '' });
    setShowPwForm(false);
  };

  const handleReview = (productId: string, productName: string, productImage: string, rating: number, text: string) => {
    addReview({ userId: user.id, productId, productName, productImage, rating, text, date: new Date().toISOString().split('T')[0] });
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateUser(user.id, { avatar: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const TABS: { id: Tab; label: string; Icon: React.ElementType; count?: number }[] = [
    { id: 'profile', label: 'Perfil', Icon: User },
    { id: 'orders', label: 'Pedidos', Icon: ShoppingBag, count: purchases.length },
    { id: 'reviews', label: 'Reseñas', Icon: Star, count: myReviews.length },
  ];

  const hue = (parseInt(user.id || '1') * 47 + 120) % 360;
  const avatarBg = user.role === 'admin' ? 'var(--brand-orange)' : `hsl(${hue}, 52%, 38%)`;

  return (
    <div className="min-h-screen" style={{ background: 'var(--brand-section-warm)' }}>
      {/* ── Profile hero ─────────────────────────────────── */}
      <div className="px-4 pt-6 pb-0" style={{ background: 'var(--card)' }}>
        <div className="flex items-center gap-4 pb-5">
          {/* Avatar — tappable to change photo */}
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="relative shrink-0 group"
            aria-label="Cambiar foto de perfil"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover shadow" />
            ) : (
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow"
                style={{ background: avatarBg }}>
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            {/* Overlay on hover/press */}
            <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.45)' }}>
              <Camera className="w-5 h-5 text-white" />
            </div>
            {/* Small camera badge */}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center">
              <Camera className="w-3 h-3" style={{ color: 'var(--brand-green)' }} />
            </span>
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
            onChange={handleAvatarFile} />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate" style={{ color: 'var(--brand-green)' }}>{user.name}</h1>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Desde {new Date(user.joinedAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 text-right">
            <span className="text-lg font-bold" style={{ color: 'var(--brand-green)' }}>{purchases.length}</span>
            <span className="text-xs text-gray-400">pedidos</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-t border-gray-100">
          {TABS.map(({ id, label, Icon, count }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors"
                style={{ color: isActive ? 'var(--brand-green)' : '#9ca3af' }}>
                {isActive && (
                  <motion.div layoutId="profileTab"
                    className="absolute top-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: 'var(--brand-green)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }} />
                )}
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {count !== undefined && count > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: 'var(--brand-orange)', fontSize: '0.55rem' }}>
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="px-4 py-5 space-y-4"
        >

          {/* ── PROFILE TAB ─────────────────────────────── */}
          {activeTab === 'profile' && (
            <>
              {/* Personal data card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
                  <p className="font-semibold text-sm text-gray-700">Datos personales</p>
                  {!editingProfile ? (
                    <button onClick={() => setEditingProfile(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
                      style={{ color: 'var(--brand-green)', background: 'var(--brand-section-green)' }}>
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                  ) : (
                    <button onClick={() => setEditingProfile(false)}
                      className="px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-50">
                      Cancelar
                    </button>
                  )}
                </div>

                {profileSaved && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 px-4 py-3 border-b border-gray-50"
                    style={{ background: 'var(--brand-section-green)' }}>
                    <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--brand-green)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--brand-green)' }}>
                      Cambios guardados correctamente
                    </span>
                  </motion.div>
                )}

                {editingProfile ? (
                  <form onSubmit={handleSaveProfile} className="p-4 space-y-3">
                    {[
                      { key: 'name', label: 'Nombre completo', type: 'text' },
                      { key: 'email', label: 'Correo electrónico', type: 'email' },
                      { key: 'phone', label: 'Teléfono', type: 'tel' },
                      { key: 'address', label: 'Dirección', type: 'text' },
                      { key: 'city', label: 'Ciudad', type: 'text' },
                      { key: 'zip', label: 'Código postal', type: 'text' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{f.label}</label>
                        <input type={f.type} value={(form as Record<string, string>)[f.key]}
                          onChange={e => setF(f.key, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">País</label>
                      <select value={form.country} onChange={e => setF('country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none">
                        {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <button type="submit"
                      className="w-full py-4 rounded-xl text-white font-semibold text-sm mt-1"
                      style={{ background: 'var(--brand-green)' }}>
                      Guardar cambios
                    </button>
                  </form>
                ) : (
                  <div className="px-4">
                    <FieldRow icon={Mail} label="Correo" value={user.email} />
                    <FieldRow icon={Phone} label="Teléfono" value={user.phone} />
                    <FieldRow icon={MapPin} label="Dirección" value={user.address} />
                    <FieldRow icon={MapPin} label="Ciudad" value={user.city} />
                    <FieldRow icon={Globe} label="País" value={user.country} />
                    {!user.phone && !user.address && (
                      <div className="py-4 text-center">
                        <p className="text-sm text-gray-400">Completa tu perfil para agilizar tus compras</p>
                        <button onClick={() => setEditingProfile(true)}
                          className="mt-2 text-sm font-medium underline underline-offset-2"
                          style={{ color: 'var(--brand-green)' }}>
                          Añadir datos
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Password card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-section-green)' }}>
                      <Lock className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Contraseña</p>
                      <p className="text-xs text-gray-400">Seguridad de la cuenta</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPwForm(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
                    style={{ color: 'var(--brand-green)', background: 'var(--brand-section-green)' }}>
                    <Edit3 className="w-3.5 h-3.5" /> Cambiar
                  </button>
                </div>

                <AnimatePresence>
                  {showPwForm && (
                    <motion.form onSubmit={handleSavePassword}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-4">
                        {[
                          { key: 'current', label: 'Contraseña actual' },
                          { key: 'next', label: 'Nueva contraseña' },
                          { key: 'confirm', label: 'Confirmar nueva' },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{f.label}</label>
                            <div className="relative">
                              <input type={showPw ? 'text' : 'password'} required
                                value={(pwForm as Record<string, string>)[f.key]}
                                onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                                className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
                              {f.key === 'next' && (
                                <button type="button" onClick={() => setShowPw(v => !v)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-0.5">
                                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {pwError && <p className="text-xs text-red-500 font-medium">{pwError}</p>}
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={() => { setShowPwForm(false); setPwError(''); }}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
                            Cancelar
                          </button>
                          <button type="submit"
                            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold"
                            style={{ background: 'var(--brand-green)' }}>
                            Actualizar
                          </button>
                        </div>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* ── ORDERS TAB ──────────────────────────────── */}
          {activeTab === 'orders' && (
            <>
              {purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
                    style={{ background: 'var(--brand-section-green)' }}>
                    <ShoppingBag className="w-10 h-10" style={{ color: '#d1d5db' }} />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">Aún no tienes pedidos</p>
                  <p className="text-sm text-gray-400 mb-6">¡Explora nuestra tienda y haz tu primer pedido!</p>
                  <button onClick={() => navigate('/tienda')}
                    className="px-8 py-3.5 rounded-2xl text-white font-semibold"
                    style={{ background: 'var(--brand-green)' }}>
                    Ir a la tienda
                  </button>
                </div>
              ) : (
                <>
                  {/* Status filter chips */}
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
                    {(['all', 'preparing', 'shipped', 'delivered', 'cancelled'] as const).map(s => {
                      const isSelected = filterStatus === s;
                      const count = s === 'all' ? purchases.length : purchases.filter(p => p.status === s).length;
                      const cfg = s !== 'all' ? STATUS_CONFIG[s] : null;
                      return (
                        <button key={s} onClick={() => setFilterStatus(s)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-all"
                          style={isSelected
                            ? { background: cfg?.bg ?? 'var(--brand-section-green)', color: cfg?.color ?? 'var(--brand-green)', borderColor: cfg?.color ?? 'var(--brand-green)' }
                            : { background: 'var(--card)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}>
                          {s === 'all' ? 'Todos' : STATUS_CONFIG[s].label}
                          <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-white font-bold"
                            style={{ background: isSelected ? (cfg?.color ?? 'var(--brand-green)') : '#9ca3af', fontSize: '0.55rem' }}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {filteredPurchases.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      No hay pedidos con este estado
                    </div>
                  ) : (
                    filteredPurchases.map(p => (
                      <OrderCard key={p.id} purchase={p} onCancel={cancelPurchase} />
                    ))
                  )}
                </>
              )}
            </>
          )}

          {/* ── REVIEWS TAB ─────────────────────────────── */}
          {activeTab === 'reviews' && (
            <>
              {reviewableItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
                    style={{ background: '#fff7ed' }}>
                    <Star className="w-10 h-10" style={{ color: 'var(--brand-orange)' }} />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">Aún sin reseñas disponibles</p>
                  <p className="text-sm text-gray-400">Podrás reseñar productos una vez que tu pedido sea entregado</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-400">
                    {myReviews.length} de {reviewableItems.length} producto{reviewableItems.length !== 1 ? 's' : ''} reseñados
                  </p>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden -mt-1">
                    <motion.div className="h-full rounded-full"
                      style={{ background: 'var(--brand-orange)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(myReviews.length / reviewableItems.length) * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }} />
                  </div>

                  {reviewableItems.map(item => {
                    const existing = myReviews.find(r => r.productId === item.productId);
                    return (
                      <ReviewableItem key={item.productId} item={item}
                        existingReview={existing ? { rating: existing.rating, text: existing.text, date: existing.date } : null}
                        onSubmit={handleReview} />
                    );
                  })}
                </>
              )}
            </>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
