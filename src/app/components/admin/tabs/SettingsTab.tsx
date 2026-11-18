import { useState } from 'react';
import { CreditCard, Check, Eye, EyeOff, Link, Unlink, Bell, Lock, User, Shield, Tag, Plus, Pencil, Trash2, X, Percent } from 'lucide-react';
import { motion } from 'motion/react';
import type { DiscountRule } from '../../../context/AuthContext';

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

interface PaymentAccount {
  platform: 'paypal' | 'mercadopago';
  email: string;
  connected: boolean;
}

interface Props {
  discountRules: DiscountRule[];
  setDiscountRules: React.Dispatch<React.SetStateAction<DiscountRule[]>>;
  onLogout: () => void;
}

export default function SettingsTab({ discountRules, setDiscountRules, onLogout }: Props) {
  // Profile
  const [profile, setProfile] = useState({ name: 'Admin Jardín', email: 'admin@jardin.com' });
  const [profileSaved, setProfileSaved] = useState(false);

  // Security
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSaved, setPwdSaved] = useState(false);

  // Cards
  const [cards, setCards] = useState<CardData[]>([
    { number: '•••• •••• •••• 4521', name: 'ADMIN JARDÍN', expiry: '09/27', cvv: '•••' },
  ]);
  const [addingCard, setAddingCard] = useState(false);
  const [newCard, setNewCard] = useState<CardData>({ number: '', name: '', expiry: '', cvv: '' });
  const [showCvv, setShowCvv] = useState(false);

  // Payment accounts
  const [accounts, setAccounts] = useState<PaymentAccount[]>([
    { platform: 'paypal', email: '', connected: false },
    { platform: 'mercadopago', email: '', connected: false },
  ]);
  const [accountInputs, setAccountInputs] = useState<Record<string, string>>({ paypal: '', mercadopago: '' });

  // Discounts
  const [discountForm, setDiscountForm] = useState<{ name: string; type: 'percentage' | 'fixed'; value: string }>({ name: '', type: 'percentage', value: '' });
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [addingDiscount, setAddingDiscount] = useState(false);
  const [deleteDiscountId, setDeleteDiscountId] = useState<string | null>(null);

  const openNewDiscount = () => {
    setDiscountForm({ name: '', type: 'percentage', value: '' });
    setEditingDiscountId(null);
    setAddingDiscount(true);
  };
  const openEditDiscount = (rule: DiscountRule) => {
    setDiscountForm({ name: rule.name, type: rule.type, value: String(rule.value) });
    setEditingDiscountId(rule.id);
    setAddingDiscount(true);
  };
  const saveDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const rule: DiscountRule = {
      id: editingDiscountId ?? Date.now().toString(),
      name: discountForm.name,
      type: discountForm.type,
      value: Number(discountForm.value),
    };
    if (editingDiscountId) {
      setDiscountRules(prev => prev.map(r => r.id === editingDiscountId ? rule : r));
    } else {
      setDiscountRules(prev => [...prev, rule]);
    }
    setAddingDiscount(false);
    setEditingDiscountId(null);
  };
  const deleteDiscount = (id: string) => {
    setDiscountRules(prev => prev.filter(r => r.id !== id));
    setDeleteDiscountId(null);
  };

  // Notifications
  const [notifs, setNotifs] = useState({
    newOrder: true, newUser: true, lowStock: true, comment: false, revenue: true,
  });

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 6) { setPwdError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Las contraseñas no coinciden'); return; }
    setPwdError('');
    setPwdSaved(true);
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setTimeout(() => setPwdSaved(false), 2500);
  };

  const saveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const masked = `•••• •••• •••• ${newCard.number.slice(-4)}`;
    setCards(prev => [...prev, { ...newCard, number: masked, cvv: '•••' }]);
    setNewCard({ number: '', name: '', expiry: '', cvv: '' });
    setAddingCard(false);
  };

  const toggleAccount = (platform: 'paypal' | 'mercadopago') => {
    const email = accountInputs[platform].trim();
    setAccounts(prev => prev.map(a => a.platform === platform
      ? a.connected ? { ...a, connected: false, email: '' } : { ...a, connected: true, email }
      : a
    ));
  };

  const platformMeta = {
    paypal: { name: 'PayPal', color: '#003087', bg: '#e8f0fe', logo: '🅿️' },
    mercadopago: { name: 'MercadoPago', color: '#009ee3', bg: '#e0f4fc', logo: '💳' },
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--brand-green)' }}>Configuración</h2>
        <p className="text-sm text-gray-400">Administra tu perfil y métodos de cobro</p>
      </div>

      {/* ─── Profile ─── */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
          <h3 className="font-semibold text-gray-700">Perfil personal</h3>
        </div>
        <form onSubmit={saveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Nombre</label>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
            </div>
          </div>
          <button type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: profileSaved ? '#2e7d32' : 'var(--brand-green)' }}>
            {profileSaved ? <><Check className="w-4 h-4" /> Guardado</> : 'Guardar perfil'}
          </button>
        </form>
      </section>

      {/* ─── Security ─── */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
          <h3 className="font-semibold text-gray-700">Seguridad</h3>
        </div>
        <form onSubmit={savePassword} className="space-y-3">
          {[
            { label: 'Contraseña actual', val: currentPwd, set: setCurrentPwd },
            { label: 'Nueva contraseña', val: newPwd, set: setNewPwd },
            { label: 'Confirmar nueva contraseña', val: confirmPwd, set: setConfirmPwd },
          ].map(({ label, val, set }) => (
            <div key={label} className="relative">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
              <input
                type={showPwd ? 'text' : 'password'} required value={val}
                onChange={e => set(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 bottom-2.5 text-gray-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ))}
          {pwdError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{pwdError}</p>}
          <button type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: pwdSaved ? '#2e7d32' : 'var(--brand-green)' }}>
            {pwdSaved ? <><Check className="w-4 h-4" /> Contraseña actualizada</> : 'Cambiar contraseña'}
          </button>
        </form>
      </section>

      {/* ─── Cards ─── */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
            <h3 className="font-semibold text-gray-700">Tarjetas bancarias</h3>
          </div>
          <button onClick={() => setAddingCard(v => !v)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--brand-section-green)', color: 'var(--brand-green)' }}>
            + Añadir tarjeta
          </button>
        </div>

        <div className="space-y-3">
          {cards.map((card, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
              <div className="w-10 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}>
                VISA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">{card.number}</p>
                <p className="text-xs text-gray-400">{card.name} · Vence {card.expiry}</p>
              </div>
              <Shield className="w-4 h-4 text-green-400" />
            </div>
          ))}
        </div>

        {addingCard && (
          <form onSubmit={saveCard} className="mt-4 space-y-3 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Número de tarjeta</label>
              <input required maxLength={19} placeholder="1234 5678 9012 3456"
                value={newCard.number}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                  setNewCard(p => ({ ...p, number: raw.replace(/(.{4})/g, '$1 ').trim() }));
                }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Nombre en tarjeta</label>
              <input required placeholder="NOMBRE APELLIDO"
                value={newCard.name}
                onChange={e => setNewCard(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Vencimiento</label>
                <input required placeholder="MM/AA" maxLength={5}
                  value={newCard.expiry}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setNewCard(p => ({ ...p, expiry: v.length >= 2 ? v.slice(0, 2) + '/' + v.slice(2) : v }));
                  }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">CVV</label>
                <input required maxLength={4} placeholder="•••"
                  type={showCvv ? 'text' : 'password'}
                  value={newCard.cvv}
                  onChange={e => setNewCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))}
                  className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
                <button type="button" onClick={() => setShowCvv(v => !v)} className="absolute right-3 bottom-2.5 text-gray-400">
                  {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setAddingCard(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
                Cancelar
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: 'var(--brand-green)' }}>
                Guardar tarjeta
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ─── Payment Platforms ─── */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Link className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
          <h3 className="font-semibold text-gray-700">Plataformas de cobro</h3>
        </div>
        <div className="space-y-4">
          {accounts.map(account => {
            const meta = platformMeta[account.platform];
            return (
              <div key={account.platform} className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{meta.logo}</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-700">{meta.name}</p>
                      {account.connected && account.email && (
                        <p className="text-xs text-gray-400">{account.email}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    account.connected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {account.connected ? '✓ Conectado' : 'Desconectado'}
                  </span>
                </div>
                {!account.connected && (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder={`Email de ${meta.name}`}
                      value={accountInputs[account.platform]}
                      onChange={e => setAccountInputs(p => ({ ...p, [account.platform]: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none"
                    />
                    <button
                      onClick={() => toggleAccount(account.platform)}
                      disabled={!accountInputs[account.platform].includes('@')}
                      className="px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
                      style={{ background: meta.color }}>
                      Conectar
                    </button>
                  </div>
                )}
                {account.connected && (
                  <button onClick={() => toggleAccount(account.platform)}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium">
                    <Unlink className="w-3.5 h-3.5" /> Desconectar cuenta
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Discounts ─── */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
            <div>
              <h3 className="font-semibold text-gray-700">Descuentos</h3>
              <p className="text-xs text-gray-400">Reglas que puedes activar por producto</p>
            </div>
          </div>
          <button onClick={openNewDiscount}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl"
            style={{ background: 'var(--brand-section-green)', color: 'var(--brand-green)' }}>
            <Plus className="w-3.5 h-3.5" /> Nueva regla
          </button>
        </div>

        {/* Discount list */}
        <div className="space-y-2">
          {discountRules.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No hay reglas de descuento</p>
          )}
          {discountRules.map(rule => (
            <div key={rule.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: rule.type === 'percentage' ? 'var(--brand-section-green)' : '#fff8f0' }}>
                {rule.type === 'percentage'
                  ? <Percent className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
                  : <span className="text-sm font-bold" style={{ color: 'var(--brand-orange)' }}>$</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">{rule.name}</p>
                <p className="text-xs text-gray-400">
                  {rule.type === 'percentage' ? `${rule.value}% de descuento` : `$${rule.value} de rebaja`}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEditDiscount(rule)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50"
                  style={{ color: 'var(--brand-green)' }}>
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {deleteDiscountId === rule.id ? (
                  <>
                    <button onClick={() => deleteDiscount(rule.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteDiscountId(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => setDeleteDiscountId(rule.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add/edit form */}
        {addingDiscount && (
          <form onSubmit={saveDiscount} className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {editingDiscountId ? 'Editar regla' : 'Nueva regla de descuento'}
            </h4>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Nombre</label>
              <input required placeholder="Ej: Descuento de temporada"
                value={discountForm.name}
                onChange={e => setDiscountForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Tipo</label>
                <select value={discountForm.type}
                  onChange={e => setDiscountForm(p => ({ ...p, type: e.target.value as 'percentage' | 'fixed' }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none">
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  {discountForm.type === 'percentage' ? 'Porcentaje' : 'Monto'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    {discountForm.type === 'percentage' ? '%' : '$'}
                  </span>
                  <input required type="number" min="0.01" step="0.01"
                    max={discountForm.type === 'percentage' ? 100 : undefined}
                    placeholder={discountForm.type === 'percentage' ? '10' : '5.00'}
                    value={discountForm.value}
                    onChange={e => setDiscountForm(p => ({ ...p, value: e.target.value }))}
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
                </div>
              </div>
            </div>
            {discountForm.value && (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--brand-section-green)' }}>
                <Tag className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--brand-green)' }} />
                <p className="text-xs text-gray-600">
                  Precio de <span className="font-bold">$20.00</span> quedaría en{' '}
                  <span className="font-bold" style={{ color: 'var(--brand-green)' }}>
                    {discountForm.type === 'percentage'
                      ? `$${(20 * (1 - Number(discountForm.value) / 100)).toFixed(2)}`
                      : `$${(20 - Number(discountForm.value)).toFixed(2)}`}
                  </span>
                  {discountForm.type === 'percentage' && ` (−${discountForm.value}%)`}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setAddingDiscount(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
                Cancelar
              </button>
              <button type="submit"
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: 'var(--brand-green)' }}>
                {editingDiscountId ? 'Guardar cambios' : 'Crear regla'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ─── Notifications ─── */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
          <h3 className="font-semibold text-gray-700">Notificaciones</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'newOrder', label: 'Nuevos pedidos', desc: 'Cuando llega un pedido nuevo' },
            { key: 'newUser', label: 'Nuevos usuarios', desc: 'Cuando un usuario se registra' },
            { key: 'lowStock', label: 'Stock bajo', desc: 'Cuando un producto tiene menos de 10 unidades' },
            { key: 'comment', label: 'Nuevos comentarios', desc: 'Cuando un usuario deja una reseña' },
            { key: 'revenue', label: 'Reporte semanal', desc: 'Resumen de ingresos cada lunes' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <button
                onClick={() => setNotifs(p => ({ ...p, [key]: !p[key as keyof typeof notifs] }))}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: notifs[key as keyof typeof notifs] ? 'var(--brand-green)' : '#e5e7eb' }}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  animate={{ left: notifs[key as keyof typeof notifs] ? '1.375rem' : '0.25rem' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
      {/* ─── Logout (mobile only) ─── */}
      <section className="lg:hidden bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 font-semibold text-sm border border-red-100 hover:bg-red-50 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </section>
    </div>
  );
}
