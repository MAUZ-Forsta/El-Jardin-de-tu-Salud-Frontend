import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Star, ShieldCheck, Truck, Leaf, Clock, Award, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { courses } from '../data';
import { useCart } from '../context/CartContext';
import { useAuth, getEffectivePrice } from '../context/AuthContext';
import type { Product } from '../data';
import fullLogo from '../../imports/ChatGPT_Image_4_sept_2026__02_25_20_p.m..png';
import { usePromotion } from '../facades/promotionFacade';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      custom={delay}
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

const categoryItems = [
  { id: 'plantas', label: 'Plantas', icon: '🌱' },
  { id: 'tes', label: 'Tés', icon: '🍵' },
  { id: 'tinturas', label: 'Tinturas', icon: '🧪' },
  { id: 'aceites', label: 'Aceites', icon: '💧' },
  { id: 'suplementos', label: 'Suplementos', icon: '💊' },
];

function ProductCard({ product, effectiveP, onAdd, justAdded }: { product: Product; effectiveP: number; onAdd: () => void; justAdded: boolean }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
    >
      <div className="relative overflow-hidden h-40 sm:h-48">
        <img src={product.image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: 'var(--brand-orange)' }}>
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-xs uppercase tracking-wide font-semibold mb-0.5" style={{ color: 'var(--brand-orange)' }}>{product.category}</p>
        <Link to={`/tienda/${product.id}`}>
          <h3 className="hover:underline line-clamp-1" style={{ color: 'var(--brand-green)', fontSize: '0.92rem' }}>{product.name}</h3>
        </Link>
        <div className="flex items-center gap-0.5 mt-1.5 mb-2.5">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
          ))}
          <span className="text-xs text-gray-400 ml-0.5">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold" style={{ color: 'var(--brand-green)', fontSize: '1.05rem' }}>${effectiveP.toFixed(2)}</span>
            {effectiveP < product.price && (
              <span className="text-gray-400 line-through text-xs ml-1">${product.price.toFixed(2)}</span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onAdd}
            className="px-2.5 py-1.5 rounded-xl text-white text-xs font-medium"
            style={{ background: justAdded ? 'var(--brand-green-vivid)' : 'var(--brand-green)' }}
          >
            {justAdded ? '✓' : '+ Añadir'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { addItem } = useCart();
  const { adminProducts, discountRules } = useAuth();
  const { banner, isVisible: promoVisible } = usePromotion();
  const [added, setAdded] = useState<string | null>(null);
  const featuredProducts = adminProducts.slice(0, 4);
  const featuredCourses = courses.slice(0, 2);

  const handleAdd = (product: Product) => {
    addItem(product);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1800);
  };

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative flex flex-col justify-end sm:justify-center overflow-hidden" style={{ minHeight: '100svh' }}>
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1920)` }}
        />
        {/* Forest-deep gradient — heavier at top so mobile status bar stays legible */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(8,24,4,0.70) 0%, rgba(12,36,6,0.50) 35%, rgba(16,56,8,0.80) 68%, rgba(18,66,6,0.97) 100%)' }}
        />

        <div
          className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pb-20 text-center sm:text-left"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 5rem)' }}
        >
          <div className="max-w-lg mx-auto sm:mx-0">

            {/* Brand block — full horizontal logo + "presenta" — visible on ALL sizes (no header on home) */}
            <motion.div
              className="flex flex-col items-center sm:items-start mb-4"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <img
                src={fullLogo}
                alt="La Tia Richard"
                className="h-10 sm:h-12 w-auto mb-2"
                style={{ filter: 'invert(1)', mixBlendMode: 'screen', maxWidth: '80vw' }}
              />
              <div className="flex items-center gap-2">
                <div className="h-px w-5 rounded-full" style={{ background: 'rgba(200,90,0,0.60)' }} />
                <span
                  className="text-xs tracking-[0.22em] uppercase font-semibold"
                  style={{ color: 'rgba(255,210,148,0.82)' }}
                >
                  presenta
                </span>
                <div className="h-px w-5 rounded-full" style={{ background: 'rgba(200,90,0,0.60)' }} />
              </div>
            </motion.div>

            {/* Main title — single smoke-white */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4"
              style={{ fontSize: 'clamp(2.3rem, 7.5vw, 4.2rem)', fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.025em', color: '#f5f5f5' }}
            >
              El Jardín<br />de tu Salud
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.50 }}
              className="mb-7 leading-relaxed text-sm sm:text-base"
              style={{ color: 'rgba(255,255,255,0.72)' }}
            >
              Plantas medicinales, tés e infusiones, y cursos especializados para transformar tu bienestar de adentro hacia afuera.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.63 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link to="/tienda"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold hover:scale-105 transition-transform shadow-lg"
                style={{ background: 'var(--brand-orange)' }}>
                Explorar Tienda <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/cursos"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold hover:scale-105 transition-transform"
                style={{ background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.22)' }}>
                Ver Cursos
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.82 }}
              className="flex items-center justify-center sm:justify-start gap-6 mt-10"
            >
              {[
                { value: '+5,000', label: 'Clientes' },
                { value: '200+', label: 'Productos' },
                { value: '15 años', label: 'Experiencia' },
              ].map((stat, i, arr) => (
                <div key={stat.label} className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-white font-bold" style={{ fontSize: 'clamp(1rem, 3vw, 1.35rem)' }}>{stat.value}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>{stat.label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.16)' }} />}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ opacity: 0.42 }}
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <span className="text-white text-xs">Descubrir</span>
          <ChevronRight className="w-4 h-4 text-white rotate-90" />
        </motion.div>
      </section>

      {/* ─── Promo section — driven by admin facade ───────── */}
      {promoVisible && (
        <FadeUp>
          <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6b2700 0%, #9a3400 42%, #c05000 100%)' }}>
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,200,100,0.06) 50%, transparent 100%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear', repeatDelay: 3 }}
            />
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />

            <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,215,140,0.80)' }}>
                    🍂 Oferta de temporada — Tiempo limitado
                  </p>
                  <h2 className="text-white font-extrabold leading-tight mb-1" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}>
                    {banner.headline}{' '}
                    <motion.span
                      className="inline-flex items-center gap-1.5"
                      animate={{ textShadow: ['0 0 0px rgba(255,220,80,0)', '0 0 20px rgba(255,220,80,0.5)', '0 0 0px rgba(255,220,80,0)'] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                    >
                      con <Zap className="w-5 h-5 inline" style={{ color: '#ffd890' }} />
                      <span style={{ color: '#ffd890' }}>{banner.discount}% off</span>
                    </motion.span>
                  </h2>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.58)' }}>{banner.subtext}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Link
                    to={banner.ctaLink}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm hover:scale-105 hover:shadow-lg transition-all"
                    style={{ background: '#f0dcc0', color: '#7a2800', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
                  >
                    {banner.ctaLabel} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/cursos"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm hover:scale-105 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.20)' }}
                  >
                    Ver cursos
                  </Link>
                </div>

              </div>
            </div>
          </section>
        </FadeUp>
      )}

      {/* ─── Features bar ─────────────────────────────── */}
      <section style={{ background: 'var(--brand-green)' }} className="py-4">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto scrollbar-none">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={stagger}
              className="flex gap-6 px-4 sm:px-6 lg:px-8 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4"
            >
              {[
                { Icon: Truck, text: 'Envío gratis +$50' },
                { Icon: ShieldCheck, text: 'Certificados Orgánicos' },
                { Icon: Leaf, text: '100% Natural' },
                { Icon: Award, text: 'Garantía de calidad' },
              ].map(({ Icon, text }) => (
                <motion.div key={text} variants={fadeUp} className="flex items-center gap-2.5 text-white shrink-0 py-1">
                  <Icon className="w-5 h-5 shrink-0 opacity-90" />
                  <span className="text-sm font-medium whitespace-nowrap">{text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────── */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <p className="text-center text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: 'var(--brand-orange)' }}>
              Categorías
            </p>
          </FadeUp>
        </div>
        <div className="overflow-x-auto scrollbar-none">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="flex gap-3 px-4 sm:px-6 lg:px-8 pb-2 min-w-max sm:min-w-0 sm:grid sm:grid-cols-5 max-w-7xl mx-auto"
          >
            {categoryItems.map(cat => (
              <motion.div key={cat.id} variants={fadeUp} className="shrink-0 w-24 sm:w-auto">
                <Link to="/tienda"
                  className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all group">
                  <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-xs sm:text-sm font-medium text-center" style={{ color: 'var(--brand-green)' }}>{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Featured products ─────────────────────────── */}
      <section className="pb-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-orange)' }}>Nuestra selección</span>
            <h2 className="mt-0.5" style={{ color: 'var(--brand-green)' }}>Productos Destacados</h2>
          </div>
          <Link to="/tienda" className="flex items-center gap-1 text-sm font-medium hover:underline shrink-0 ml-4" style={{ color: 'var(--brand-green)' }}>
            Ver todo <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeUp>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product}
              effectiveP={getEffectivePrice(product, discountRules)}
              onAdd={() => handleAdd(product)} justAdded={added === product.id} />
          ))}
        </motion.div>
      </section>

      {/* ─── Why us ───────────────────────────────────── */}
      <section style={{ background: 'var(--brand-section-green)' }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-10">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-orange)' }}>¿Por qué elegirnos?</span>
            <h2 className="mt-0.5" style={{ color: 'var(--brand-green)' }}>Comprometidos con tu bienestar</h2>
          </FadeUp>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            {[
              { icon: '🌱', title: 'Agricultura Orgánica', desc: 'Productos de cultivos orgánicos certificados, sin pesticidas ni químicos sintéticos.' },
              { icon: '🔬', title: 'Respaldo Científico', desc: 'Cada producto cuenta con evidencia científica que respalda sus propiedades terapéuticas.' },
              { icon: '❤️', title: 'Pasión por la Salud', desc: 'Familia apasionada por la medicina natural con más de 15 años acompañando a nuestra comunidad.' },
            ].map(item => (
              <motion.div key={item.title} variants={fadeUp}
                className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="mb-2" style={{ color: 'var(--brand-green)', fontSize: '1rem' }}>{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Featured courses ──────────────────────────── */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeUp className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-orange)' }}>Aprende</span>
            <h2 className="mt-0.5" style={{ color: 'var(--brand-green)' }}>Cursos Especializados</h2>
          </div>
          <Link to="/cursos" className="flex items-center gap-1 text-sm font-medium hover:underline shrink-0 ml-4" style={{ color: 'var(--brand-green)' }}>
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeUp>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          {featuredCourses.map(course => (
            <motion.div key={course.id} variants={fadeUp}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
              <div className="h-44 overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 sm:p-5">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${
                  course.level === 'Principiante' ? 'bg-green-100 text-green-700' :
                  course.level === 'Intermedio' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>{course.level}</span>
                <h3 className="mb-1.5" style={{ color: 'var(--brand-green)', fontSize: '0.95rem' }}>{course.title}</h3>
                <p className="text-gray-500 text-xs line-clamp-2 mb-3">{course.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                  <span>{course.lessons} clases</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold" style={{ color: 'var(--brand-green)', fontSize: '1.15rem' }}>${course.price.toFixed(2)}</span>
                    {course.originalPrice && (
                      <span className="text-gray-400 line-through text-sm ml-2">${course.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <Link to="/cursos"
                    className="px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90"
                    style={{ background: 'var(--brand-orange)' }}>
                    Inscribirme
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── Testimonials ─────────────────────────────── */}
      <section style={{ background: 'var(--brand-footer)' }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-10">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-orange)' }}>Testimonios</span>
            <h2 className="mt-0.5 text-white">Lo que dicen nuestros clientes</h2>
          </FadeUp>

          <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
              variants={stagger}
              className="flex gap-4 sm:grid sm:grid-cols-3 pb-2 sm:pb-0"
              style={{ width: 'max-content', maxWidth: '100%' }}
            >
              {[
                { name: 'María González', location: 'Ciudad de México', text: 'La manzanilla cambió mi vida. Dormía mal por años y ahora descanso profundamente.', stars: 5 },
                { name: 'Carlos Ramírez', location: 'Bogotá, Colombia', text: 'El curso de fitoterapia fue excelente. Aprendí a tratar a mi familia con plantas naturales.', stars: 5 },
                { name: 'Laura Martín', location: 'Buenos Aires', text: 'La calidad de sus productos es insuperable. Se nota que son orgánicos y de primera calidad.', stars: 5 },
              ].map(t => (
                <motion.div key={t.name} variants={fadeUp}
                  className="rounded-2xl p-5 shrink-0 sm:shrink w-72 sm:w-auto"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm leading-relaxed mb-4 italic" style={{ color: 'rgba(255,255,255,0.78)' }}>"{t.text}"</p>
                  <div>
                    <p className="text-white font-medium text-sm">— {t.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>{t.location}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Newsletter ───────────────────────────────── */}
      <FadeUp>
        <section className="py-14" style={{ background: 'var(--brand-section-warm)' }}>
          <div className="max-w-lg mx-auto px-4 text-center">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-orange)' }}>Newsletter</span>
            <h2 className="mt-0.5 mb-2" style={{ color: 'var(--brand-green)' }}>Recibe consejos de salud natural</h2>
            <p className="text-gray-600 text-sm mb-6">
              Suscríbete y obtén un <strong>10% de descuento</strong> en tu primera compra.
            </p>
            <div className="flex flex-col gap-2.5">
              <input type="email" placeholder="Tu correo electrónico"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none text-sm" />
              <motion.button whileTap={{ scale: 0.96 }}
                className="w-full px-6 py-3.5 rounded-xl text-white font-medium text-sm hover:opacity-90"
                style={{ background: 'var(--brand-green)' }}>
                Suscribirme gratis
              </motion.button>
            </div>
            <p className="text-xs text-gray-400 mt-3">Sin spam. Cancela cuando quieras.</p>
          </div>
        </section>
      </FadeUp>
    </div>
  );
}
