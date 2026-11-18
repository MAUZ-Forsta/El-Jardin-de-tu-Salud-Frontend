import { useState } from 'react';
import {
  Star, Clock, BookOpen, Users, CheckCircle, ChevronDown, ChevronUp,
  Lock, Youtube, PlayCircle, ExternalLink, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth, getEffectivePrice } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import CourseEnrollModal from './CourseEnrollModal';
import { parseVideoId, parsePlaylistId, thumbnailUrl, embedUrl, embedPlaylistUrl, PLAYLIST_THRESHOLD } from '../utils/youtube';
import type { Course } from '../data';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

/* ── Video player inside expanded course ─────────────── */
function CourseVideoSection({ course, enrolled }: { course: Course; enrolled: boolean }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const hasPlaylist = !!(course.youtubePlaylistUrl);
  const hasVideos = !!(course.youtubeVideos?.length);
  const isPlaylistMode = course.lessons > PLAYLIST_THRESHOLD;
  const playlistId = hasPlaylist ? parsePlaylistId(course.youtubePlaylistUrl!) : null;

  if (!hasPlaylist && !hasVideos && !course.youtubeGroupUrl) return null;

  return (
    <div className="border-t border-gray-100 pt-4 mt-1 mb-4">
      {/* Channel / group link */}
      {course.youtubeGroupUrl && (
        <a href={course.youtubeGroupUrl} target="_blank" rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium mb-3 hover:opacity-80 transition-opacity"
          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
          <Youtube className="w-3.5 h-3.5" />
          Ver canal / grupo de YouTube
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      )}

      {/* NOT enrolled → teaser */}
      {!enrolled && (hasPlaylist || hasVideos) && (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--brand-section-green)', border: '1px solid #c8e6c9' }}>
          <Lock className="w-5 h-5 shrink-0" style={{ color: 'var(--brand-green)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--brand-green)' }}>
              {isPlaylistMode
                ? `Playlist de ${course.lessons} videos disponible`
                : `${course.youtubeVideos!.length} videos disponibles`}
            </p>
            <p className="text-xs text-gray-500">Inscríbete para ver el contenido completo.</p>
          </div>
        </div>
      )}

      {/* Enrolled + PLAYLIST MODE */}
      {enrolled && isPlaylistMode && hasPlaylist && playlistId && (
        <div>
          <p className="text-sm font-semibold mb-2.5" style={{ color: 'var(--brand-green)' }}>
            Lista de reproducción ({course.lessons} videos)
          </p>
          <div className="rounded-xl overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe src={embedPlaylistUrl(playlistId)} title={course.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            </div>
          </div>
        </div>
      )}

      {/* Enrolled + INDIVIDUAL MODE */}
      {enrolled && !isPlaylistMode && hasVideos && (
        <div>
          <p className="text-sm font-semibold mb-2.5" style={{ color: 'var(--brand-green)' }}>
            Lecciones ({course.youtubeVideos!.length})
          </p>
          <div className="space-y-2" onClick={e => e.stopPropagation()}>
            {course.youtubeVideos!.map((video, i) => {
              const vid = parseVideoId(video.url);
              const thumb = vid ? thumbnailUrl(vid) : null;
              const isPlaying = activeVideo === video.id;

              return (
                <div key={video.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button type="button"
                    onClick={() => setActiveVideo(isPlaying ? null : video.id)}
                    className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 transition-colors text-left">
                    <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      {thumb
                        ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Youtube className="w-4 h-4 text-red-300" /></div>
                      }
                      {vid && !isPlaying && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <PlayCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--brand-green)' }}>
                        {video.title || `Lección ${i + 1}`}
                      </p>
                      <p className="text-xs text-gray-400">{isPlaying ? 'Reproduciendo...' : 'Toca para reproducir'}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isPlaying ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isPlaying && vid && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden border-t border-gray-100">
                        <div className="relative" style={{ paddingBottom: '56.25%' }}>
                          <iframe src={embedUrl(vid)} title={video.title || `Lección ${i + 1}`}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Courses() {
  const { user, isEnrolled, adminCourses: courses, discountRules } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState(false);
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);
  const [enrollModalCourse, setEnrollModalCourse] = useState<Course | null>(null);

  const handleEnrollClick = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    if (!user) { setPendingCourseId(course.id); setAuthModal(true); return; }
    if (isEnrolled(course.id)) { navigate(`/cursos/${course.id}/ver`); return; }
    setEnrollModalCourse(course);
  };

  const handleAuthSuccess = () => {
    if (pendingCourseId) {
      const course = courses.find(c => c.id === pendingCourseId);
      if (course) setEnrollModalCourse(course);
      setPendingCourseId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-8 sm:mb-12">
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-orange)' }}>Formación</span>
        <h1 className="mt-0.5" style={{ color: 'var(--brand-green)' }}>Cursos de Medicina Natural</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
          Aprende de los mejores expertos en medicina natural desde la comodidad de tu hogar.
        </p>
        {!user && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm"
            style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
            <Lock className="w-4 h-4" /> Regístrate gratis para inscribirte
          </motion.div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-12 p-4 sm:p-6 rounded-2xl"
        style={{ background: 'var(--brand-section-green)' }}>
        {[
          { Icon: BookOpen, value: `${courses.length}+`, label: 'Cursos' },
          { Icon: Users, value: '3,500+', label: 'Estudiantes' },
          { Icon: Star, value: '4.8★', label: 'Valoración' },
        ].map(({ Icon, value, label }) => (
          <motion.div key={label} variants={fadeUp} className="text-center">
            <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: 'var(--brand-green)' }} />
            <p className="font-bold" style={{ color: 'var(--brand-green)', fontSize: 'clamp(1rem, 3vw, 1.4rem)' }}>{value}</p>
            <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Enrolled banner */}
      {user && user.enrolledCourses.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 sm:p-4 rounded-2xl flex items-center gap-3"
          style={{ background: 'var(--brand-section-green)', border: '1px solid #c8e6c9' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--brand-green)' }}>
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--brand-green)' }}>
              Hola {user.name.split(' ')[0]}, tienes {user.enrolledCourses.length} curso{user.enrolledCourses.length !== 1 ? 's' : ''} inscrito{user.enrolledCourses.length !== 1 ? 's' : ''}.
            </p>
            <p className="text-xs text-gray-500">Toca un curso para ver su contenido y videos.</p>
          </div>
        </motion.div>
      )}

      {/* Course grid */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
        {courses.map(course => {
          const enrolled = isEnrolled(course.id);
          const isOpen = expanded === course.id;
          const hasYT = !!(course.youtubePlaylistUrl || course.youtubeVideos?.length || course.youtubeGroupUrl);

          return (
            <motion.div key={course.id} variants={fadeUp}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : course.id)}>
              <div className="relative h-44 sm:h-52 overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
                {enrolled && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">
                    <CheckCircle className="w-3 h-3" /> Inscrito
                  </div>
                )}
                {hasYT && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-bold"
                    style={{ background: 'rgba(220,38,38,0.9)' }}>
                    <Youtube className="w-3 h-3" />
                    {course.lessons > PLAYLIST_THRESHOLD ? 'Playlist' : `${course.youtubeVideos?.length ?? 0} videos`}
                  </div>
                )}
                <div className="absolute bottom-3 left-4 right-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold text-white mb-1.5 ${
                    course.level === 'Principiante' ? 'bg-green-500' :
                    course.level === 'Intermedio' ? 'bg-amber-500' : 'bg-red-500'
                  }`}>{course.level}</span>
                  <h3 className="text-white" style={{ fontSize: '1rem' }}>{course.title}</h3>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <p className="text-gray-500 text-sm mb-3 leading-relaxed line-clamp-2">{course.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.lessons} clases</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.students.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(course.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{course.rating} · {course.instructor}</span>
                </div>

                {/* Expandable section */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden">
                      {/* Topics */}
                      {course.topics.length > 0 && (
                        <div className="border-t border-gray-100 pt-4 mb-4">
                          <p className="text-sm font-semibold mb-2.5" style={{ color: 'var(--brand-green)' }}>Contenido del curso:</p>
                          <ul className="space-y-2">
                            {course.topics.map(t => (
                              <li key={t} className="flex items-start gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />{t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* YouTube videos */}
                      <CourseVideoSection course={course} enrolled={enrolled} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-end gap-1.5">
                    <span className="font-bold" style={{ color: 'var(--brand-green)', fontSize: '1.35rem', lineHeight: 1 }}>
                      ${course.price.toFixed(2)}
                    </span>
                    {course.originalPrice && (
                      <span className="text-gray-400 line-through text-xs mb-0.5">${course.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    <motion.button whileTap={{ scale: 0.93 }}
                      onClick={e => handleEnrollClick(e, course)}
                      className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 rounded-xl text-white font-medium text-sm"
                      style={{ background: enrolled ? 'var(--brand-green-vivid)' : user ? 'var(--brand-orange)' : 'var(--brand-green)' }}>
                      {enrolled ? (
                        <><PlayCircle className="w-4 h-4" /> Ver curso</>
                      ) : !user ? (
                        <><Lock className="w-4 h-4" /> Inscribirme</>
                      ) : (
                        <><ArrowRight className="w-4 h-4" /> Inscribirme</>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA banner */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="mt-12 sm:mt-16 rounded-2xl p-6 sm:p-8 text-center"
        style={{ background: 'linear-gradient(135deg, var(--brand-green) 0%, var(--brand-green-vivid) 100%)' }}>
        <h2 className="text-white mb-2">¿Eres experto en medicina natural?</h2>
        <p className="mb-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Únete a nuestra comunidad de instructores y comparte tu conocimiento.
        </p>
        <motion.button whileTap={{ scale: 0.95 }}
          className="px-8 py-3.5 rounded-xl font-semibold hover:opacity-90" style={{ background: 'var(--brand-orange)', color: '#fff' }}>
          Quiero ser instructor
        </motion.button>
      </motion.div>

      <AuthModal open={authModal}
        onClose={() => { setAuthModal(false); setPendingCourseId(null); }}
        defaultTab="register" onSuccess={handleAuthSuccess} />

      <CourseEnrollModal
        course={enrollModalCourse}
        onClose={() => setEnrollModalCourse(null)} />
    </div>
  );
}
