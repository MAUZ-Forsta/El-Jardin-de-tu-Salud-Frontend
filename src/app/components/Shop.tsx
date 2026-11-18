import { useState } from 'react';
import { Link } from 'react-router';
import { Star, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth, getEffectivePrice } from '../context/AuthContext';
import type { Product } from '../data';

const categories = [
  { id: 'todas', label: 'Todas', icon: '🌿' },
  { id: 'plantas', label: 'Plantas', icon: '🌱' },
  { id: 'tes', label: 'Tés', icon: '🍵' },
  { id: 'tinturas', label: 'Tinturas', icon: '🧪' },
  { id: 'aceites', label: 'Aceites', icon: '💧' },
  { id: 'suplementos', label: 'Suplementos', icon: '💊' },
];

const categoryLabels: Record<string, string> = {
  plantas: 'Plantas', tes: 'Tés', tinturas: 'Tinturas', aceites: 'Aceites', suplementos: 'Suplementos',
};

function ProductCard({ product, onAdd, added, effectivePrice }: { product: Product; onAdd: () => void; added: boolean; effectivePrice: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
    >
      <Link to={`/tienda/${product.id}`} className="block relative overflow-hidden h-40 sm:h-48">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-xs font-bold text-white"
            style={{ background: 'var(--brand-orange)' }}>
            {product.badge}
          </span>
        )}
        {product.stock <= 10 && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
            Últimas
          </span>
        )}
      </Link>
      <div className="p-3 sm:p-4">
        <p className="text-xs uppercase tracking-wide font-semibold mb-0.5" style={{ color: 'var(--brand-orange)' }}>
          {categoryLabels[product.category] ?? product.category}
        </p>
        <Link to={`/tienda/${product.id}`}>
          <h3 className="hover:underline line-clamp-1" style={{ color: 'var(--brand-green)', fontSize: '0.92rem' }}>
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-xs mt-1 mb-2.5 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-0.5 mb-3">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
          ))}
          <span className="text-xs text-gray-400 ml-0.5">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="font-bold block" style={{ color: 'var(--brand-green)', fontSize: '1.05rem' }}>
              ${effectivePrice.toFixed(2)}
            </span>
            {product.discountEnabled && product.discountId && effectivePrice < product.price ? (
              <span className="text-gray-400 line-through text-xs">${product.price.toFixed(2)}</span>
            ) : product.originalPrice ? (
              <span className="text-gray-400 line-through text-xs">${product.originalPrice.toFixed(2)}</span>
            ) : null}
          </div>
          <button
            onClick={onAdd}
            className="shrink-0 px-2.5 py-1.5 rounded-xl text-white text-xs font-medium transition-all active:scale-95"
            style={{ background: added ? 'var(--brand-green-vivid)' : 'var(--brand-green)' }}
          >
            {added ? '✓ Ok' : '+ Añadir'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('todas');
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');
  const [showSort, setShowSort] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const { addItem } = useCart();
  const { adminProducts: products, discountRules } = useAuth();

  const handleAdd = (product: Product) => {
    addItem(product);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1800);
  };

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'todas' || p.category === activeCategory;
    const matchSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return getEffectivePrice(a, discountRules) - getEffectivePrice(b, discountRules);
    if (sortBy === 'price-desc') return getEffectivePrice(b, discountRules) - getEffectivePrice(a, discountRules);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ color: 'var(--brand-green)' }}>Nuestra Tienda</h1>
        <p className="text-gray-500 mt-1 text-sm">Productos naturales y medicinales de la más alta calidad</p>
      </div>

      {/* Search bar — full width on mobile */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"
          />
        </div>
        {/* Sort button — icon only on mobile, expands on desktop */}
        <div className="relative">
          <button
            onClick={() => setShowSort(v => !v)}
            className="flex items-center gap-2 px-3 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-gray-300"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">
              {sortBy === 'default' ? 'Ordenar' : sortBy === 'price-asc' ? 'Precio ↑' : sortBy === 'price-desc' ? 'Precio ↓' : 'Rating'}
            </span>
          </button>
          <AnimatePresence>
            {showSort && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden min-w-48"
              >
                {[
                  { value: 'default', label: 'Relevancia' },
                  { value: 'price-asc', label: 'Precio: menor a mayor' },
                  { value: 'price-desc', label: 'Precio: mayor a menor' },
                  { value: 'rating', label: 'Mejor valorados' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                    className="w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors"
                    style={{ color: sortBy === opt.value ? 'var(--brand-green)' : 'var(--muted-foreground)', fontWeight: sortBy === opt.value ? 600 : 400 }}>
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Category chips — horizontal scroll on mobile */}
      <div className="overflow-x-auto scrollbar-none -mx-4 sm:mx-0 mb-5">
        <div className="flex gap-2 px-4 sm:px-0 pb-1 min-w-max sm:min-w-0 sm:flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all shrink-0 whitespace-nowrap"
              style={activeCategory === cat.id
                ? { background: 'var(--brand-green)', color: '#fff' }
                : { background: 'var(--card)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-5">
        {sorted.length} producto{sorted.length !== 1 ? 's' : ''} encontrado{sorted.length !== 1 ? 's' : ''}
      </p>

      {sorted.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5"
          >
            {sorted.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => handleAdd(product)}
                added={added === product.id}
                effectivePrice={getEffectivePrice(product, discountRules)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 style={{ color: 'var(--brand-green)' }}>No encontramos productos</h3>
          <p className="text-gray-500 text-sm mt-2">Prueba con otros términos o categoría</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('todas'); }}
            className="mt-6 px-6 py-3 rounded-xl text-white text-sm font-medium"
            style={{ background: 'var(--brand-green)' }}
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
