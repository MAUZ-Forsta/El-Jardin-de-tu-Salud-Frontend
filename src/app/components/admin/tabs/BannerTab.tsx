import { useState } from 'react';
import { Megaphone, ToggleLeft, ToggleRight, Save, Zap, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePromotion } from '../../../facades/promotionFacade';

export default function BannerTab() {
  const { banner, updateBanner, isVisible } = usePromotion();
  const [form, setForm] = useState({ ...banner });
  const [saved, setSaved] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: key === 'discount' ? Number(e.target.value) : e.target.value }));

  const save = () => {
    updateBanner(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const toggleActive = () => {
    const next = !form.isActive;
    setForm(f => ({ ...f, isActive: next }));
    updateBanner({ isActive: next });
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-colors';
  const inputStyle = { background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-orange-soft)' }}>
            <Megaphone className="w-5 h-5" style={{ color: 'var(--brand-orange)' }} />
          </div>
          <div>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Banner Promocional</h2>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Aparece en la parte superior de todas las páginas
            </p>
          </div>
        </div>

        {/* Active toggle */}
        <button
          onClick={toggleActive}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
          style={form.isActive
            ? { background: 'var(--brand-green-soft)', color: 'var(--brand-green)' }
            : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
          }
        >
          {form.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          {form.isActive ? 'Activo' : 'Inactivo'}
        </button>
      </div>

      {/* Status pill */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isVisible ? 'active' : 'inactive'}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
          style={isVisible
            ? { background: 'var(--brand-green-soft)', color: 'var(--brand-green)', border: '1px solid var(--brand-green-soft)' }
            : { background: 'var(--muted)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }
          }
        >
          <span className="relative flex h-2 w-2">
            {isVisible && (
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full"
                style={{ background: 'var(--brand-green)' }}
                animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: isVisible ? 'var(--brand-green)' : 'var(--muted-foreground)' }} />
          </span>
          {isVisible ? 'Banner visible para todos los visitantes' : 'Banner oculto — no visible en el sitio'}
        </motion.div>
      </AnimatePresence>

      {/* Form fields */}
      <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Contenido</p>

        {/* Discount */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
            Descuento (%)
          </label>
          <div className="relative">
            <input
              type="number" min={1} max={99}
              value={form.discount}
              onChange={field('discount')}
              className={inputCls}
              style={inputStyle}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <Zap className="w-3.5 h-3.5" style={{ color: 'var(--brand-orange)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--brand-orange)' }}>%</span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
            Título del banner
          </label>
          <input
            type="text"
            value={form.headline}
            onChange={field('headline')}
            placeholder="Ej: Tés, plantas e infusiones"
            className={inputCls}
            style={inputStyle}
          />
        </div>

        {/* Subtext */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
            Descripción
          </label>
          <input
            type="text"
            value={form.subtext}
            onChange={field('subtext')}
            placeholder="Ej: Toda la colección de temporada. Sin código."
            className={inputCls}
            style={inputStyle}
          />
        </div>

        {/* CTA row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Texto del botón
            </label>
            <input
              type="text"
              value={form.ctaLabel}
              onChange={field('ctaLabel')}
              placeholder="Ver productos"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              Enlace
            </label>
            <input
              type="text"
              value={form.ctaLink}
              onChange={field('ctaLink')}
              placeholder="/tienda"
              className={inputCls}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <button
          onClick={() => setPreviewing(v => !v)}
          className="flex items-center gap-2 text-xs font-medium mb-3"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {previewing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {previewing ? 'Ocultar vista previa' : 'Ver vista previa'}
        </button>

        <AnimatePresence>
          {previewing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-xl"
            >
              <div
                className="relative overflow-hidden"
                style={{ background: 'linear-gradient(100deg, #6b2700 0%, #9a3400 38%, #c05000 72%, #a83a00 100%)' }}
              >
                <div className="flex items-center gap-2 px-4 py-2.5">
                  <div
                    className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full font-black text-sm"
                    style={{ background: 'rgba(255,220,140,0.18)', color: '#ffd890', border: '1px solid rgba(255,210,100,0.3)' }}
                  >
                    <Zap className="w-3 h-3" />{form.discount}% off
                  </div>
                  <div className="flex-1 text-xs text-white opacity-80 truncate">
                    {form.headline} — {form.subtext}
                  </div>
                  <span
                    className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: '#f0dcc0', color: '#7a2800' }}
                  >
                    {form.ctaLabel} →
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={save}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
        style={{ background: saved ? 'var(--brand-green)' : 'var(--brand-orange)' }}
      >
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              ✓ Guardado
            </motion.span>
          ) : (
            <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Guardar cambios
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
