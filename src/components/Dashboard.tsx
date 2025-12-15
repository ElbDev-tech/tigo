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

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    clientes: 0,
    contratos: 0,
    instalaciones: 0,
    pagos: 0,
    incidencias: 0,
    acciones: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [clientes, contratos, instalaciones, pagos, incidencias, acciones] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase.from('contratos').select('*', { count: 'exact', head: true }),
        supabase.from('instalaciones').select('*', { count: 'exact', head: true }),
        supabase.from('pagos').select('*', { count: 'exact', head: true }),
        supabase.from('incidencias').select('*', { count: 'exact', head: true }),
        supabase.from('acciones_preventivas').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        clientes: clientes.count || 0,
        contratos: contratos.count || 0,
        instalaciones: instalaciones.count || 0,
        pagos: pagos.count || 0,
        incidencias: incidencias.count || 0,
        acciones: acciones.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Clientes', value: stats.clientes, icon: Users, color: 'bg-blue-500' },
    { label: 'Contratos', value: stats.contratos, icon: FileText, color: 'bg-green-500' },
    { label: 'Instalaciones', value: stats.instalaciones, icon: Wrench, color: 'bg-orange-500' },
    { label: 'Pagos', value: stats.pagos, icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Incidencias', value: stats.incidencias, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Acciones Preventivas', value: stats.acciones, icon: Shield, color: 'bg-cyan-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 mt-2">Sistema de Gestión - Tigo Perú</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
