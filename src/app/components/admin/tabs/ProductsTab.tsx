/**
 * ProductsTab — gestión CRUD de productos del catálogo.
 *
 * ARQUITECTURA MOBILE-FIRST
 * ─────────────────────────
 * • Base styles → móvil (< 640 px): lista de tarjetas compactas
 *   (imagen + nombre + precio + acciones).
 * • sm: (≥ 640 px) → tabla completa con columnas adicionales.
 * • El drawer ocupa 100 % del ancho en móvil; max-w-md actúa solo en sm+.
 *
 * COMPOSABLES UTILIZADOS
 * ──────────────────────
 * • useDrawer<Product>   — abre/cierra el panel de edición y guarda el
 *                          item en edición sin duplicar useState.
 * • useDeleteConfirm     — patrón double-confirm; crítico en móvil donde
 *                          un tap accidental eliminaría datos irreversibles.
 * • useSearch            — query + filtro por categoría con useMemo.
 * • useDiscountPrice     — cálculo de precio efectivo en el formulario
 *                          (preview en tiempo real antes de guardar).
 * • useDirtyForm         — rastrea cambios sin guardar; muestra badge
 *                          "Sin guardar" y confirm de descarte.
 */
import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Check, SlidersHorizontal, Tag, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Product } from '../../../data';
import type { DiscountRule } from '../../../context/AuthContext';
import { getEffectivePrice } from '../../../context/AuthContext';
import { useDrawer, useDeleteConfirm, useSearch, useDiscountPrice, useDirtyForm } from '../../../hooks';
import ImageUploader from '../../ImageUploader';

interface Props {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  discountRules: DiscountRule[];
}

const CATEGORIES = ['plantas', 'tes', 'tinturas', 'aceites', 'suplementos'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  plantas: 'Plantas', tes: 'Tés', tinturas: 'Tinturas', aceites: 'Aceites', suplementos: 'Suplementos',
};

/* ── Predicado para useSearch ────────────────────────────── */
const productPredicate = (p: Product, query: string, cat: string) =>
  p.name.toLowerCase().includes(query.toLowerCase()) &&
  (cat === 'todas' || p.category === cat);

/* ── TagInput (presentational) ───────────────────────────── */
function TagInput({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
  };
  return (
    <div className="border border-gray-200 rounded-xl p-2.5 bg-gray-50">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-white font-medium"
            style={{ background: 'var(--brand-green)' }}>
            {tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}>
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        placeholder={placeholder ?? 'Escribe y presiona Enter'}
        className="w-full text-sm bg-transparent focus:outline-none min-h-[28px]" />
    </div>
  );
}

/* ── ProductForm — usa useDirtyForm + useDiscountPrice ───── */
function ProductForm({ title, initial, onSave, onClose, discountRules }: {
  title: string;
  initial: Partial<Product> | null;
  onSave: (data: Omit<Product, 'id' | 'rating' | 'reviews'> & { id?: string }) => void;
  onClose: () => void;
  discountRules: DiscountRule[];
}) {
  const seed = initial
    ? { ...initial, originalPrice: initial.originalPrice ?? initial.price }
    : {};

  const defaultValues = {
    name: '', category: 'plantas' as Product['category'],
    price: 0, originalPrice: undefined as number | undefined,
    image: '', description: '', benefits: [] as string[],
    usage: '', stock: 0, badge: undefined as string | undefined,
    discountId: undefined as string | undefined, discountEnabled: false,
  };

  const { form, set, isDirty } = useDirtyForm({ ...defaultValues, ...seed });
  const [confirmingClose, setConfirmingClose] = useState(false);

  const basePrice = Number(form.originalPrice) || 0;
  const { activeRule, computedPrice, discountLabel } = useDiscountPrice(
    basePrice, !!form.discountEnabled, form.discountId, discountRules
  );

  const requestClose = () => isDirty ? setConfirmingClose(true) : onClose();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: (form as { id?: string }).id,
      name: form.name,
      category: form.category,
      price: computedPrice,
      originalPrice: form.discountEnabled && activeRule ? basePrice : undefined,
      image: form.image,
      description: form.description,
      benefits: form.benefits,
      usage: form.usage,
      stock: Number(form.stock),
      badge: form.badge || undefined,
      discountId: form.discountEnabled ? form.discountId : undefined,
      discountEnabled: form.discountEnabled,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--brand-green)' }}>{title}</h3>
          {isDirty && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium shrink-0">
              Sin guardar
            </span>
          )}
        </div>
        <button type="button" onClick={requestClose}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        <ImageUploader value={form.image} onChange={v => set('image', v)} label="Imagen del producto" />

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Nombre *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Categoría</label>
            <select value={form.category} onChange={e => set('category', e.target.value as Product['category'])}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Badge</label>
            <input value={form.badge ?? ''} onChange={e => set('badge', e.target.value || undefined)}
              placeholder="Ej: Nuevo"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Precio base *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input required type="number" min="0" step="0.01" value={form.originalPrice ?? ''}
                onChange={e => set('originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0.00"
                className="w-full pl-6 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Stock *</label>
            <input required type="number" min="0" value={form.stock}
              onChange={e => set('stock', Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
          </div>
        </div>

        {/* Discount — useDiscountPrice preview */}
        <div className="border border-gray-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 shrink-0" style={{ color: 'var(--brand-green)' }} />
              <div>
                <p className="text-sm font-semibold text-gray-700">Aplicar descuento</p>
                <p className="text-xs text-gray-400">Activa un descuento automático</p>
              </div>
            </div>
            <button type="button"
              onClick={() => set('discountEnabled', !form.discountEnabled)}
              className="relative w-11 h-6 rounded-full transition-colors shrink-0"
              style={{ background: form.discountEnabled ? 'var(--brand-green)' : '#e5e7eb' }}>
              <motion.div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                animate={{ left: form.discountEnabled ? '1.375rem' : '0.25rem' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
            </button>
          </div>

          {form.discountEnabled && (
            <div className="mt-3 space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Regla de descuento</label>
              {discountRules.length === 0
                ? <p className="text-xs text-gray-400 py-2">Sin reglas. Créalas en Configuración → Descuentos.</p>
                : (
                  <select value={form.discountId ?? ''}
                    onChange={e => set('discountId', e.target.value || undefined)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none">
                    <option value="">Seleccionar regla...</option>
                    {discountRules.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                )}

              {activeRule && basePrice > 0 && (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--brand-section-green)' }}>
                  <div>
                    <p className="text-xs text-gray-500">Precio base</p>
                    <p className="text-sm font-semibold text-gray-400 line-through">${basePrice.toFixed(2)}</p>
                  </div>
                  <span className="text-gray-300">→</span>
                  <div>
                    <p className="text-xs text-gray-500">Precio final</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--brand-green)' }}>${computedPrice.toFixed(2)}</p>
                  </div>
                  <span className="ml-auto text-xs font-bold px-2 py-1 rounded-lg text-white" style={{ background: 'var(--brand-orange)' }}>
                    {discountLabel}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Descripción *</label>
          <textarea required rows={3} value={form.description} onChange={e => set('description', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none resize-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Beneficios</label>
          <TagInput value={form.benefits} onChange={v => set('benefits', v)} placeholder="Ej: Reduce la ansiedad" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Modo de uso *</label>
          <textarea required rows={2} value={form.usage} onChange={e => set('usage', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none resize-none" />
        </div>
      </div>

      {/* Footer — confirm discard or save/cancel */}
      <AnimatePresence mode="wait">
        {confirmingClose ? (
          <motion.div key="confirm"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="shrink-0 border-t border-amber-100 bg-amber-50 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-800">Tienes cambios sin guardar. ¿Qué deseas hacer?</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-amber-200 text-sm font-medium text-amber-700 bg-white">
                Descartar
              </button>
              <button type="button" onClick={() => setConfirmingClose(false)}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: 'var(--brand-green)' }}>
                Seguir editando
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="actions"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="shrink-0 p-4 sm:p-5 border-t border-gray-100 flex gap-3">
            <button type="button" onClick={requestClose}
              className="flex-1 py-3.5 rounded-xl border text-sm font-medium transition-colors"
              style={isDirty
                ? { borderColor: '#fcd34d', color: '#92400e', background: '#fffbeb' }
                : { borderColor: '#e5e7eb', color: '#4b5563' }}>
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-3.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: 'var(--brand-green)', opacity: isDirty ? 1 : 0.7 }}>
              {initial?.id ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

/* ── ProductsTab — usa useDrawer + useDeleteConfirm + useSearch */
export default function ProductsTab({ products, setProducts, discountRules }: Props) {
  const drawer = useDrawer<Product>();
  const del = useDeleteConfirm();
  const [filterOpen, setFilterOpen] = useState(false);
  const { query, setQuery, filter, setFilter, filtered } = useSearch(
    products, productPredicate
  );

  const handleSave = (data: Omit<Product, 'id' | 'rating' | 'reviews'> & { id?: string }) => {
    if (data.id) {
      setProducts(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p));
    } else {
      setProducts(prev => [...prev, { ...data, id: Date.now().toString(), rating: 4.5, reviews: 0 }]);
    }
    drawer.close();
  };

  const handleDelete = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--brand-green)' }}>Productos</h2>
          <p className="text-sm text-gray-400">{products.length} en catálogo</p>
        </div>
        <button onClick={() => drawer.open()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'var(--brand-green)' }}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo producto</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none" />
        </div>
        <button onClick={() => setFilterOpen(v => !v)}
          className="sm:hidden p-3 rounded-xl border border-gray-200 bg-white"
          style={filter !== 'todas' ? { borderColor: 'var(--brand-green)', color: 'var(--brand-green)', background: 'var(--brand-section-green)' } : { color: 'var(--muted-foreground)' }}>
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="hidden sm:block px-3 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none">
          <option value="todas">Todas</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      {/* Mobile filter chips */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden sm:hidden -mt-2">
            <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
              {['todas', ...CATEGORIES].map(c => (
                <button key={c} onClick={() => { setFilter(c); setFilterOpen(false); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border shrink-0"
                  style={filter === c
                    ? { background: 'var(--brand-green)', color: '#fff', borderColor: 'var(--brand-green)' }
                    : { background: '#fff', color: 'var(--muted-foreground)', borderColor: '#e5e7eb' }}>
                  {c === 'todas' ? 'Todas' : CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile cards */}
      <div className="flex-1 overflow-y-auto space-y-2 sm:hidden">
        <AnimatePresence>
          {filtered.map(product => (
            <motion.div key={product.id} layout
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <img src={product.image} alt={product.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--brand-green)' }}>
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {product.discountEnabled && product.discountId ? (
                      <>
                        <span className="text-sm font-bold" style={{ color: 'var(--brand-green)' }}>
                          ${getEffectivePrice(product, discountRules).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold" style={{ color: 'var(--brand-green)' }}>
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      product.stock <= 10 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.stock} uds
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => drawer.open(product)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-green-50"
                    style={{ color: 'var(--brand-green)' }}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  {del.isPending(product.id) ? (
                    <>
                      <button onClick={() => del.confirm(product.id, handleDelete)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={del.cancel}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => del.request(product.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <AnimatePresence>
                {del.isPending(product.id) && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-red-100">
                    <p className="text-xs text-center text-red-600 py-2 bg-red-50 font-medium">
                      ¿Confirmar eliminación? Toca ✓ para borrar
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">No hay productos</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:flex flex-1 overflow-auto bg-white rounded-2xl border border-gray-100 shadow-sm flex-col">
        <table className="w-full min-w-[640px]">
          <thead className="sticky top-0 bg-white border-b border-gray-100">
            <tr>
              {['Producto', 'Categoría', 'Precio', 'Stock', 'Badge', 'Acciones'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => (
              <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-36" style={{ color: 'var(--brand-green)' }}>{product.name}</p>
                      <p className="text-xs text-gray-400">⭐ {product.rating}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 text-green-700">
                    {CATEGORY_LABELS[product.category]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {product.discountEnabled && product.discountId ? (
                    <>
                      <p className="text-sm font-bold" style={{ color: 'var(--brand-green)' }}>
                        ${getEffectivePrice(product, discountRules).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="text-sm font-bold" style={{ color: 'var(--brand-green)' }}>${product.price.toFixed(2)}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    product.stock <= 10 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {product.stock} uds
                  </span>
                </td>
                <td className="px-4 py-3">
                  {product.badge
                    ? <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ background: 'var(--brand-orange)' }}>{product.badge}</span>
                    : <span className="text-gray-300 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => drawer.open(product)}
                      className="p-2 rounded-lg hover:bg-green-50 transition-colors" style={{ color: 'var(--brand-green)' }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {del.isPending(product.id) ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => del.confirm(product.id, handleDelete)} className="p-1.5 rounded-lg bg-red-50 text-red-600"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={del.cancel} className="p-1.5 rounded-lg bg-gray-50 text-gray-400"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button onClick={() => del.request(product.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No hay productos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawer.isOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={drawer.close} />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
              <ProductForm
                title={drawer.item ? 'Editar producto' : 'Nuevo producto'}
                initial={drawer.item}
                onSave={handleSave}
                onClose={drawer.close}
                discountRules={discountRules}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
