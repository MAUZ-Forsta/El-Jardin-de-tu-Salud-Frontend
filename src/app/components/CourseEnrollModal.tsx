/**
 * CourseEnrollModal — confirmación antes de inscribirse a un curso.
 *
 * FLUJO:
 * • Curso gratuito  → botón "Inscribirse gratis" → enrollInCourse() → navegar al player
 * • Curso de pago   → botón "Proceder al pago"  → navegar a /pago/curso/:id
 *
 * MOBILE-FIRST:
 * • Base: modal full-screen con scroll interno, imagen arriba, detalles abajo.
 * • sm+: modal centrado max-w-lg con imagen en header fija.
 */
import { X, CheckCircle, Clock, BookOpen, Users, Star, Youtube, Lock, ArrowRight, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import type { Course } from '../data';
import { useAuth, getEffectivePrice } from '../context/AuthContext';
import { PLAYLIST_THRESHOLD } from '../utils/youtube';

interface Props {
  course: Course | null;
  onClose: () => void;
}

export default function CourseEnrollModal({ course, onClose }: Props) {
  const { user, enrollInCourse, isEnrolled, discountRules } = useAuth();
  const navigate = useNavigate();

  const alreadyEnrolled = course ? isEnrolled(course.id) : false;

  const effectivePrice = course
    ? getEffectivePrice({ ...course }, discountRules)
    : 0;

  const isFree = effectivePrice === 0;

  const handleEnroll = () => {
    if (!course) return;
    if (isFree) {
      enrollInCourse(course.id);
      onClose();
      navigate(`/cursos/${course.id}/ver`);
    } else {
      onClose();
      navigate(`/pago/curso/${course.id}`);
    }
  };

  const videoCount = course
    ? course.youtubeVideos?.length ?? (course.lessons ?? 0)
    : 0;

  const hasYT = course && (course.youtubePlaylistUrl || course.youtubeVideos?.length || course.youtubeGroupUrl);

  return (
    <AnimatePresence>
      {course && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[92svh]"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}>

              {/* Course image header */}
              <div className="relative h-44 shrink-0 overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)' }} />
                <button onClick={onClose}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                  <X className="w-5 h-5" />
                </button>
                {alreadyEnrolled && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
                    <CheckCircle className="w-3 h-3" /> Ya inscrito
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white mb-1 ${
                    course.level === 'Principiante' ? 'bg-green-500' :
                    course.level === 'Intermedio' ? 'bg-amber-500' : 'bg-red-500'
                  }`}>{course.level}</span>
                  <h2 className="text-white text-lg font-bold leading-tight">{course.title}</h2>
                  <p className="text-white/80 text-sm">{course.instructor}</p>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Stats row */}
                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" style={{ color: 'var(--brand-orange)' }} />{course.duration}</span>
                  <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" style={{ color: 'var(--brand-orange)' }} />{course.lessons} clases</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" style={{ color: 'var(--brand-orange)' }} />{course.students.toLocaleString()} estudiantes</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{course.rating}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>

                {/* Topics */}
                {course.topics.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--brand-green)' }}>Lo que aprenderás:</p>
                    <ul className="space-y-1.5">
                      {course.topics.slice(0, 5).map(t => (
                        <li key={t} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />{t}
                        </li>
                      ))}
                      {course.topics.length > 5 && (
                        <li className="text-xs text-gray-400 pl-6">+{course.topics.length - 5} temas más…</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* YouTube badge */}
                {hasYT && (
                  <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <Youtube className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        {course.lessons > PLAYLIST_THRESHOLD ? 'Playlist de YouTube' : `${videoCount} videos de YouTube`}
                      </p>
                      <p className="text-xs text-red-500">Contenido alojado en YouTube, sin descargas</p>
                    </div>
                  </div>
                )}

                {/* Precio */}
                <div className="flex items-end gap-2.5">
                  <span className="font-bold" style={{ color: 'var(--brand-green)', fontSize: '2rem', lineHeight: 1 }}>
                    {isFree ? 'Gratis' : `$${effectivePrice.toFixed(2)}`}
                  </span>
                  {!isFree && course.originalPrice && course.originalPrice > effectivePrice && (
                    <span className="text-gray-400 line-through text-base mb-1">${course.originalPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* CTA footer */}
              <div className="shrink-0 p-4 sm:p-5 border-t border-gray-100 space-y-2.5"
                style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
                {alreadyEnrolled ? (
                  <button
                    onClick={() => { onClose(); navigate(`/cursos/${course.id}/ver`); }}
                    className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
                    style={{ background: 'var(--brand-green-vivid)' }}>
                    <PlayCircle className="w-5 h-5" /> Continuar mi curso
                  </button>
                ) : (
                  <>
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={handleEnroll}
                      className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
                      style={{ background: isFree ? 'var(--brand-green)' : 'var(--brand-orange)' }}>
                      {isFree
                        ? <><CheckCircle className="w-5 h-5" /> Inscribirse gratis</>
                        : <><ArrowRight className="w-5 h-5" /> Proceder al pago — ${effectivePrice.toFixed(2)}</>}
                    </motion.button>
                    {!user && (
                      <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        Necesitarás una cuenta para inscribirte
                      </p>
                    )}
                  </>
                )}
                <button onClick={onClose} className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
