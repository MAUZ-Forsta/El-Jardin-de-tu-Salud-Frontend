/**
 * CourseCheckout — pasarela de pago para cursos.
 *
 * Recibe courseId vía URL param. Al confirmar el pago (mock), inscribe
 * al usuario y redirige al player del curso.
 *
 * MOBILE-FIRST:
 * • Base: columna única, resumen del curso arriba, pago abajo.
 * • sm+: grid de 2 columnas (pago | resumen).
 */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { CreditCard, ShieldCheck, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, getEffectivePrice } from '../context/AuthContext';

type Step = 'payment' | 'done';

function formatCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export default function CourseCheckout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, adminCourses, enrollInCourse, isEnrolled, discountRules } = useAuth();

  const course = adminCourses.find(c => c.id === id);

  const [step, setStep] = useState<Step>('payment');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-500 mb-4">Curso no encontrado.</p>
          <button onClick={() => navigate('/cursos')}
            className="px-6 py-3 rounded-xl text-white text-sm font-medium"
            style={{ background: 'var(--brand-green)' }}>← Volver a Cursos</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Inicia sesión para continuar con el pago.</p>
          <button onClick={() => navigate('/cursos')}
            className="px-6 py-3 rounded-xl text-white text-sm font-medium"
            style={{ background: 'var(--brand-green)' }}>← Volver a Cursos</button>
        </div>
      </div>
    );
  }

  const effectivePrice = getEffectivePrice(
    { ...course, discountEnabled: course.discountEnabled, discountId: course.discountId },
    discountRules
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (card.number.replace(/\s/g, '').length < 16) e.number = 'Número de tarjeta incompleto';
    if (!card.name.trim()) e.name = 'Ingresa el nombre del titular';
    if (card.expiry.length < 5) e.expiry = 'Fecha inválida';
    if (card.cvv.length < 3) e.cvv = 'CVV inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    enrollInCourse(course.id);
    setStep('done');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToCourse = () => navigate(`/cursos/${course.id}/ver`);

  /* ── Course summary sidebar ───────────────────────── */
  const Summary = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <img src={course.image} alt={course.title} className="w-full h-36 object-cover" />
      <div className="p-4">
        <p className="font-bold text-sm leading-tight mb-0.5" style={{ color: 'var(--brand-green)' }}>{course.title}</p>
        <p className="text-xs text-gray-500 mb-3">{course.instructor}</p>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-sm text-gray-500">Total</span>
          <div className="text-right">
            <p className="font-bold" style={{ color: 'var(--brand-green)', fontSize: '1.2rem' }}>${effectivePrice.toFixed(2)}</p>
            {course.originalPrice && course.originalPrice > effectivePrice && (
              <p className="text-xs text-gray-400 line-through">${course.originalPrice.toFixed(2)}</p>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          Pago seguro con cifrado SSL
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <button onClick={() => navigate('/cursos')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--brand-green)' }}>Finalizar inscripción</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'payment' ? (
          <motion.div key="payment"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-[1fr_280px] gap-6">

            {/* Form */}
            <div>
              {/* Mobile: summary inline */}
              <div className="sm:hidden mb-6"><Summary /></div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard className="w-5 h-5 shrink-0" style={{ color: 'var(--brand-orange)' }} />
                  <h2 className="font-semibold text-base text-gray-800">Datos de pago</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                      Número de tarjeta
                    </label>
                    <div className="relative">
                      <input value={card.number}
                        onChange={e => setCard(p => ({ ...p, number: formatCard(e.target.value) }))}
                        placeholder="1234 5678 9012 3456" maxLength={19}
                        className={`w-full px-4 py-3.5 border rounded-xl text-sm font-mono focus:outline-none ${errors.number ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`} />
                      <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                      Nombre en la tarjeta
                    </label>
                    <input value={card.name}
                      onChange={e => setCard(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                      placeholder="NOMBRE APELLIDO"
                      className={`w-full px-4 py-3.5 border rounded-xl text-sm focus:outline-none ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        Vencimiento
                      </label>
                      <input value={card.expiry}
                        onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                        placeholder="MM/AA" maxLength={5}
                        className={`w-full px-4 py-3.5 border rounded-xl text-sm font-mono focus:outline-none ${errors.expiry ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`} />
                      {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">CVV</label>
                      <input value={card.cvv}
                        onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        placeholder="123" type="password" maxLength={4}
                        className={`w-full px-4 py-3.5 border rounded-xl text-sm font-mono focus:outline-none ${errors.cvv ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`} />
                      {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
                    </div>
                  </div>

                  {/* Accepted cards */}
                  <div className="flex items-center gap-2 pt-1">
                    {['VISA', 'MC', 'AMEX'].map(c => (
                      <span key={c} className="px-2 py-1 rounded-md border border-gray-200 text-xs font-bold text-gray-400">{c}</span>
                    ))}
                    <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Seguro
                    </span>
                  </div>

                  <motion.button type="submit" whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-2xl text-white font-bold text-base mt-2 flex items-center justify-center gap-2"
                    style={{ background: 'var(--brand-orange)' }}>
                    <Lock className="w-5 h-5" />
                    Pagar ${effectivePrice.toFixed(2)} e inscribirme
                  </motion.button>
                </form>
              </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden sm:block sticky top-6 self-start"><Summary /></div>
          </motion.div>
        ) : (
          /* Confirmation */
          <motion.div key="done"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-10 sm:py-16 px-4">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
              style={{ background: 'var(--brand-green)' }}>
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--brand-green)' }}>¡Inscripción exitosa!</h2>
            <p className="text-gray-500 text-sm mb-1">Ya tienes acceso a</p>
            <p className="font-semibold text-gray-800 mb-6">{course.title}</p>

            <div className="bg-gray-50 rounded-2xl p-4 mb-8 max-w-sm w-full text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Curso</span>
                <span className="font-medium truncate ml-4 max-w-[180px]">{course.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Instructor</span>
                <span className="font-medium">{course.instructor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total pagado</span>
                <span className="font-bold" style={{ color: 'var(--brand-green)' }}>${effectivePrice.toFixed(2)}</span>
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.96 }}
              onClick={handleGoToCourse}
              className="w-full max-w-sm py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 mb-3"
              style={{ background: 'var(--brand-orange)' }}>
              Comenzar el curso →
            </motion.button>
            <button onClick={() => navigate('/cursos')} className="text-sm text-gray-400 hover:text-gray-600">
              Ver más cursos
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
