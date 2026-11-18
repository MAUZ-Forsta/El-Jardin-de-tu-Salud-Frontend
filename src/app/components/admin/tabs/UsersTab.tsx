import { useState } from 'react';
import { Search, X, Star, ShoppingBag, BookOpen, MessageSquare, Send, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { User } from '../../../context/AuthContext';
import type { Product, Course } from '../../../data';

interface Comment {
  id: string;
  userId: string;
  targetId: string;
  targetName: string;
  targetType: 'product' | 'course';
  text: string;
  rating: number;
  date: string;
  reply?: string;
}

interface Purchase {
  userId: string;
  productId: string;
  productName: string;
  amount: number;
  date: string;
}

const MOCK_PURCHASES: Purchase[] = [
  { userId: '1', productId: '1', productName: 'Manzanilla Orgánica', amount: 12.99, date: '2024-03-15' },
  { userId: '1', productId: '3', productName: 'Aceite Esencial de Lavanda', amount: 18.50, date: '2024-04-02' },
  { userId: '1', productId: '6', productName: 'Cúrcuma con Pimienta Negra', amount: 22.99, date: '2024-04-18' },
  { userId: '2', productId: '4', productName: 'Valeriana Cápsulas', amount: 19.99, date: '2024-03-20' },
  { userId: '2', productId: '6', productName: 'Cúrcuma con Pimienta Negra', amount: 22.99, date: '2024-03-25' },
  { userId: '3', productId: '3', productName: 'Aceite Esencial de Lavanda', amount: 18.50, date: '2024-03-20' },
  { userId: '3', productId: '7', productName: 'Moringa en Polvo', amount: 16.99, date: '2024-04-01' },
  { userId: '3', productId: '9', productName: 'Aceite Esencial de Romero', amount: 16.99, date: '2024-04-12' },
];

const INITIAL_COMMENTS: Comment[] = [
  { id: 'c1', userId: '1', targetId: '1', targetName: 'Manzanilla Orgánica', targetType: 'product', text: 'Excelente calidad, la manzanilla es muy fragante. Definitivamente la mejor que he probado.', rating: 5, date: '2024-03-16' },
  { id: 'c2', userId: '1', targetId: '3', targetName: 'Aceite Esencial de Lavanda', targetType: 'product', text: 'Me ayudó mucho a conciliar el sueño. Lo pongo en el difusor antes de dormir y funciona de maravilla.', rating: 5, date: '2024-04-03' },
  { id: 'c3', userId: '2', targetId: '4', targetName: 'Valeriana Cápsulas', targetType: 'product', text: 'Buen producto, aunque tardé unos días en ver resultados. Ahora duermo mucho mejor.', rating: 4, date: '2024-03-22' },
  { id: 'c4', userId: '3', targetId: '1', targetName: 'Fitoterapia para el Hogar', targetType: 'course', text: 'Curso muy completo y bien explicado. Los materiales de apoyo son muy útiles.', rating: 5, date: '2024-04-11' },
  { id: 'c5', userId: '3', targetId: '2', targetName: 'Aromaterapia y Aceites Esenciales', targetType: 'course', text: 'Aprendí muchísimo. Las recetas de mezclas son increíbles y fáciles de preparar.', rating: 5, date: '2024-04-16' },
  { id: 'c6', userId: '2', targetId: '6', targetName: 'Cúrcuma con Pimienta Negra', targetType: 'product', text: 'Noto mucha mejoría en mis articulaciones después de 3 semanas. Muy recomendado.', rating: 5, date: '2024-03-26' },
];

function UserAvatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-16 h-16 text-xl' };
  const hue = (parseInt(user.id) * 47 + 120) % 360;
  return (
    <div className={`${sizes[size]} rounded-2xl flex items-center justify-center text-white font-bold shrink-0`}
      style={{ background: `hsl(${hue}, 55%, 42%)` }}>
      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
    </div>
  );
}

interface Props { users: User[]; products: Product[]; courses: Course[]; }

export default function UsersTab({ users, products: _products, courses }: Props) {
  const [search, setSearch] = useState('');
  const [inspectedUser, setInspectedUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeInspectTab, setActiveInspectTab] = useState<'overview' | 'purchases' | 'comments'>('overview');

  const regularUsers = users.filter(u => u.role === 'user');
  const filtered = regularUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getUserPurchases = (id: string) => MOCK_PURCHASES.filter(p => p.userId === id);
  const getUserComments = (id: string) => comments.filter(c => c.userId === id);
  const getAvgRating = (id: string) => {
    const cs = getUserComments(id);
    if (!cs.length) return null;
    return (cs.reduce((s, c) => s + c.rating, 0) / cs.length).toFixed(1);
  };

  const handleReply = (commentId: string) => {
    const reply = replyInputs[commentId]?.trim();
    if (!reply) return;
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, reply } : c));
    setReplyInputs(p => ({ ...p, [commentId]: '' }));
  };

  const inspectTabs = ['overview', 'purchases', 'comments'] as const;
  const tabLabels: Record<string, string> = { overview: 'Resumen', purchases: 'Compras', comments: 'Comentarios' };

  const openUser = (u: User) => { setInspectedUser(u); setActiveInspectTab('overview'); };

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--brand-green)' }}>Usuarios</h2>
          <p className="text-sm text-gray-400">{regularUsers.length} registrados</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none" />
      </div>

      {/* ── Mobile: cards | Desktop: table ──────────── */}

      {/* Mobile card list */}
      <div className="flex-1 overflow-y-auto space-y-2 sm:hidden">
        {filtered.map(u => {
          const purchases = getUserPurchases(u.id);
          const avg = getAvgRating(u.id);
          return (
            <button key={u.id} onClick={() => openUser(u)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 text-left active:bg-gray-50">
              <UserAvatar user={u} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--brand-green)' }}>{u.name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {u.enrolledCourses.length}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" /> {purchases.length}
                  </span>
                  {avg && (
                    <span className="text-xs text-amber-600 font-semibold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> {avg}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No hay usuarios</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:flex flex-1 overflow-auto bg-white rounded-2xl border border-gray-100 shadow-sm flex-col">
        <table className="w-full min-w-[600px]">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-100">
              {['Usuario', 'Email', 'Registro', 'Cursos', 'Compras', 'Rating', ''].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const purchases = getUserPurchases(u.id);
              const avg = getAvgRating(u.id);
              return (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => openUser(u)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar user={u} size="sm" />
                      <span className="text-sm font-medium" style={{ color: 'var(--brand-green)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-40 truncate">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{u.joinedAt}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                      {u.enrolledCourses.length} cursos
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{purchases.length}</td>
                  <td className="px-4 py-3">
                    {avg ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400" /> {avg}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-gray-300" /></td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No hay usuarios</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Inspection drawer ─────────────────────────── */}
      <AnimatePresence>
        {inspectedUser && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setInspectedUser(null)} />

            {/* Full-screen on mobile, side panel on desktop */}
            <motion.div
              className="fixed z-50 bg-white flex flex-col shadow-2xl
                inset-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-lg"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              {/* Drag handle – mobile only */}
              <div className="sm:hidden w-10 h-1 rounded-full bg-gray-200 mx-auto mt-3 mb-1" />

              {/* Header */}
              <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => setInspectedUser(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--brand-green)' }}>Perfil de usuario</h3>
              </div>

              {/* User card */}
              <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <UserAvatar user={inspectedUser} size="lg" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-base truncate" style={{ color: 'var(--brand-green)' }}>{inspectedUser.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{inspectedUser.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Miembro desde {inspectedUser.joinedAt}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { Icon: BookOpen, value: inspectedUser.enrolledCourses.length, label: 'Cursos', color: 'var(--brand-green)' },
                    { Icon: ShoppingBag, value: getUserPurchases(inspectedUser.id).length, label: 'Compras', color: 'var(--brand-orange)' },
                    { Icon: Star, value: getAvgRating(inspectedUser.id) ?? '—', label: 'Rating', color: '#d97706' },
                  ].map(({ Icon, value, label, color }) => (
                    <div key={label} className="text-center p-3 rounded-xl" style={{ background: '#f7f4ef' }}>
                      <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
                      <p className="font-bold text-sm" style={{ color }}>{value}</p>
                      <p className="text-xs text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspect tabs */}
              <div className="flex border-b border-gray-100">
                {inspectTabs.map(t => (
                  <button key={t} onClick={() => setActiveInspectTab(t)}
                    className="flex-1 py-3 text-sm font-medium relative"
                    style={{ color: activeInspectTab === t ? 'var(--brand-green)' : 'var(--brand-inactive)' }}>
                    {tabLabels[t]}
                    {activeInspectTab === t && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: 'var(--brand-green)' }} />
                    )}
                  </button>
                ))}
              </div>

              {/* Inspect content */}
              <div className="flex-1 overflow-y-auto">

                {activeInspectTab === 'overview' && (
                  <div className="p-4 sm:p-5 space-y-5">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Cursos inscritos</p>
                      {inspectedUser.enrolledCourses.length > 0 ? (
                        <div className="space-y-2">
                          {inspectedUser.enrolledCourses.map(cid => {
                            const course = courses.find(c => c.id === cid);
                            return course ? (
                              <div key={cid} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                                <img src={course.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate" style={{ color: 'var(--brand-green)' }}>{course.title}</p>
                                  <p className="text-xs text-gray-400">{course.instructor}</p>
                                </div>
                                <span className="text-xs font-bold shrink-0" style={{ color: 'var(--brand-green)' }}>${course.price.toFixed(2)}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : <p className="text-sm text-gray-400">Sin cursos inscritos.</p>}
                    </div>
                    <div className="p-4 rounded-2xl" style={{ background: 'var(--brand-section-green)' }}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total invertido en productos</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--brand-green)' }}>
                        ${getUserPurchases(inspectedUser.id).reduce((s, p) => s + p.amount, 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">en {getUserPurchases(inspectedUser.id).length} compras</p>
                    </div>
                  </div>
                )}

                {activeInspectTab === 'purchases' && (
                  <div className="p-4 sm:p-5 space-y-2">
                    {getUserPurchases(inspectedUser.id).length > 0 ? (
                      getUserPurchases(inspectedUser.id).map((p, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--brand-section-green)' }}>
                            <ShoppingBag className="w-4 h-4" style={{ color: 'var(--brand-green)' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--brand-green)' }}>{p.productName}</p>
                            <p className="text-xs text-gray-400">{p.date}</p>
                          </div>
                          <span className="text-sm font-bold shrink-0" style={{ color: 'var(--brand-orange)' }}>${p.amount.toFixed(2)}</span>
                        </div>
                      ))
                    ) : <p className="text-sm text-gray-400 py-6 text-center">Sin compras registradas.</p>}
                  </div>
                )}

                {activeInspectTab === 'comments' && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {getUserComments(inspectedUser.id).length > 0 ? (
                      getUserComments(inspectedUser.id).map(comment => (
                        <div key={comment.id} className="rounded-2xl border border-gray-100 overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-1"
                                style={comment.targetType === 'product'
                                  ? { background: 'var(--brand-section-green)', color: 'var(--brand-green)' }
                                  : { background: 'var(--brand-orange-soft)', color: 'var(--brand-orange)' }}>
                                {comment.targetType === 'product' ? '🛒 Producto' : '📚 Curso'}
                              </span>
                              <p className="text-xs font-semibold text-gray-600 truncate">{comment.targetName}</p>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= comment.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                          <div className="px-4 py-3">
                            <p className="text-sm text-gray-700 leading-relaxed mb-1">"{comment.text}"</p>
                            <p className="text-xs text-gray-400">{comment.date}</p>
                          </div>
                          {comment.reply && (
                            <div className="px-4 py-3 border-t border-gray-100" style={{ background: 'var(--brand-section-green)' }}>
                              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--brand-green)' }}>Tu respuesta:</p>
                              <p className="text-sm text-gray-700">{comment.reply}</p>
                            </div>
                          )}
                          <div className="px-4 py-3 border-t border-gray-100 bg-white">
                            <div className="flex gap-2">
                              <input
                                value={replyInputs[comment.id] ?? ''}
                                onChange={e => setReplyInputs(p => ({ ...p, [comment.id]: e.target.value }))}
                                placeholder={comment.reply ? 'Editar respuesta...' : 'Responder...'}
                                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none"
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleReply(comment.id); } }}
                              />
                              <button onClick={() => handleReply(comment.id)}
                                disabled={!replyInputs[comment.id]?.trim()}
                                className="px-3 py-2.5 rounded-xl text-white disabled:opacity-40 shrink-0"
                                style={{ background: 'var(--brand-green)' }}>
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                        <p className="text-sm text-gray-400">Sin comentarios todavía.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
