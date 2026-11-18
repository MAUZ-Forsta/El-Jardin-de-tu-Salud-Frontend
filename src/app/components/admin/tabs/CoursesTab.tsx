/**
 * CoursesTab — gestión CRUD de cursos con soporte de contenido YouTube.
 *
 * ARQUITECTURA MOBILE-FIRST
 * ─────────────────────────
 * • Base → móvil: tarjetas apiladas, drawer full-screen, controles táctiles.
 * • sm: (≥640 px) → tabla completa, drawer max-w-md.
 *
 * COMPOSABLES UTILIZADOS
 * ──────────────────────
 * • useDrawer<Course>     — apertura/cierre del drawer de edición.
 * • useDeleteConfirm      — double-confirm táctil-seguro.
 * • useSearch             — búsqueda reactiva con useMemo.
 * • useDirtyForm          — guard de cambios sin guardar (incluye videos[]).
 * • useDiscountPrice      — preview de precio con descuento en tiempo real.
 *
 * YOUTUBE
 * ───────
 * • lessons > 10  → modo playlist: el admin pega la URL de la lista de
 *   reproducción de YouTube; se incrusta el playlist player completo.
 * • lessons ≤ 10  → modo individual: el admin agrega links de videos
 *   uno a uno y puede reordenarlos con flechas ↑↓ (mobile-safe).
 * • Sin API key: thumbnails vía img.youtube.com, embed vía youtube-nocookie.
 * • youtubeGroupUrl: link del canal, grupo o comunidad de YouTube del curso.
 */
import { useState } from 'react';
import {
  Plus, Pencil, Trash2, Search, X, Check, Tag, AlertTriangle,
  Youtube, ChevronUp, ChevronDown, Link2, PlayCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Course, YouTubeVideo } from '../../../data';
import type { DiscountRule } from '../../../context/AuthContext';
import { useDrawer, useDeleteConfirm, useSearch, useDiscountPrice, useDirtyForm } from '../../../hooks';
import ImageUploader from '../../ImageUploader';
import {
  parseVideoId, parsePlaylistId, thumbnailUrl, embedUrl, embedPlaylistUrl, PLAYLIST_THRESHOLD,
} from '../../../utils/youtube';

interface Props {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  discountRules: DiscountRule[];
}

const LEVELS = ['Principiante', 'Intermedio', 'Avanzado'] as const;

const LEVEL_STYLE: Record<string, { bg: string; color: string }> = {
  Principiante: { bg: 'var(--brand-section-green)', color: 'var(--brand-green)' },
  Intermedio:   { bg: 'var(--brand-orange-soft)', color: 'var(--brand-orange)' },
  Avanzado:     { bg: '#fef2f2', color: '#b91c1c' },
};

const coursePredicate = (c: Course, query: string) =>
  c.title.toLowerCase().includes(query.toLowerCase()) ||
  c.instructor.toLowerCase().includes(query.toLowerCase());

/* ── TagInput ────────────────────────────────────────── */
function TagInput({ value, onChange, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
  };
  return (
    <div className="border border-gray-200 rounded-xl p-2.5 bg-gray-50">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-white font-medium"
            style={{ background: 'var(--brand-orange)' }}>
            {tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}>
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        placeholder={placeholder ?? 'Escribe y presiona Enter'}
        className="w-full text-sm bg-transparent focus:outline-none min-h-[28px]" />
    </div>
  );
}

/* ── YouTubeVideoRow — fila de un video individual ───── */
function YouTubeVideoRow({ video, index, total, onUpdate, onRemove, onMoveUp, onMoveDown }: {
  video: YouTubeVideo; index: number; total: number;
  onUpdate: (v: YouTubeVideo) => void; onRemove: () => void;
  onMoveUp: () => void; onMoveDown: () => void;
}) {
  const [showEmbed, setShowEmbed] = useState(false);
  const vid = parseVideoId(video.url);
  const thumb = vid ? thumbnailUrl(vid) : null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-start gap-2 p-2.5">
        {/* Thumbnail / play preview */}
        <button type="button" onClick={() => vid && setShowEmbed(p => !p)}
          className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0 group"
          title={vid ? (showEmbed ? 'Cerrar preview' : 'Ver preview') : 'Pega un link válido de YouTube'}>
          {thumb
            ? <img src={thumb} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Youtube className="w-6 h-6 text-red-300" /></div>
          }
          {vid && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
          )}
        </button>

        {/* Inputs */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <input value={video.title} onChange={e => onUpdate({ ...video, title: e.target.value })}
            placeholder={`Lección ${index + 1}`}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none" />
          <input value={video.url} onChange={e => onUpdate({ ...video, url: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none font-mono" />
        </div>

        {/* Reorder + remove */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button type="button" onClick={onMoveUp} disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30 hover:bg-gray-100">
            <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg disabled:opacity-30 hover:bg-gray-100">
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button type="button" onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inline embed preview */}
      <AnimatePresence>
        {showEmbed && vid && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-gray-100">
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe src={embedUrl(vid)} title={video.title || `Lección ${index + 1}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── YouTubeSection — sección dentro del CourseForm ──── */
function YouTubeSection({ lessons, playlistUrl, groupUrl, videos, onPlaylistUrl, onGroupUrl, onVideos }: {
  lessons: number;
  playlistUrl: string; groupUrl: string; videos: YouTubeVideo[];
  onPlaylistUrl: (v: string) => void; onGroupUrl: (v: string) => void;
  onVideos: (v: YouTubeVideo[]) => void;
}) {
  const isPlaylistMode = lessons > PLAYLIST_THRESHOLD;
  const playlistId = parsePlaylistId(playlistUrl);

  const addVideo = () => {
    onVideos([...videos, { id: Date.now().toString(), title: '', url: '' }]);
  };

  const updateVideo = (index: number, v: YouTubeVideo) => {
    onVideos(videos.map((vi, i) => i === index ? v : vi));
  };

  const removeVideo = (index: number) => {
    onVideos(videos.filter((_, i) => i !== index));
  };

  const moveVideo = (from: number, to: number) => {
    const next = [...videos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onVideos(next);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3.5 py-3 bg-red-50 border-b border-red-100">
        <Youtube className="w-4 h-4 text-red-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-700">Contenido de YouTube</p>
          <p className="text-xs text-red-500">
            {isPlaylistMode
              ? `${lessons} lecciones → modo playlist automático`
              : `${lessons} lecciones → gestión individual de videos`}
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white bg-red-500 shrink-0">
          {isPlaylistMode ? 'Playlist' : 'Individual'}
        </span>
      </div>

      <div className="p-3.5 space-y-4">
        {/* Canal / grupo */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Canal o grupo de YouTube (opcional)
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={groupUrl} onChange={e => onGroupUrl(e.target.value)}
              placeholder="https://youtube.com/@canal o https://youtube.com/channel/..."
              className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-none font-mono" />
          </div>
        </div>

        {/* MODO PLAYLIST */}
        {isPlaylistMode && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                URL de la lista de reproducción *
              </label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-400" />
                <input value={playlistUrl} onChange={e => onPlaylistUrl(e.target.value)}
                  placeholder="https://youtube.com/playlist?list=PLxxxxxxxxxxxxxxx"
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-none font-mono" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Los {lessons} videos se asignarán automáticamente desde la lista de reproducción.
              </p>
            </div>

            {playlistId && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Vista previa del playlist</p>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <div className="relative" style={{ paddingBottom: '56.25%' }}>
                    <iframe src={embedPlaylistUrl(playlistId)} title="Playlist preview"
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODO INDIVIDUAL */}
        {!isPlaylistMode && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Videos del curso ({videos.length}/{lessons})
              </label>
              {videos.length < lessons && (
                <button type="button" onClick={addVideo}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white"
                  style={{ background: 'var(--brand-orange)' }}>
                  <Plus className="w-3 h-3" /> Agregar video
                </button>
              )}
            </div>

            {videos.length === 0 ? (
              <button type="button" onClick={addVideo}
                className="w-full py-5 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 text-gray-400 hover:border-red-200 hover:text-red-400 transition-colors">
                <Youtube className="w-6 h-6" />
                <p className="text-xs font-medium">Toca para agregar el primer video</p>
                <p className="text-xs opacity-70">Hasta {lessons} lecciones</p>
              </button>
            ) : (
              <div className="space-y-2">
                {videos.map((video, i) => (
                  <YouTubeVideoRow key={video.id} video={video} index={i} total={videos.length}
                    onUpdate={v => updateVideo(i, v)}
                    onRemove={() => removeVideo(i)}
                    onMoveUp={() => moveVideo(i, i - 1)}
                    onMoveDown={() => moveVideo(i, i + 1)} />
                ))}
                {videos.length < lessons && (
                  <button type="button" onClick={addVideo}
                    className="w-full py-3 border border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:border-red-200 hover:text-red-400 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Agregar video ({videos.length}/{lessons})
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── effectivePrice helper (pure) ────────────────────── */
function effectivePrice(course: Course, rules: DiscountRule[]): number {
  if (!course.discountEnabled || !course.discountId) return course.price;
  const rule = rules.find(r => r.id === course.discountId);
  if (!rule) return course.price;
  return Math.max(0, rule.type === 'percentage'
    ? course.price * (1 - rule.value / 100)
    : course.price - rule.value);
}

/* ── CourseForm — usa useDirtyForm + useDiscountPrice ── */
function CourseForm({ title, initial, onSave, onClose, discountRules }: {
  title: string;
  initial: Partial<Course> | null;
  onSave: (data: Omit<Course, 'id' | 'rating' | 'students'> & { id?: string }) => void;
  onClose: () => void;
  discountRules: DiscountRule[];
}) {
  const seed = initial
    ? { ...initial, originalPrice: initial.originalPrice ?? initial.price }
    : {};

  const defaultValues = {
    title: '', instructor: '', image: '',
    price: 0, originalPrice: undefined as number | undefined,
    duration: '', lessons: 0, level: 'Principiante' as Course['level'],
    description: '', topics: [] as string[],
    discountId: undefined as string | undefined, discountEnabled: false,
    youtubePlaylistUrl: '' as string,
    youtubeGroupUrl: '' as string,
    youtubeVideos: [] as YouTubeVideo[],
  };

  const { form, set, isDirty } = useDirtyForm({ ...defaultValues, ...seed });
  const [confirmingClose, setConfirmingClose] = useState(false);

  const basePrice = Number(form.originalPrice) || 0;
  const { activeRule, computedPrice, discountLabel } = useDiscountPrice(
    basePrice, !!form.discountEnabled, form.discountId, discountRules
  );

  const requestClose = () => isDirty ? setConfirmingClose(true) : onClose();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: (form as { id?: string }).id,
      title: form.title,
      instructor: form.instructor,
      image: form.image,
      price: computedPrice,
      originalPrice: form.discountEnabled && activeRule ? basePrice : undefined,
      duration: form.duration,
      lessons: Number(form.lessons),
      level: form.level,
      description: form.description,
      topics: form.topics,
      discountId: form.discountEnabled ? form.discountId : undefined,
      discountEnabled: form.discountEnabled,
      youtubePlaylistUrl: form.youtubePlaylistUrl || undefined,
      youtubeGroupUrl: form.youtubeGroupUrl || undefined,
      youtubeVideos: form.youtubeVideos.length > 0 ? form.youtubeVideos : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--brand-orange)' }}>{title}</h3>
          {isDirty && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium shrink-0">
              Sin guardar
            </span>
          )}
        </div>
        <button type="button" onClick={requestClose}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 shrink-0">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        <ImageUploader value={form.image} onChange={v => set('image', v)} label="Imagen del curso" />

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Título *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Instructor *</label>
          <input required value={form.instructor} onChange={e => set('instructor', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Nivel</label>
            <select value={form.level} onChange={e => set('level', e.target.value as Course['level'])}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none">
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Duración</label>
            <input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="Ej: 8 horas"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Lecciones
              {Number(form.lessons) > PLAYLIST_THRESHOLD
                ? <span className="ml-1 text-red-500 font-normal normal-case">(playlist)</span>
                : <span className="ml-1 text-green-600 font-normal normal-case">(individual)</span>}
            </label>
            <input type="number" min="1" value={form.lessons}
              onChange={e => set('lessons', Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Precio base *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input required type="number" min="0" step="0.01" value={form.originalPrice ?? ''}
                onChange={e => set('originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0.00"
                className="w-full pl-6 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Discount */}
        <div className="border border-gray-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 shrink-0" style={{ color: 'var(--brand-orange)' }} />
              <div>
                <p className="text-sm font-semibold text-gray-700">Aplicar descuento</p>
                <p className="text-xs text-gray-400">Activa un descuento automático</p>
              </div>
            </div>
            <button type="button" onClick={() => set('discountEnabled', !form.discountEnabled)}
              className="relative w-11 h-6 rounded-full transition-colors shrink-0"
              style={{ background: form.discountEnabled ? 'var(--brand-orange)' : '#e5e7eb' }}>
              <motion.div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                animate={{ left: form.discountEnabled ? '1.375rem' : '0.25rem' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
            </button>
          </div>

          {form.discountEnabled && (
            <div className="mt-3 space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Regla de descuento</label>
              {discountRules.length === 0
                ? <p className="text-xs text-gray-400 py-2">Sin reglas. Créalas en Configuración → Descuentos.</p>
                : (
                  <select value={form.discountId ?? ''} onChange={e => set('discountId', e.target.value || undefined)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none">
                    <option value="">Seleccionar regla...</option>
                    {discountRules.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                )}
              {activeRule && basePrice > 0 && (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--brand-orange-soft)' }}>
                  <div>
                    <p className="text-xs text-gray-500">Precio base</p>
                    <p className="text-sm font-semibold text-gray-400 line-through">${basePrice.toFixed(2)}</p>
                  </div>
                  <span className="text-gray-300">→</span>
                  <div>
                    <p className="text-xs text-gray-500">Precio final</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--brand-orange)' }}>${computedPrice.toFixed(2)}</p>
                  </div>
                  <span className="ml-auto text-xs font-bold px-2 py-1 rounded-lg text-white" style={{ background: 'var(--brand-orange)' }}>
                    {discountLabel}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Descripción *</label>
          <textarea required rows={3} value={form.description} onChange={e => set('description', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none resize-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Temas del curso</label>
          <TagInput value={form.topics} onChange={v => set('topics', v)} placeholder="Ej: Identificación de plantas" />
        </div>

        {/* ── Sección YouTube ─────────────────────────────── */}
        <YouTubeSection
          lessons={Number(form.lessons)}
          playlistUrl={form.youtubePlaylistUrl ?? ''}
          groupUrl={form.youtubeGroupUrl ?? ''}
          videos={form.youtubeVideos ?? []}
          onPlaylistUrl={v => set('youtubePlaylistUrl', v)}
          onGroupUrl={v => set('youtubeGroupUrl', v)}
          onVideos={v => set('youtubeVideos', v)}
        />
      </div>

      {/* Footer */}
      <AnimatePresence mode="wait">
        {confirmingClose ? (
          <motion.div key="confirm"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="shrink-0 border-t border-amber-100 bg-amber-50 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-amber-800">Tienes cambios sin guardar. ¿Qué deseas hacer?</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-amber-200 text-sm font-medium text-amber-700 bg-white">
                Descartar
              </button>
              <button type="button" onClick={() => setConfirmingClose(false)}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: 'var(--brand-orange)' }}>
                Seguir editando
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="actions"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="shrink-0 p-4 sm:p-5 border-t border-gray-100 flex gap-3">
            <button type="button" onClick={requestClose}
              className="flex-1 py-3.5 rounded-xl border text-sm font-medium transition-colors"
              style={isDirty
                ? { borderColor: '#fcd34d', color: '#92400e', background: '#fffbeb' }
                : { borderColor: '#e5e7eb', color: '#4b5563' }}>
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-3.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: 'var(--brand-orange)', opacity: isDirty ? 1 : 0.7 }}>
              {initial?.id ? 'Guardar cambios' : 'Crear curso'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

/* ── CoursesTab — usa useDrawer + useDeleteConfirm + useSearch */
export default function CoursesTab({ courses, setCourses, discountRules }: Props) {
  const drawer = useDrawer<Course>();
  const del = useDeleteConfirm();
  const { query, setQuery, filtered } = useSearch(courses, coursePredicate);

  const handleSave = (data: Omit<Course, 'id' | 'rating' | 'students'> & { id?: string }) => {
    if (data.id) {
      setCourses(prev => prev.map(c => c.id === data.id ? { ...c, ...data } : c));
    } else {
      setCourses(prev => [...prev, { ...data, id: Date.now().toString(), rating: 4.5, students: 0 }]);
    }
    drawer.close();
  };

  const handleDelete = (id: string) => setCourses(prev => prev.filter(c => c.id !== id));

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--brand-green)' }}>Cursos</h2>
          <p className="text-sm text-gray-400">{courses.length} disponibles</p>
        </div>
        <button onClick={() => drawer.open()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'var(--brand-orange)' }}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo curso</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por título o instructor..."
          className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none" />
      </div>

      {/* Mobile cards */}
      <div className="flex-1 overflow-y-auto space-y-2 sm:hidden">
        <AnimatePresence>
          {filtered.map(course => {
            const ep = effectivePrice(course, discountRules);
            const hasDiscount = course.discountEnabled && ep < course.price;
            const hasYT = !!(course.youtubePlaylistUrl || course.youtubeGroupUrl || (course.youtubeVideos?.length));
            return (
              <motion.div key={course.id} layout
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <img src={course.image} alt={course.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--brand-green)' }}>{course.title}</p>
                      {hasYT && <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm font-bold" style={{ color: 'var(--brand-orange)' }}>${ep.toFixed(2)}</span>
                      {hasDiscount && <span className="text-xs text-gray-400 line-through">${course.price.toFixed(2)}</span>}
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: LEVEL_STYLE[course.level].bg, color: LEVEL_STYLE[course.level].color }}>
                        {course.level}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => drawer.open(course)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-orange-50"
                      style={{ color: 'var(--brand-orange)' }}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    {del.isPending(course.id) ? (
                      <>
                        <button onClick={() => del.confirm(course.id, handleDelete)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600"><Check className="w-4 h-4" /></button>
                        <button onClick={del.cancel} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400"><X className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <button onClick={() => del.request(course.id)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-400"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {del.isPending(course.id) && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden border-t border-red-100">
                      <p className="text-xs text-center text-red-600 py-2 bg-red-50 font-medium">¿Confirmar eliminación? Toca ✓ para borrar</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && <div className="text-center py-16 text-gray-400 text-sm">No hay cursos</div>}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:flex flex-1 overflow-auto bg-white rounded-2xl border border-gray-100 shadow-sm flex-col">
        <table className="w-full min-w-[640px]">
          <thead className="sticky top-0 bg-white border-b border-gray-100">
            <tr>
              {['Curso', 'Instructor', 'Nivel', 'Lecciones', 'Precio', 'Estudiantes', 'Acciones'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(course => {
              const ep = effectivePrice(course, discountRules);
              const hasDiscount = course.discountEnabled && ep < course.price;
              const hasYT = !!(course.youtubePlaylistUrl || course.youtubeGroupUrl || (course.youtubeVideos?.length));
              return (
                <tr key={course.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={course.image} alt={course.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-36" style={{ color: 'var(--brand-green)' }}>{course.title}</p>
                        {hasYT && (
                          <span className="flex items-center gap-0.5 text-xs text-red-500 mt-0.5">
                            <Youtube className="w-3 h-3" />
                            {course.youtubeVideos?.length
                              ? `${course.youtubeVideos.length} videos`
                              : 'Playlist'}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-32 truncate">{course.instructor}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: LEVEL_STYLE[course.level].bg, color: LEVEL_STYLE[course.level].color }}>
                      {course.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{course.lessons}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold" style={{ color: 'var(--brand-orange)' }}>${ep.toFixed(2)}</p>
                    {hasDiscount && <p className="text-xs text-gray-400 line-through">${course.price.toFixed(2)}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{course.students.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => drawer.open(course)}
                        className="p-2 rounded-lg hover:bg-orange-50 transition-colors" style={{ color: 'var(--brand-orange)' }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {del.isPending(course.id) ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => del.confirm(course.id, handleDelete)} className="p-1.5 rounded-lg bg-red-50 text-red-600"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={del.cancel} className="p-1.5 rounded-lg bg-gray-50 text-gray-400"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => del.request(course.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No hay cursos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawer.isOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={drawer.close} />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
              <CourseForm
                title={drawer.item ? 'Editar curso' : 'Nuevo curso'}
                initial={drawer.item}
                onSave={handleSave}
                onClose={drawer.close}
                discountRules={discountRules}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
