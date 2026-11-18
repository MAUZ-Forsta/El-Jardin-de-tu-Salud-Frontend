import { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, ShoppingBag, DollarSign, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

type View = 'day' | 'week' | 'month';

// Deterministic pseudo-random based on seed string
function sr(seed: string, min: number, max: number): number {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return min + (Math.abs(h) % (max - min));
}

function genDayData(date: Date) {
  return Array.from({ length: 24 }, (_, i) => {
    const seed = `${date.toDateString()}-${i}`;
    const isPeak = (i >= 9 && i <= 12) || (i >= 18 && i <= 21);
    return {
      label: `${String(i).padStart(2, '0')}:00`,
      ingresos: sr(seed + 'r', isPeak ? 180 : 10, isPeak ? 520 : 90),
      pedidos: sr(seed + 'o', isPeak ? 4 : 0, isPeak ? 18 : 4),
    };
  });
}

function genWeekData(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay() + 1);
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return days.map((d, i) => {
    const seed = `${start.toDateString()}-${i}`;
    const isWeekend = i >= 5;
    return {
      label: d,
      ingresos: sr(seed + 'r', isWeekend ? 900 : 400, isWeekend ? 2800 : 1600),
      pedidos: sr(seed + 'o', isWeekend ? 20 : 8, isWeekend ? 60 : 35),
    };
  });
}

function genMonthData(date: Date) {
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const seed = `${date.getFullYear()}-${date.getMonth()}-${i}`;
    return {
      label: String(i + 1),
      ingresos: sr(seed + 'r', 300, 3200),
      pedidos: sr(seed + 'o', 5, 50),
    };
  });
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function formatPeriodLabel(view: View, date: Date): string {
  if (view === 'day') {
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (view === 'week') {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getDate()} – ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
  }
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export default function RevenueTab() {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const navigate = (dir: -1 | 1) => {
    const d = new Date(date);
    if (view === 'day') d.setDate(d.getDate() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setDate(d);
  };

  const data = view === 'day' ? genDayData(date) : view === 'week' ? genWeekData(date) : genMonthData(date);
  const totalRevenue = data.reduce((s, d) => s + d.ingresos, 0);
  const totalOrders = data.reduce((s, d) => s + d.pedidos, 0);
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const maxRevenue = Math.max(...data.map(d => d.ingresos));

  const summaryCards = [
    { label: 'Ingresos totales', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'var(--brand-green)', bg: 'var(--brand-section-green)' },
    { label: 'Pedidos', value: totalOrders, icon: ShoppingBag, color: 'var(--brand-orange)', bg: 'var(--brand-orange-soft)' },
    { label: 'Ticket promedio', value: `$${avgTicket.toFixed(2)}`, icon: TrendingUp, color: '#1565c0', bg: '#e3f2fd' },
    { label: 'Pico máximo', value: `$${maxRevenue.toLocaleString()}`, icon: BarChart2, color: '#6a1b9a', bg: '#f3e5f5' },
  ];

  const ChartComponent = chartType === 'area' ? AreaChart : BarChart;
  const DataEl = chartType === 'area' ? Area : Bar;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--brand-green)' }}>Panel de ingresos</h2>
          <p className="text-sm text-gray-400">Análisis por período</p>
        </div>

        {/* View selector */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl self-start sm:self-auto">
          {(['day', 'week', 'month'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={view === v ? { background: 'var(--brand-green)', color: '#fff' } : { color: 'var(--muted-foreground)' }}>
              {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-50 text-gray-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-medium text-sm capitalize" style={{ color: 'var(--brand-green)' }}>
          {formatPeriodLabel(view, date)}
        </span>
        <button onClick={() => navigate(1)} className="p-2 rounded-xl hover:bg-gray-50 text-gray-500">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-700">Evolución de ingresos</h3>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {(['area', 'bar'] as const).map(t => (
              <button key={t} onClick={() => setChartType(t)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={chartType === t ? { background: '#fff', color: 'var(--brand-green)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { color: 'var(--brand-inactive)' }}>
                {t === 'area' ? 'Área' : 'Barras'}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <ChartComponent data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-green)" stopOpacity={0.18} />
                <stop offset="95%" stopColor="var(--brand-green)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--brand-inactive)' }} axisLine={false} tickLine={false}
              interval={view === 'day' ? 3 : view === 'month' ? 4 : 0} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--brand-inactive)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
              formatter={(v: number, name: string) => [
                name === 'ingresos' ? `$${v.toLocaleString()}` : v,
                name === 'ingresos' ? 'Ingresos' : 'Pedidos',
              ]}
            />
            <Legend formatter={v => v === 'ingresos' ? 'Ingresos' : 'Pedidos'} />
            {chartType === 'area' ? (
              <>
                <Area type="monotone" dataKey="ingresos" stroke="var(--brand-green)" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="pedidos" stroke="var(--brand-orange)" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
              </>
            ) : (
              <>
                <Bar dataKey="ingresos" fill="var(--brand-green)" radius={[4, 4, 0, 0]} opacity={0.85} />
                <Bar dataKey="pedidos" fill="var(--brand-orange)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>

      {/* Top hours/days table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">
          {view === 'day' ? 'Horas con mayores ingresos' : view === 'week' ? 'Días de la semana' : 'Mejores días del mes'}
        </h3>
        <div className="space-y-2">
          {[...data].sort((a, b) => b.ingresos - a.ingresos).slice(0, 6).map(d => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-12 shrink-0">{d.label}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(d.ingresos / maxRevenue) * 100}%`, background: 'var(--brand-green)' }} />
              </div>
              <span className="text-xs font-semibold w-20 text-right" style={{ color: 'var(--brand-green)' }}>
                ${d.ingresos.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 w-14 text-right">{d.pedidos} ped.</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
