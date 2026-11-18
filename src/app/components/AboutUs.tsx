import { Heart, Leaf, Users, Award, Shield, Star } from 'lucide-react';
import { motion } from 'motion/react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
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

const pillars = [
  {
    icon: Leaf,
    title: 'Orgánico',
    description:
      'Todos nuestros productos provienen de cultivos orgánicos certificados, sin pesticidas ni aditivos artificiales. La pureza de la naturaleza, directa a tu hogar.',
  },
  {
    icon: Users,
    title: 'Comunitario',
    description:
      'Somos más que una tienda. Somos una comunidad de personas comprometidas con su bienestar y con el cuidado del planeta. Tu salud es nuestra misión compartida.',
  },
  {
    icon: Heart,
    title: 'Bienestar',
    description:
      'Creemos en un enfoque integral de la salud: mente, cuerpo y espíritu. Cada producto y curso que ofrecemos está pensado para nutrir tu bienestar completo.',
  },
];

const stats = [
  { value: '15', unit: 'años', label: 'de experiencia' },
  { value: '+5.000', unit: 'clientes', label: 'en la comunidad' },
  { value: '200+', unit: 'productos', label: 'orgánicos certificados' },
];

export default function AboutUs() {
  return (
    <div
      className="min-h-screen main-mobile-pad"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        style={{
          background:
            'linear-gradient(135deg, var(--brand-footer) 0%, #1e5c0a 45%, #c85a00 100%)',
        }}
        className="relative overflow-hidden"
      >
        {/* Decorative leaf shapes */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 60% 60% at 80% 20%, rgba(200,90,0,0.25) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 10% 80%, rgba(30,92,10,0.35) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-5 py-24 sm:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              El Jardín de tu Salud
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ color: '#ffffff', lineHeight: 1.15 }}
            >
              La historia detrás de{' '}
              <span style={{ color: '#fbbf24' }}>La Tia Richard</span>
            </h1>
            <p
              className="max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.80)' }}
            >
              Más de 15 años compartiendo el poder de la naturaleza con amor,
              ciencia y pasión por el bienestar auténtico.
            </p>
          </motion.div>
          {/* Decorative icons row */}
          <motion.div
            className="flex items-center justify-center gap-6 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {[Leaf, Heart, Star, Shield, Award].map((Icon, i) => (
              <Icon
                key={i}
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Brand Story ────────────────────────────────────── */}
      <section style={{ background: 'var(--brand-section-warm)' }} className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: visual accent block */}
            <FadeUp delay={0}>
              <div className="relative">
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(145deg, var(--brand-section-green) 0%, #d4edbc 100%)',
                    minHeight: '340px',
                    border: '1px solid rgba(30,92,10,0.12)',
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full py-16 px-8 gap-6">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: 'var(--brand-green)' }}
                    >
                      <Leaf className="w-12 h-12" style={{ color: '#ffffff' }} />
                    </div>
                    <p
                      className="text-center text-lg font-semibold leading-snug"
                      style={{ color: 'var(--brand-green)' }}
                    >
                      "La naturaleza tiene una medicina para cada dolencia. Solo hay que saber
                      escucharla."
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      — La Tia Richard
                    </p>
                  </div>
                </div>
                {/* Floating badge */}
                <div
                  className="absolute -bottom-5 -right-4 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
                  style={{ background: 'var(--brand-orange)', color: '#fff' }}
                >
                  <Award className="w-5 h-5" />
                  <span className="font-bold text-sm">15+ años de experiencia</span>
                </div>
              </div>
            </FadeUp>

            {/* Right: story text */}
            <FadeUp delay={1}>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: 'var(--brand-orange)' }}
              >
                Nuestra historia
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-6 leading-tight"
                style={{ color: 'var(--brand-green)' }}
              >
                Un proyecto de familia, con alma de comunidad
              </h2>
              <div
                className="space-y-4 leading-relaxed"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <p>
                  El Jardín de tu Salud nació de la cocina de una mujer latina que creyó
                  profundamente en el poder curativo de las plantas. La Tia Richard —como la
                  conocen con cariño miles de personas— empezó compartiendo sus conocimientos
                  de herbolaria heredados de generaciones anteriores.
                </p>
                <p>
                  Con el paso de los años, ese saber se enriqueció con el respaldo de la ciencia
                  moderna. Hoy combinamos la sabiduría tradicional con la investigación científica
                  para ofrecer productos y cursos de calidad certificada.
                </p>
                <p>
                  Seguimos siendo una empresa familiar, con el mismo calor humano del primer día
                  y la responsabilidad de quienes saben que la salud es el bien más valioso.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                {['Familia', 'Tradición', 'Ciencia', 'Comunidad'].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-full text-sm font-semibold"
                    style={{
                      background: 'var(--brand-green-soft)',
                      color: 'var(--brand-green)',
                      border: '1px solid rgba(30,92,10,0.18)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Values / Pillars ───────────────────────────────── */}
      <section style={{ background: 'var(--brand-section-green)' }} className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-5">
          <FadeUp className="text-center mb-14">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--brand-orange)' }}
            >
              Nuestros pilares
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: 'var(--brand-green)' }}
            >
              Lo que nos define
            </h2>
          </FadeUp>

          <motion.div
            className="grid sm:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            {pillars.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="rounded-2xl p-7 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--brand-green-soft)' }}
                >
                  <Icon className="w-6 h-6" style={{ color: 'var(--brand-green)' }} />
                </div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: 'var(--brand-green)' }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission Quote ──────────────────────────────────── */}
      <section style={{ background: 'var(--brand-section-warm)' }} className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-5">
          <FadeUp>
            <div
              className="rounded-3xl px-8 py-12 sm:px-14 sm:py-16 text-center relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg, var(--brand-footer) 0%, #1e5c0a 100%)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(200,90,0,0.20) 0%, transparent 70%)',
                }}
              />
              <Shield
                className="w-10 h-10 mx-auto mb-6 relative"
                style={{ color: 'rgba(255,255,255,0.40)' }}
              />
              <blockquote
                className="relative text-2xl sm:text-3xl font-bold leading-snug mb-6"
                style={{ color: '#ffffff' }}
              >
                Nuestra misión es devolverte el poder sobre tu propia salud, con productos honestos
                y conocimiento accesible para todos.
              </blockquote>
              <p
                className="relative text-sm font-medium"
                style={{ color: 'rgba(255,255,255,0.60)' }}
              >
                El Jardín de tu Salud — La Tia Richard
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Stats Strip ────────────────────────────────────── */}
      <section style={{ background: 'var(--brand-section-green)' }} className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5">
          <motion.div
            className="grid grid-cols-3 gap-4 sm:gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            {stats.map(({ value, unit, label }) => (
              <motion.div key={unit} variants={fadeUp} className="flex flex-col items-center">
                <span
                  className="text-4xl sm:text-5xl font-extrabold leading-none"
                  style={{ color: 'var(--brand-green)' }}
                >
                  {value}
                </span>
                <span
                  className="text-base sm:text-lg font-semibold mt-1"
                  style={{ color: 'var(--brand-orange)' }}
                >
                  {unit}
                </span>
                <span
                  className="text-xs sm:text-sm mt-1"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
