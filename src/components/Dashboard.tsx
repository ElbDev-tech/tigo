import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, FileText, Wrench, DollarSign, AlertTriangle, Shield } from 'lucide-react';

interface Stats {
  clientes: number;
  contratos: number;
  instalaciones: number;
  pagos: number;
  incidencias: number;
  acciones: number;
}

interface ReporteDistrito {
  distrito: string;
  total_fallas: number;
}

interface ReportePlan {
  plan_internet: string;
  cantidad: number;
}

interface ReporteTecnico {
  tecnico_asignado: string;
  total: number;
}

interface ReporteIngreso {
  mes: string;
  total: number;
}

interface ReporteMoroso {
  id: string;
  nombres: string;
  apellidos: string;
  plan_internet: string;
  deuda_estimada: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    clientes: 0, contratos: 0, instalaciones: 0, pagos: 0, incidencias: 0, acciones: 0
  });

  const [distritos, setDistritos] = useState<ReporteDistrito[]>([]);
  const [planes, setPlanes] = useState<ReportePlan[]>([]);
  const [tecnicos, setTecnicos] = useState<ReporteTecnico[]>([]);
  const [ingresos, setIngresos] = useState<ReporteIngreso[]>([]);
  const [morosos, setMorosos] = useState<ReporteMoroso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // 1. Cargar KPIs Generales
      const [c, co, i, p, in_, a] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase.from('contratos').select('*', { count: 'exact', head: true }),
        supabase.from('instalaciones').select('*', { count: 'exact', head: true }),
        supabase.from('pagos').select('*', { count: 'exact', head: true }),
        supabase.from('incidencias').select('*', { count: 'exact', head: true }),
        supabase.from('acciones_preventivas').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        clientes: c.count || 0,
        contratos: co.count || 0,
        instalaciones: i.count || 0,
        pagos: p.count || 0,
        incidencias: in_.count || 0,
        acciones: a.count || 0,
      });

      // 2. Cargar Vistas del Dashboard (Reportes)
      const { data: dData } = await supabase.from('rep_incidencias_distrito').select('*').limit(5);
      if (dData) setDistritos(dData);

      const { data: pData } = await supabase.from('rep_ranking_planes').select('*').limit(5);
      if (pData) setPlanes(pData);

      const { data: tData } = await supabase.from('rep_instalaciones_tecnico').select('*').limit(5);
      if (tData) setTecnicos(tData);

      const { data: iData } = await supabase.from('rep_ingresos_mes').select('*').limit(5);
      if (iData) setIngresos(iData);

      const { data: mData } = await supabase.from('rep_morosos').select('*').limit(5);
      if (mData) setMorosos(mData);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Clientes', value: stats.clientes, icon: Users, color: 'text-blue-500', bg: 'bg-blue-900/20' },
    { label: 'Contratos', value: stats.contratos, icon: FileText, color: 'text-green-500', bg: 'bg-green-900/20' },
    { label: 'Instalaciones', value: stats.instalaciones, icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-900/20' },
    { label: 'Ingresos', value: stats.pagos, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-green-900/20' },
    { label: 'Incidencias', value: stats.incidencias, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-900/20' },
    { label: 'Acciones', value: stats.acciones, icon: Shield, color: 'text-cyan-500', bg: 'bg-cyan-900/20' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Control Tigo</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Indicadores Estratégicos (5 Reportes de Tesis)</p>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
            <div className={`p-3 rounded-full mb-3 ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Row 2: Zonas Criticas + Ranking Planes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reporte 1: Zonas Críticas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            1. Zonas Críticas (Fallas)
          </h3>
          <div className="space-y-4">
            {distritos.length === 0 ? <p className="text-gray-500">No hay datos registrados aún.</p> :
              distritos.map((d) => (
                <div key={d.distrito}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{d.distrito}</span>
                    <span className="text-gray-900 dark:text-white font-bold">{d.total_fallas}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(d.total_fallas / Math.max(...distritos.map(x => x.total_fallas))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Reporte 2: Ranking Planes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            2. Planes Más Vendidos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Plan</th>
                  <th className="text-right py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Cant.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {planes.map((p) => (
                  <tr key={p.plan_internet}>
                    <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{p.plan_internet}</td>
                    <td className="py-3 text-right text-sm text-blue-600 dark:text-blue-400 font-bold">{p.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Tecnicos, Ingresos, Morosos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Reporte 3: Top Tecnicos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            3. Top Técnicos
          </h3>
          <div className="space-y-4">
            {tecnicos.map((t) => (
              <div key={t.tecnico_asignado} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{t.tecnico_asignado}</span>
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                  {t.total} Inst.
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reporte 4: Ingresos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            4. Ingresos (S/)
          </h3>
          <div className="space-y-4">
            {ingresos.map((i) => (
              <div key={i.mes} className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {i.mes} {/* Mostrar el formato directo de PG (MM-YYYY) o formatear si es fecha ISO */}
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  S/ {i.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reporte 5: Morosos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            5. Morosos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-xs text-gray-500 uppercase">Cliente</th>
                  <th className="text-right py-2 text-xs text-gray-500 uppercase">Deuda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {morosos.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{m.nombres} {m.apellidos}</span>
                        <span className="text-xs text-gray-500">{m.plan_internet}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-sm font-bold text-red-500">
                      S/ {m.deuda_estimada.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
