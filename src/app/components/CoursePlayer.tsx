/**
 * CoursePlayer — reproductor completo con lista de lecciones y progreso.
 *
 * REGLAS DE DESBLOQUEO:
 * • La lección 0 siempre está desbloqueada.
 * • La lección N se desbloquea cuando la lección N-1 está completada.
 * • El botón "Marcar como completado" desbloquea la siguiente lección
 *   y avanza automáticamente.
 *
 * MODOS:
 * • Individual (lessons ≤ 10): usa course.youtubeVideos[] — cada video
 *   tiene su propio iframe con la URL exacta.
 * • Playlist (lessons > 10):  usa course.youtubePlaylistUrl — incrusta
 *   el player de playlist con &index=N para cada lección numerada.
 *   El usuario ve lecciones "Lección 1", "Lección 2"… aun sin títulos reales.
 *
 * MOBILE-FIRST:
 * • Base (< sm): columna única — player arriba, lista abajo con scroll.
 * • sm+: grid 2 col — player + info a la izquierda, sidebar de lista a la derecha.
 * • lg+: sidebar más ancha (320px).
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, CheckCircle, Lock, PlayCircle, Youtube,
  BookOpen, Clock, ChevronRight, Trophy, RotateCcw, ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { parseVideoId, parsePlaylistId, embedUrl, embedPlaylistUrl, PLAYLIST_THRESHOLD } from '../utils/youtube';
import type { Course } from '../data';

/* ── Lesson model (normalized across both modes) ─────── */
interface Lesson {
  id: string;
  title: string;
  embedSrc: string | null;
}

function buildLessons(course: Course): Lesson[] {
  // Individual video mode
  if (course.youtubeVideos?.length) {
    return course.youtubeVideos.map((v, i) => {
      const vid = parseVideoId(v.url);
      return {
        id: v.id,
        title: v.title || `Lección ${i + 1}`,
        embedSrc: vid ? embedUrl(vid) : null,
      };
    });
  }

  // Playlist mode: create numbered slots
  if (course.youtubePlaylistUrl) {
    const playlistId = parsePlaylistId(course.youtubePlaylistUrl);
    if (playlistId) {
      return Array.from({ length: course.lessons }, (_, i) => ({
        id: `lesson-${i}`,
        title: `Lección ${i + 1}`,
        embedSrc: `${embedPlaylistUrl(playlistId)}&index=${i}`,
      }));
    }
  }

  return [];
}

function isUnlocked(index: number, completedIds: string[]): boolean {
  if (index === 0) return true;
  return completedIds.includes(`__lesson_${index - 1}`);
}

function progressKey(lessonIndex: number) {
  return `__lesson_${lessonIndex}`;
}

/* ── LessonRow — one item in the sidebar ─────────────── */
function LessonRow({ lesson, index, isCurrent, isCompleted, isLocked, onClick }: {
  lesson: Lesson; index: number;
  isCurrent: boolean; isCompleted: boolean; isLocked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
        isCurrent
          ? 'text-white'
          : isCompleted
          ? 'bg-green-50 hover:bg-green-100'
          : isLocked
          ? 'opacity-50 cursor-not-allowed bg-gray-50'
          : 'bg-white hover:bg-gray-50 border border-gray-100'
      }`}
      style={isCurrent ? { background: 'var(--brand-green)' } : {}}>
      {/* Status icon */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
        isCurrent ? 'bg-white/20' :
        isCompleted ? 'bg-green-500' :
        isLocked ? 'bg-gray-200' : 'bg-gray-100'
      }`} style={isCurrent ? { color: '#fff' } : {}}>
        {isCompleted
          ? <CheckCircle className="w-4 h-4 text-white" />
          : isLocked
          ? <Lock className="w-3.5 h-3.5 text-gray-400" />
          : isCurrent
          ? <PlayCircle className="w-4 h-4 text-white" />
          : <span className={isLocked ? 'text-gray-400' : 'text-gray-500'}>{index + 1}</span>
        }
      </div>

      {/* Title */}
      <span className={`flex-1 text-sm font-medium truncate ${
        isCurrent ? 'text-white' :
        isCompleted ? 'text-green-800' :
        isLocked ? 'text-gray-400' : 'text-gray-700'
      }`}>{lesson.title}</span>

      {isCurrent && <ChevronRight className="w-4 h-4 text-white/70 shrink-0" />}
    </button>
  );
}

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, adminCourses, isEnrolled, markVideoComplete, getCompletedVideos } = useAuth();

  const course = adminCourses.find(c => c.id === id);
  const lessons = course ? buildLessons(course) : [];
  const completedIds = id ? getCompletedVideos(id) : [];

  // Current lesson index (starts at first incomplete unlocked)
  const firstUnlocked = lessons.findIndex((_, i) =>
    !completedIds.includes(progressKey(i)) && isUnlocked(i, completedIds)
  );
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, firstUnlocked));

  const currentLesson = lessons[currentIndex] ?? null;
  const isCurrentCompleted = currentLesson
    ? completedIds.includes(progressKey(currentIndex))
    : false;
  const isLastLesson = currentIndex === lessons.length - 1;
  const isAllDone = lessons.length > 0 && lessons.every((_, i) => completedIds.includes(progressKey(i)));

  // Progress counts
  const completedCount = lessons.filter((_, i) => completedIds.includes(progressKey(i))).length;
  const progressPct = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  // "Mark complete" cooldown: enable 5s after selecting a video
  const [canMark, setCanMark] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCanMark(false);
    if (cooldownRef.current) clearTimeout(cooldownRef.current);
    cooldownRef.current = setTimeout(() => setCanMark(true), 5000);
    return () => { if (cooldownRef.current) clearTimeout(cooldownRef.current); };
  }, [currentIndex]);

  // Sidebar list ref for auto-scroll
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = listRef.current?.children[currentIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentIndex]);

  const handleMarkComplete = () => {
    if (!id || !canMark || isCurrentCompleted) return;
    markVideoComplete(id, progressKey(currentIndex));
    // Auto-advance to next unlocked lesson
    if (!isLastLesson) {
      setTimeout(() => setCurrentIndex(i => i + 1), 600);
    }
  };

  const handleSelectLesson = (index: number) => {
    if (isUnlocked(index, completedIds)) setCurrentIndex(index);
  };

  // Guards
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-500 mb-4">Curso no encontrado.</p>
          <button onClick={() => navigate('/cursos')} className="px-6 py-3 rounded-xl text-white text-sm font-medium" style={{ background: 'var(--brand-green)' }}>
            ← Volver a Cursos
          </button>
        </div>
      </div>
    );
  }

  if (!user || !isEnrolled(course.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm max-w-sm w-full">
          <Lock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h2 className="font-bold mb-2 text-gray-800">Acceso restringido</h2>
          <p className="text-gray-500 text-sm mb-6">Debes inscribirte para acceder al contenido del curso.</p>
          <button onClick={() => navigate('/cursos')} className="w-full py-3 rounded-xl text-white font-medium text-sm" style={{ background: 'var(--brand-green)' }}>
            Ver cursos
          </button>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center p-8">
          <Youtube className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <h2 className="font-bold mb-2 text-gray-800">Sin videos configurados</h2>
          <p className="text-gray-500 text-sm mb-6">El instructor aún no ha cargado el contenido.</p>
          <button onClick={() => navigate('/cursos')} className="px-6 py-3 rounded-xl text-white text-sm font-medium" style={{ background: 'var(--brand-green)' }}>
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  /* ── Lesson sidebar (shared between mobile/desktop) ─ */
  const LessonList = ({ scrollable }: { scrollable?: boolean }) => (
    <div ref={listRef}
      className={`space-y-1.5 ${scrollable ? 'overflow-y-auto flex-1 min-h-0 p-3 sm:p-0' : ''}`}>
      {lessons.map((lesson, i) => {
        const completed = completedIds.includes(progressKey(i));
        const locked = !isUnlocked(i, completedIds);
        return (
          <LessonRow key={lesson.id} lesson={lesson} index={i}
            isCurrent={i === currentIndex}
            isCompleted={completed}
            isLocked={locked}
            onClick={() => handleSelectLesson(i)} />
        );
      })}
    </div>
  );

  /* ── Main render ──────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 h-14 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/cursos')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 shrink-0">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Mis cursos</span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--brand-green)' }}>{course.title}</p>
        </div>
        {/* Progress pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <span>{completedCount}/{lessons.length} lecciones</span>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: 'var(--brand-green)' }}
                animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>
          {course.youtubeGroupUrl && (
            <a href={course.youtubeGroupUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100">
              <Youtube className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Canal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </header>

      {/* Body: video + list */}
      <div className="flex-1 flex flex-col sm:grid sm:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px] overflow-hidden">

        {/* ── LEFT: video player + controls ────────────── */}
        <div className="flex flex-col overflow-y-auto">
          {/* Video */}
          <div className="w-full bg-black shrink-0" style={{ aspectRatio: '16/9' }}>
            <AnimatePresence mode="wait">
              {currentLesson?.embedSrc ? (
                <motion.iframe
                  key={currentLesson.id}
                  src={currentLesson.embedSrc}
                  title={currentLesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }} />
              ) : (
                <motion.div key="no-video"
                  className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/60"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Youtube className="w-12 h-12" />
                  <p className="text-sm">Video no disponible</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lesson info + controls */}
          <div className="p-4 sm:p-6 space-y-4 flex-1">
            {/* Lesson header */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                style={{ color: 'var(--brand-orange)' }}>
                Lección {currentIndex + 1} de {lessons.length}
              </p>
              <h2 className="text-base sm:text-lg font-bold" style={{ color: 'var(--brand-green)' }}>
                {currentLesson?.title}
              </h2>
            </div>

            {/* Mobile progress bar */}
            <div className="sm:hidden space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progreso del curso</span>
                <span>{completedCount}/{lessons.length} completadas</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: 'var(--brand-green)' }}
                  animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>

            {/* All done! */}
            <AnimatePresence>
              {isAllDone && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, var(--brand-section-green), #e8f5e9)', border: '1px solid #c8e6c9' }}>
                  <Trophy className="w-8 h-8 shrink-0" style={{ color: 'var(--brand-orange)' }} />
                  <div>
                    <p className="font-bold" style={{ color: 'var(--brand-green)' }}>¡Curso completado!</p>
                    <p className="text-sm text-gray-600">Has visto todas las lecciones. ¡Excelente trabajo!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mark complete / Already done */}
            {!isAllDone && (
              <div className="space-y-2">
                {isCurrentCompleted ? (
                  <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl bg-green-50 border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-800">Lección completada</p>
                      {!isLastLesson && (
                        <p className="text-xs text-green-600">La siguiente lección está desbloqueada</p>
                      )}
                    </div>
                    {!isLastLesson && (
                      <button onClick={() => setCurrentIndex(i => i + 1)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-semibold shrink-0"
                        style={{ background: 'var(--brand-green)' }}>
                        Siguiente <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleMarkComplete}
                    disabled={!canMark}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: canMark ? 'var(--brand-orange)' : '#e5e7eb',
                      color: canMark ? '#fff' : '#9ca3af',
                      cursor: canMark ? 'pointer' : 'default',
                    }}>
                    {canMark
                      ? <><CheckCircle className="w-5 h-5" /> Marcar como completado</>
                      : <><RotateCcw className="w-5 h-5 animate-spin" style={{ animationDuration: '2s' }} /> Cargando lección…</>}
                  </motion.button>
                )}
              </div>
            )}

            {/* Course info chips */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 border-t border-gray-100 pt-4">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{course.lessons} clases</span>
              <span className="flex items-center gap-1.5"><Youtube className="w-3.5 h-3.5 text-red-500" />
                {course.lessons > PLAYLIST_THRESHOLD ? 'Playlist de YouTube' : 'Videos de YouTube'}
              </span>
            </div>

            {/* Mobile: lesson list */}
            <div className="sm:hidden">
              <p className="text-sm font-bold mb-3" style={{ color: 'var(--brand-green)' }}>
                Todas las lecciones ({lessons.length})
              </p>
              <LessonList />
            </div>
          </div>
        </div>

        {/* ── RIGHT: lesson sidebar (desktop only) ─────── */}
        <aside className="hidden sm:flex flex-col bg-white border-l border-gray-100 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-100 shrink-0">
            <p className="text-sm font-bold" style={{ color: 'var(--brand-green)' }}>Lecciones</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">{completedCount} de {lessons.length} completadas</p>
              <span className="text-xs font-semibold" style={{ color: 'var(--brand-orange)' }}>
                {Math.round(progressPct)}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: 'var(--brand-green)' }}
                animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <LessonList />
          </div>
        </aside>
      </div>
    </div>
  );
}
