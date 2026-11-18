import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Star, ChevronLeft, Plus, Minus, ShoppingCart, CheckCircle, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { products } from '../data';
import { useCart } from '../context/CartContext';

const categoryLabels: Record<string, string> = {
  plantas: 'Plantas', tes: 'Tés', tinturas: 'Tinturas', aceites: 'Aceites', suplementos: 'Suplementos',
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find(p => p.id === id);
  const related = products.filter(p => p.id !== id && p.category === product?.category).slice(0, 3);

  if (!product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🌿</div>
        <h2 style={{ color: 'var(--brand-green)' }}>Producto no encontrado</h2>
        <p className="text-gray-500 mt-2 mb-8 text-sm">El producto que buscas no existe o ha sido retirado.</p>
        <Link to="/tienda"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-medium"
          style={{ background: 'var(--brand-green)' }}>
          <ChevronLeft className="w-4 h-4" /> Volver a la tienda
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm mb-5 hover:underline"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <ChevronLeft className="w-4 h-4" /> Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-12 md:mb-16">
        {/* Product image */}
        <div className="rounded-2xl overflow-hidden aspect-square sm:aspect-auto sm:h-96 md:h-[480px]">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Product info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-orange)' }}>
              {categoryLabels[product.category] ?? product.category}
            </span>
            {product.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: 'var(--brand-orange)' }}>
                {product.badge}
              </span>
            )}
          </div>

          <h1 className="mb-3" style={{ color: 'var(--brand-green)', fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}>{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-4 h-4 sm:w-5 sm:h-5 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.rating} · {product.reviews} reseñas</span>
          </div>

          <div className="flex items-end gap-3 mb-5">
            <span style={{ color: 'var(--brand-green)', fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-gray-400 line-through text-base mb-0.5">${product.originalPrice.toFixed(2)}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full mb-0.5"
                  style={{ background: '#fef3c7', color: '#d97706' }}>
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.description}</p>

          {/* Benefits */}
          <div className="mb-5">
            <h4 className="mb-2.5" style={{ color: 'var(--brand-green)', fontSize: '0.95rem' }}>Beneficios</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.benefits.map(b => (
                <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--brand-green)' }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Usage */}
          <div className="p-4 rounded-xl mb-5" style={{ background: 'var(--brand-section-green)' }}>
            <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--brand-green)' }}>Modo de uso</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{product.usage}</p>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100">
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-5 min-w-14 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100">
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <span className="text-sm text-gray-400">{product.stock} disponibles</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold hover:opacity-90"
              style={{ background: added ? 'var(--brand-green-vivid)' : 'var(--brand-green)' }}
            >
              <ShoppingCart className="w-5 h-5" />
              {added ? '¡Añadido al carrito!' : 'Añadir al carrito'}
            </motion.button>
            <Link
              to="/carrito"
              className="w-full flex items-center justify-center py-3.5 rounded-xl font-medium border-2 hover:bg-green-50 text-sm"
              style={{ borderColor: 'var(--brand-green)', color: 'var(--brand-green)' }}
            >
              Ver carrito
            </Link>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <Truck className="w-4 h-4" />
            <span>Envío gratis en pedidos mayores a $50</span>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-5" style={{ color: 'var(--brand-green)' }}>Productos relacionados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {related.map(p => (
              <Link key={p.id} to={`/tienda/${p.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group block">
                <div className="h-36 sm:h-44 overflow-hidden">
                  <img src={p.image} alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-xs uppercase tracking-wide font-semibold mb-0.5" style={{ color: 'var(--brand-orange)' }}>
                    {categoryLabels[p.category]}
                  </p>
                  <h3 className="line-clamp-2" style={{ color: 'var(--brand-green)', fontSize: '0.88rem' }}>{p.name}</h3>
                  <p className="font-bold mt-1.5" style={{ color: 'var(--brand-green)', fontSize: '0.95rem' }}>${p.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
