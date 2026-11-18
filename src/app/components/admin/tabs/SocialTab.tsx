import { useState } from 'react';
import { Save, Youtube, Instagram, Facebook, Music2, MessageCircle, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteConfig } from '../../../facades/siteConfigFacade';
import type { SocialLinks } from '../../../facades/siteConfigFacade';

const SOCIAL_FIELDS: {
  key: keyof SocialLinks;
  label: string;
  Icon: React.ElementType;
  placeholder: string;
  color: string;
}[] = [
  { key: 'youtube',   label: 'YouTube',   Icon: Youtube,        placeholder: 'https://youtube.com/@tucanal',         color: '#ff0000' },
  { key: 'facebook',  label: 'Facebook',  Icon: Facebook,       placeholder: 'https://facebook.com/tupagina',        color: '#1877f2' },
  { key: 'instagram', label: 'Instagram', Icon: Instagram,      placeholder: 'https://instagram.com/tuperfil',       color: '#e1306c' },
  { key: 'tiktok',    label: 'TikTok',    Icon: Music2,         placeholder: 'https://tiktok.com/@tuperfil',         color: '#010101' },
  { key: 'whatsapp',  label: 'WhatsApp',  Icon: MessageCircle,  placeholder: 'https://wa.me/521234567890',           color: '#25d366' },
];

export default function SocialTab() {
  const { social, updateSocial } = useSiteConfig();
  const [form, setForm] = useState<SocialLinks>({ ...social });
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateSocial(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const inputCls = 'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-colors';
  const inputStyle = { background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-green-soft)' }}>
          <Link2 className="w-5 h-5" style={{ color: 'var(--brand-green)' }} />
        </div>
        <div>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Redes Sociales</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Los enlaces activos aparecerán en el footer del sitio
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        {SOCIAL_FIELDS.map(({ key, label, Icon, placeholder, color }) => (
          <div key={key}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              {label}
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 shrink-0"
                style={{ color: form[key] ? color : 'var(--muted-foreground)' }} />
              <input
                type="url"
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>
          Vista previa — iconos activos en footer
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {SOCIAL_FIELDS.map(({ key, Icon, label, color }) =>
            form[key] ? (
              <div
                key={key}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ) : null
          )}
          {!SOCIAL_FIELDS.some(({ key }) => form[key]) && (
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Ninguna red configurada aún
            </p>
          )}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={save}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white hover:opacity-90 transition-opacity"
        style={{ background: saved ? 'var(--brand-green)' : 'var(--brand-orange)' }}
      >
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              Guardado
            </motion.span>
          ) : (
            <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Guardar redes sociales
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
