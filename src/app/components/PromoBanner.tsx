import { useState } from 'react';
import { Link } from 'react-router';
import { X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePromotion } from '../facades/promotionFacade';

export function PromoBanner() {
  const { banner, isVisible } = usePromotion();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('promo_dismissed') === '1'
  );

  const dismiss = () => {
    sessionStorage.setItem('promo_dismissed', '1');
    setDismissed(true);
  };

  const marqueeText = `🍂 ${banner.headline} — ${banner.subtext}`;

  return (
    <AnimatePresence>
      {isVisible && !dismissed && (
        <motion.div
          key="promo-bar"
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative overflow-hidden z-[60]"
          style={{
            background: 'linear-gradient(100deg, #6b2700 0%, #9a3400 38%, #c05000 72%, #a83a00 100%)',
          }}
          aria-label="Oferta promocional"
        >
          {/* Subtle shimmer overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,200,100,0.07) 50%, transparent 100%)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'linear', repeatDelay: 2 }}
          />

          <div className="relative flex items-center gap-2 px-4 py-2 max-w-7xl mx-auto">

            {/* Pulsing discount badge */}
            <motion.div
              className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full font-black text-sm leading-none"
              style={{ background: 'rgba(255,220,140,0.18)', color: '#ffd890', border: '1px solid rgba(255,210,100,0.3)' }}
              animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 0px rgba(255,200,80,0)', '0 0 10px rgba(255,200,80,0.45)', '0 0 0px rgba(255,200,80,0)'] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            >
              <Zap className="w-3 h-3" />
              {banner.discount}% off
            </motion.div>

            {/* Desktop: static message */}
            <div className="hidden md:flex flex-1 items-center justify-center gap-2 text-sm text-white">
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{banner.headline}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>—</span>
              <span style={{ color: 'rgba(255,255,255,0.60)' }}>{banner.subtext}</span>
            </div>

            {/* Mobile: marquee */}
            <div className="md:hidden flex-1 overflow-hidden">
              <div className="marquee-track">
                <span className="marquee-item text-xs text-white opacity-80">{marqueeText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <span className="marquee-item text-xs text-white opacity-80" aria-hidden>{marqueeText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              to={banner.ctaLink}
              className="shrink-0 hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
              style={{ background: '#f0dcc0', color: '#7a2800' }}
            >
              {banner.ctaLabel} →
            </Link>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              aria-label="Cerrar banner"
              className="shrink-0 p-1 rounded-full transition-colors ml-1"
              style={{ color: 'rgba(255,255,255,0.55)' }}
              onMouseOver={e => (e.currentTarget.style.color = '#fff')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
