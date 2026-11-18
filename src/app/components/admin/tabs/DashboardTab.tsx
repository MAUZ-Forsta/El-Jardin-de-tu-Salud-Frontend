import { DollarSign, ShoppingBag, Users, BookOpen, TrendingUp, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Product, Course } from '../../../data';
import type { User } from '../../../context/AuthContext';

interface Props {
  products: Product[];
  courses: Course[];
  users: User[];
}

// Quick seeded chart data for the dashboard sparkline
function spark(seed: number): number {
  return 400 + Math.abs(((seed * 9301 + 49297) % 233280) / 233280 * 2800);
}

const weekData = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => ({
  day: d,
  ingresos: Math.round(spark(i + 13)),
  pedidos: Math.round(10 + Math.abs(((i * 7 + 3) * 9301 + 49297) % 233280) / 233280 * 28),
}));

export default function DashboardTab({ products, courses, users }: Props) {
  const totalRevenue = weekData.reduce((s, d) => s + d.ingresos, 0);
  const totalOrders = weekData.reduce((s, d) => s + d.pedidos, 0);
  const lowStock = products.filter(p => p.stock <= 10).length;

  const stats = [
    { label: 'Ingresos (sem.)', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'var(--brand-green)', bg: 'var(--brand-section-green)' },
    { label: 'Pedidos (sem.)', value: totalOrders, icon: ShoppingBag, color: 'var(--brand-orange)', bg: 'var(--brand-orange-soft)' },
    { label: 'Usuarios', value: users.filter(u => u.role === 'user').length, icon: Users, color: '#1565c0', bg: '#e3f2fd' },
    { label: 'Stock bajo', value: lowStock, icon: Package, color: '#c62828', bg: '#ffebee' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--brand-green)' }}>Panel general</h2>
        <p className="text-sm text-gray-400">Resumen de la semana actual</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
            </div>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Ingresos esta semana</h3>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--brand-section-green)', color: 'var(--brand-green)' }}>
            ${totalRevenue.toLocaleString()} total
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weekData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-green)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--brand-green)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--brand-inactive)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--brand-inactive)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, 'Ingresos']}
            />
            <Area type="monotone" dataKey="ingresos" stroke="var(--brand-green)" strokeWidth={2} fill="url(#greenGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top products by stock movement */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h3 className="font-semibold text-gray-700 mb-4">Productos destacados</h3>
          <div className="space-y-3">
            {products.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--brand-green)' }}>{p.name}</p>
                  <p className="text-xs text-gray-400">Stock: {p.stock}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--brand-orange)' }}>${p.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Courses overview */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h3 className="font-semibold text-gray-700 mb-4">Cursos activos</h3>
          <div className="space-y-3">
            {courses.map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <img src={c.image} alt={c.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--brand-green)' }}>{c.title}</p>
                  <p className="text-xs text-gray-400">{c.students.toLocaleString()} estudiantes</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: 'var(--brand-orange)' }}>${c.price.toFixed(2)}</p>
                  <p className="text-xs" style={{ color: c.level === 'Principiante' ? '#2e7d32' : c.level === 'Intermedio' ? '#e65100' : '#c62828' }}>
                    {c.level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
        <h3 className="font-semibold text-gray-700 mb-4">Usuarios recientes</h3>
        <div className="space-y-2">
          {users.filter(u => u.role === 'user').slice(0, 4).map(u => (
            <div key={u.id} className="flex items-center gap-3 py-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: `hsl(${(parseInt(u.id) * 47) % 360}, 55%, 45%)` }}>
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--brand-green)' }}>{u.name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">{u.joinedAt}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--brand-green)' }}>{u.enrolledCourses.length} cursos</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
