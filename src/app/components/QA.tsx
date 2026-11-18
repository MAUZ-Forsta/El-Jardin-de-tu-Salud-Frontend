import { ChevronDown, Package, BookOpen, Truck, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import * as Accordion from '@radix-ui/react-accordion';

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

type FAQItem = { q: string; a: string };
type FAQCategory = {
  id: string;
  title: string;
  icon: React.ElementType;
  items: FAQItem[];
};

const categories: FAQCategory[] = [
  {
    id: 'productos',
    title: 'Productos',
    icon: Package,
    items: [
      {
        q: '¿Son todos los productos 100% orgánicos?',
        a: 'Sí, todos nuestros productos provienen de cultivos orgánicos certificados, libres de pesticidas y químicos sintéticos.',
      },
      {
        q: '¿Los productos tienen algún efecto secundario?',
        a: 'Al ser naturales, los efectos secundarios son mínimos. Sin embargo, recomendamos consultar con tu médico si estás bajo tratamiento.',
      },
      {
        q: '¿Cómo debo almacenar los productos?',
        a: 'En lugar fresco, seco y alejado de la luz solar directa. Cada producto incluye instrucciones específicas.',
      },
    ],
  },
  {
    id: 'cursos',
    title: 'Cursos',
    icon: BookOpen,
    items: [
      {
        q: '¿Los cursos tienen fecha de vencimiento?',
        a: 'No, una vez inscrito tienes acceso de por vida al contenido.',
      },
      {
        q: '¿Necesito conocimientos previos?',
        a: 'No es necesario. Tenemos cursos para todos los niveles.',
      },
      {
        q: '¿Recibiré un certificado?',
        a: 'Sí, al completar cada curso recibirás un certificado digital.',
      },
    ],
  },
  {
    id: 'envios',
    title: 'Envíos',
    icon: Truck,
    items: [
      {
        q: '¿Hacen envíos internacionales?',
        a: 'Sí, enviamos a toda Latinoamérica y España.',
      },
      {
        q: '¿Cuánto tarda el envío?',
        a: 'Entre 3 y 10 días hábiles según el destino.',
      },
      {
        q: '¿Tienen envío gratis?',
        a: 'Sí, en pedidos mayores a $50 USD.',
      },
    ],
  },
  {
    id: 'pagos',
    title: 'Pagos',
    icon: CreditCard,
    items: [
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Tarjeta de crédito/débito, PayPal y Mercado Pago.',
      },
      {
        q: '¿Es seguro comprar aquí?',
        a: 'Sí, usamos encriptación SSL y nunca almacenamos datos de tarjeta.',
      },
      {
        q: '¿Hacen reembolsos?',
        a: 'Sí, dentro de los primeros 30 días si el producto está en buen estado.',
      },
    ],
  },
];

export default function QA() {
  return (
    <div
      className="min-h-screen main-mobile-pad"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        style={{
          background:
            'linear-gradient(135deg, var(--brand-footer) 0%, #1e5c0a 55%, #c85a00 100%)',
        }}
        className="relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 55% 65% at 85% 15%, rgba(200,90,0,0.22) 0%, transparent 65%)',
          }}
        />
        <motion.div
          className="relative max-w-5xl mx-auto px-5 py-20 sm:py-28 text-center"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'rgba(255,255,255,0.60)' }}
          >
            El Jardín de tu Salud
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold mb-5"
            style={{ color: '#ffffff', lineHeight: 1.15 }}
          >
            Preguntas frecuentes
          </h1>
          <p
            className="max-w-xl mx-auto text-lg leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.78)' }}
          >
            Encontrá respuestas a las dudas más comunes sobre nuestros productos,
            cursos, envíos y formas de pago.
          </p>
        </motion.div>
      </section>

      {/* ── FAQ Body ───────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-5">
          <motion.div
            className="space-y-10"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.id} variants={fadeUp}>
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--brand-green-soft)' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: 'var(--brand-green)' }} />
                    </div>
                    <h2
                      className="text-xl font-bold"
                      style={{ color: 'var(--brand-green)' }}
                    >
                      {cat.title}
                    </h2>
                    <div
                      className="flex-1 h-px"
                      style={{ background: 'var(--border)' }}
                    />
                  </div>

                  {/* Accordion */}
                  <Accordion.Root type="multiple" className="space-y-2">
                    {cat.items.map((item, idx) => (
                      <Accordion.Item
                        key={idx}
                        value={`${cat.id}-${idx}`}
                        className="rounded-xl overflow-hidden"
                        style={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <Accordion.Header>
                          <Accordion.Trigger
                            className="group w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-green-50 rounded-xl focus-visible:outline-none"
                            style={{
                              color: 'var(--foreground)',
                              cursor: 'pointer',
                              background: 'transparent',
                              border: 'none',
                            }}
                          >
                            <span className="font-medium text-sm sm:text-base leading-snug">
                              {item.q}
                            </span>
                            <ChevronDown
                              className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180"
                              style={{ color: 'var(--brand-orange)' }}
                            />
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content
                          className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          <div className="px-5 pb-5 pt-1 text-sm leading-relaxed border-t" style={{ borderColor: 'var(--border)' }}>
                            {item.a}
                          </div>
                        </Accordion.Content>
                      </Accordion.Item>
                    ))}
                  </Accordion.Root>
                </motion.div>
              );
            })}
          </motion.div>

          {/* ── Contact CTA ──────────────────────────────────── */}
          <FadeUp delay={0} className="mt-16">
            <div
              className="rounded-2xl p-8 sm:p-10 text-center"
              style={{
                background: 'var(--brand-section-warm)',
                border: '1px solid var(--border)',
              }}
            >
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: 'var(--brand-green)' }}
              >
                No encontraste tu respuesta?
              </h3>
              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Nuestro equipo está disponible para ayudarte. Escribinos y te respondemos a la brevedad.
              </p>
              <a
                href="mailto:hola@eljardindetu salud.com"
                className="inline-block px-7 py-3 rounded-full font-semibold text-sm transition-opacity hover:opacity-85"
                style={{ background: 'var(--brand-green)', color: '#ffffff' }}
              >
                Contactanos
              </a>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
