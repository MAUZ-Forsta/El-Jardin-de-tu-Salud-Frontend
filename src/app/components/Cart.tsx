import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  const shipping = totalPrice >= 50 ? 0 : 5.99;
  const total = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-gray-200" />
        <h2 className="mb-3" style={{ color: 'var(--brand-green)' }}>Tu carrito está vacío</h2>
        <p className="text-gray-500 text-sm mb-8">¡Descubre nuestros productos naturales y llena tu carrito!</p>
        <Link
          to="/tienda"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold hover:opacity-90"
          style={{ background: 'var(--brand-green)' }}
        >
          Ir a la tienda <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ color: 'var(--brand-green)' }}>
          Carrito
          <span className="text-base font-normal text-gray-400 ml-2">({totalItems})</span>
        </h1>
        <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
          Vaciar
        </button>
      </div>

      {/* Free shipping progress */}
      {shipping > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl"
          style={{ background: 'var(--brand-section-green)', border: '1px solid #c8e6c9' }}
        >
          <p className="text-xs" style={{ color: 'var(--brand-green)' }}>
            Añade <strong>${(50 - totalPrice).toFixed(2)}</strong> más para obtener envío gratis 🌿
          </p>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-green-100">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--brand-green)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalPrice / 50) * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}

      {/* On mobile: single column (items then summary). On desktop: 2/3 + 1/3 grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map(({ product, quantity }) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm flex gap-3 sm:gap-4"
              >
                <Link to={`/tienda/${product.id}`} className="shrink-0">
                  <img src={product.image} alt={product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-xs uppercase font-semibold mb-0.5 truncate" style={{ color: 'var(--brand-orange)' }}>{product.category}</p>
                      <Link to={`/tienda/${product.id}`}>
                        <p className="font-medium text-sm line-clamp-2 hover:underline" style={{ color: 'var(--brand-green)' }}>
                          {product.name}
                        </p>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">${product.price.toFixed(2)} c/u</p>
                    </div>
                    <button onClick={() => removeItem(product.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1 shrink-0 -mt-0.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100">
                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <span className="px-3 text-sm font-medium min-w-8 text-center">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100">
                        <Plus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                    <span className="font-bold" style={{ color: 'var(--brand-green)' }}>${(product.price * quantity).toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Coupon */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <Tag className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--brand-green)' }}>Código de descuento</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: JARDIN10"
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none"
              />
              <button
                className="px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90"
                style={{ background: 'var(--brand-green)' }}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>

        {/* Order summary — sits below items on mobile, sidebar on desktop */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 shadow-sm lg:sticky lg:top-24">
            <h3 className="mb-4 text-base" style={{ color: 'var(--brand-green)' }}>Resumen del pedido</h3>

            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envío</span>
                <span style={{ color: shipping === 0 ? 'var(--brand-green)' : 'inherit', fontWeight: shipping === 0 ? 600 : 400 }}>
                  {shipping === 0 ? '¡Gratis!' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="border-t pt-3 mb-5" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between font-bold">
                <span style={{ color: 'var(--brand-green)' }}>Total</span>
                <span style={{ color: 'var(--brand-green)', fontSize: '1.25rem' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/pago"
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold hover:opacity-90"
              style={{ background: 'var(--brand-green)' }}
            >
              Finalizar compra <ArrowRight className="w-5 h-5" />
            </Link>

            <Link to="/tienda" className="block text-center mt-3 text-sm hover:underline" style={{ color: 'var(--brand-green)' }}>
              Seguir comprando
            </Link>

            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs text-gray-400 text-center mb-2">Pagos 100% seguros y protegidos</p>
              <div className="flex justify-center gap-2">
                {['VISA', 'MC', 'PayPal', 'AMEX'].map(p => (
                  <span key={p} className="text-xs px-2 py-0.5 border rounded" style={{ borderColor: 'var(--border)', color: 'var(--brand-inactive)' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
