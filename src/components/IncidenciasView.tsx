import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Incidencia, Cliente } from '../types/database';
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function IncidenciasView() {
  const [incidencias, setIncidencias] = useState<(Incidencia & { cliente?: Cliente })[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIncidencia, setEditingIncidencia] = useState<Incidencia | null>(null);
  const [formData, setFormData] = useState({
    id_cliente: '',
    tipo_incidencia: 'falla_servicio' as 'falla_servicio' | 'soporte_tecnico' | 'facturacion' | 'otro',
    descripcion: '',
    estado: 'abierta' as 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada',
    prioridad: 'media' as 'baja' | 'media' | 'alta' | 'critica',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [incidenciasRes, clientesRes] = await Promise.all([
        (supabase as any).from('incidencias').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('clientes').select('*'),
      ]);

      if (incidenciasRes.error) throw incidenciasRes.error;
      if (clientesRes.error) throw clientesRes.error;

      const incidenciasConClientes = (incidenciasRes.data as Incidencia[] || []).map((inc) => ({
        ...inc,
        cliente: (clientesRes.data as Cliente[] || []).find((c) => c.id === inc.id_cliente),
      }));

      setIncidencias(incidenciasConClientes);
      setClientes(clientesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIncidencia) {
        const { error } = await (supabase as any)
          .from('incidencias')
          .update(formData)
          .eq('id', editingIncidencia.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('incidencias').insert(formData);
        if (error) throw error;
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving incidencia:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta incidencia?')) return;
    try {
      const { error } = await (supabase as any).from('incidencias').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting incidencia:', error);
    }
  };

  const openEditModal = (incidencia: Incidencia) => {
    setEditingIncidencia(incidencia);
    setFormData({
      id_cliente: incidencia.id_cliente,
      tipo_incidencia: incidencia.tipo_incidencia,
      descripcion: incidencia.descripcion,
      estado: incidencia.estado,
      prioridad: incidencia.prioridad,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id_cliente: '',
      tipo_incidencia: 'falla_servicio',
      descripcion: '',
      estado: 'abierta',
      prioridad: 'media',
    });
    setEditingIncidencia(null);
  };

  const filteredIncidencias = incidencias.filter((inc) =>
    inc.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inc.cliente && `${inc.cliente.nombres} ${inc.cliente.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'abierta':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resuelta':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cerrada':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'baja':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'media':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'alta':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critica':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Incidencias</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Registro y seguimiento de problemas reportados</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Incidencia
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por descripción o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredIncidencias.map((incidencia) => (
          <div
            key={incidencia.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {incidencia.cliente
                      ? `${incidencia.cliente.nombres} ${incidencia.cliente.apellidos}`
                      : 'Cliente no encontrado'}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadColor(incidencia.prioridad)}`}>
                    {incidencia.prioridad}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(incidencia.estado)}`}>
                    {incidencia.estado}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{incidencia.descripcion}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Tipo: {incidencia.tipo_incidencia.replace('_', ' ')}</span>
                  <span>Fecha: {new Date(incidencia.fecha).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(incidencia)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(incidencia.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingIncidencia ? 'Editar Incidencia' : 'Nueva Incidencia'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
                  <select
                    required
                    value={formData.id_cliente}
                    onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombres} {cliente.apellidos} - {cliente.dni}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Incidencia</label>
                    <select
                      value={formData.tipo_incidencia}
                      onChange={(e) => setFormData({ ...formData, tipo_incidencia: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="falla_servicio">Falla de Servicio</option>
                      <option value="soporte_tecnico">Soporte Técnico</option>
                      <option value="facturacion">Facturación</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="abierta">Abierta</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="resuelta">Resuelta</option>
                      <option value="cerrada">Cerrada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
                    <select
                      value={formData.prioridad}
                      onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <textarea
                    required
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingIncidencia ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
