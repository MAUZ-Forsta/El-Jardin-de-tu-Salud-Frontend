import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle, CreditCard, Truck, Package, ShieldCheck, ChevronDown, ChevronUp, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

type Step = 'shipping' | 'payment' | 'confirmation';

const COUNTRIES = ['México', 'Colombia', 'Argentina', 'España', 'Chile', 'Perú', 'Venezuela', 'Ecuador', 'Bolivia', 'Uruguay'];

const stepConfig = [
  { id: 'shipping' as Step, label: 'Envío', Icon: Truck },
  { id: 'payment' as Step, label: 'Pago', Icon: CreditCard },
  { id: 'confirmation' as Step, label: 'Confirmación', Icon: Package },
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, addPurchase } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('shipping');
  const [orderNumber] = useState(() => Math.floor(Math.random() * 900000 + 100000).toString());
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);

  const shipping = totalPrice >= 50 ? 0 : 5.99;
  const total = totalPrice + shipping;

  const [shippingData, setShippingData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
    country: user?.country ?? 'México',
    zip: user?.zip ?? '',
  });
  const [paymentData, setPaymentData] = useState({
    method: 'card', cardNumber: '', cardName: '', expiry: '', cvv: '',
  });

  const updateS = (key: string, val: string) => setShippingData(p => ({ ...p, [key]: val }));
  const updateP = (key: string, val: string) => setPaymentData(p => ({ ...p, [key]: val }));

  const onShippingSubmit = (e: React.FormEvent) => { e.preventDefault(); setStep('payment'); window.scrollTo({ top: 0 }); };
  const onPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      addPurchase({
        userId: user.id,
        orderNumber,
        date: new Date().toISOString().split('T')[0],
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          quantity,
          price: product.price,
        })),
        total,
        status: 'preparing',
        shippingAddress: [shippingData.address, shippingData.city, shippingData.country].filter(Boolean).join(', '),
      });
    }
    clearCart();
    setStep('confirmation');
    window.scrollTo({ top: 0 });
  };

  const currentIdx = stepConfig.findIndex(s => s.id === step);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="mb-6" style={{ color: 'var(--brand-green)' }}>Finalizar Compra</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {stepConfig.map((s, i) => {
          const isDone = i < currentIdx;
          const isActive = i === currentIdx;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: isDone ? 'var(--brand-green)' : isActive ? 'var(--brand-orange)' : '#e5e7eb',
                    color: isDone || isActive ? '#fff' : 'var(--brand-inactive)',
                  }}
                >
                  {isDone ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <s.Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <span className="text-xs sm:text-sm font-medium"
                  style={{ color: isActive ? 'var(--brand-orange)' : isDone ? 'var(--brand-green)' : 'var(--brand-inactive)' }}>
                  {s.label}
                </span>
              </div>
              {i < stepConfig.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 sm:mx-3" style={{ background: isDone ? 'var(--brand-green)' : '#e5e7eb' }} />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          {/* Shipping */}
          {step === 'shipping' && (
            <form onSubmit={onShippingSubmit} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
              <h2 className="mb-4" style={{ color: 'var(--brand-green)', fontSize: '1.1rem' }}>Información de envío</h2>
              {user && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: 'var(--brand-section-green)', color: 'var(--brand-green)' }}>
                  <User className="w-4 h-4 shrink-0" />
                  <span className="font-medium">Datos pre-llenados de tu cuenta.</span>
                  <button type="button" onClick={() => navigate('/perfil')}
                    className="ml-auto text-xs underline underline-offset-2 shrink-0" style={{ color: 'var(--brand-green)' }}>
                    Editar perfil
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { key: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Juan García', span: 2 },
                  { key: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'juan@email.com', span: 1 },
                  { key: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+52 55 1234 5678', span: 1 },
                  { key: 'address', label: 'Dirección', type: 'text', placeholder: 'Calle y número', span: 2 },
                  { key: 'city', label: 'Ciudad', type: 'text', placeholder: 'Ciudad de México', span: 1 },
                  { key: 'zip', label: 'Código postal', type: 'text', placeholder: '06600', span: 1 },
                ].map(f => (
                  <div key={f.key} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                    <input
                      type={f.type} required placeholder={f.placeholder}
                      value={(shippingData as Record<string, string>)[f.key]}
                      onChange={e => updateS(f.key, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <select
                    value={shippingData.country}
                    onChange={e => updateS('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none"
                  >
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full mt-5 py-4 rounded-xl text-white font-semibold hover:opacity-90"
                style={{ background: 'var(--brand-green)' }}>
                Continuar al pago →
              </button>
            </form>
          )}

          {/* Payment */}
          {step === 'payment' && (
            <form onSubmit={onPaymentSubmit} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
              <h2 className="mb-5" style={{ color: 'var(--brand-green)', fontSize: '1.1rem' }}>Método de pago</h2>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                {[{ id: 'card', label: '💳 Tarjeta' }, { id: 'paypal', label: '🅿️ PayPal' }, { id: 'transfer', label: '🏦 Transferencia' }].map(m => (
                  <button key={m.id} type="button" onClick={() => updateP('method', m.id)}
                    className="py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all"
                    style={paymentData.method === m.id
                      ? { borderColor: 'var(--brand-green)', color: 'var(--brand-green)', background: 'var(--brand-section-green)' }
                      : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                    {m.label}
                  </button>
                ))}
              </div>

              {paymentData.method === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
                    <input type="text" required maxLength={19} placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={e => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                        updateP('cardNumber', raw.replace(/(.{4})/g, '$1 ').trim());
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la tarjeta</label>
                    <input type="text" required placeholder="JUAN GARCÍA"
                      value={paymentData.cardName}
                      onChange={e => updateP('cardName', e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
                      <input type="text" required placeholder="MM/AA" maxLength={5}
                        value={paymentData.expiry}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          updateP('expiry', v.length >= 2 ? v.slice(0, 2) + '/' + v.slice(2) : v);
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input type="text" required maxLength={4} placeholder="123"
                        value={paymentData.cvv}
                        onChange={e => updateP('cvv', e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Tus datos están cifrados con SSL de 256 bits
                  </div>
                </div>
              )}

              {paymentData.method === 'paypal' && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🅿️</div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Al confirmar, serás redirigido a PayPal de forma segura.
                  </p>
                </div>
              )}

              {paymentData.method === 'transfer' && (
                <div className="p-4 rounded-xl space-y-2" style={{ background: 'var(--brand-section-green)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--brand-green)' }}>Datos para transferencia:</p>
                  {[
                    ['Banco', 'BBVA México'],
                    ['Titular', 'El Jardín de tu Salud S.A.'],
                    ['Cuenta', '0123 4567 89'],
                    ['CLABE', '012 180 0012345678 90'],
                    ['Referencia', `PED-${orderNumber}`],
                  ].map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm flex-wrap gap-1">
                      <span className="text-gray-500">{key}:</span>
                      <span className="font-medium" style={{ color: 'var(--brand-green)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => setStep('shipping')}
                  className="px-5 py-4 rounded-xl border-2 font-medium text-sm"
                  style={{ borderColor: 'var(--brand-green)', color: 'var(--brand-green)' }}>
                  ← Atrás
                </button>
                <button type="submit"
                  className="flex-1 py-4 rounded-xl text-white font-semibold hover:opacity-90"
                  style={{ background: 'var(--brand-green)' }}>
                  Confirmar · ${total.toFixed(2)}
                </button>
              </div>
            </form>
          )}

          {/* Confirmation */}
          {step === 'confirmation' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--brand-section-green)' }}>
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--brand-green)' }} />
              </div>
              <h2 className="mb-2" style={{ color: 'var(--brand-green)' }}>¡Pedido confirmado!</h2>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                Gracias por tu compra. Recibirás un correo de confirmación con los detalles de tu pedido.
              </p>
              <div className="p-4 rounded-xl mb-5" style={{ background: 'var(--brand-section-green)' }}>
                <p className="text-xs text-gray-500 mb-1">Número de pedido</p>
                <p className="font-bold" style={{ color: 'var(--brand-green)', fontSize: '1.35rem' }}>
                  #JDS-{orderNumber}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-7">
                {[
                  { label: 'Estado', value: '📦 En preparación' },
                  { label: 'Entrega estimada', value: '3–7 días hábiles' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--brand-section-warm)' }}>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--brand-green)' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/perfil')}
                  className="py-4 rounded-xl font-semibold border-2 text-sm"
                  style={{ borderColor: 'var(--brand-green)', color: 'var(--brand-green)' }}
                >
                  Mis pedidos
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/')}
                  className="py-4 rounded-xl text-white font-semibold text-sm hover:opacity-90"
                  style={{ background: 'var(--brand-green)' }}
                >
                  Volver al inicio 🌿
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary — collapsible on mobile, always visible as sidebar on desktop */}
        {step !== 'confirmation' && (
          <div className="lg:col-span-1 order-1 lg:order-2">
            {/* Mobile collapsible header */}
            <button
              onClick={() => setOrderSummaryOpen(v => !v)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm lg:hidden"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--brand-green)' }}>Tu pedido</span>
                <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--brand-green)' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
              {orderSummaryOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            <AnimatePresence>
              {(orderSummaryOpen) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden lg:hidden"
                >
                  <div className="bg-white rounded-b-2xl px-4 pb-4 shadow-sm border-t border-gray-50">
                    <OrderSummaryContent items={items} totalPrice={totalPrice} shipping={shipping} total={total} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Always visible on desktop */}
            <div className="hidden lg:block bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--brand-green)' }}>Tu pedido</h3>
              <OrderSummaryContent items={items} totalPrice={totalPrice} shipping={shipping} total={total} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderSummaryContent({ items, totalPrice, shipping, total }: {
  items: Array<{ product: { id: string; image: string; name: string; price: number }; quantity: number }>;
  totalPrice: number; shipping: number; total: number;
}) {
  return (
    <>
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-3 items-center">
            <div className="relative shrink-0">
              <img src={product.image} alt={product.name} className="w-11 h-11 rounded-lg object-cover" />
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'var(--brand-green)' }}>
                {quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--brand-green)' }}>{product.name}</p>
            </div>
            <p className="text-sm font-medium shrink-0">${(product.price * quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="border-t pt-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Envío</span>
          <span style={{ color: shipping === 0 ? 'var(--brand-green)' : 'inherit', fontWeight: shipping === 0 ? 600 : 400 }}>
            {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <span style={{ color: 'var(--brand-green)' }}>Total</span>
          <span style={{ color: 'var(--brand-green)' }}>${total.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
}
