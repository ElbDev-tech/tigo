import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AccionPreventiva, Incidencia, Cliente } from '../types/database';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

export default function AccionesView() {
  const [acciones, setAcciones] = useState<
    (AccionPreventiva & { incidencia?: Incidencia & { cliente?: Cliente } })[]
  >([]);
  const [incidencias, setIncidencias] = useState<(Incidencia & { cliente?: Cliente })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAccion, setEditingAccion] = useState<AccionPreventiva | null>(null);
  const [formData, setFormData] = useState({
    id_incidencia: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'planificada' as 'planificada' | 'en_ejecucion' | 'completada',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accionesRes, incidenciasRes, clientesRes] = await Promise.all([
        (supabase as any).from('acciones_preventivas').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('incidencias').select('*'),
        (supabase as any).from('clientes').select('*'),
      ]);

      if (accionesRes.error) throw accionesRes.error;
      if (incidenciasRes.error) throw incidenciasRes.error;
      if (clientesRes.error) throw clientesRes.error;

      const incidenciasConClientes = (incidenciasRes.data as Incidencia[]).map((inc) => ({
        ...inc,
        cliente: (clientesRes.data as Cliente[]).find((c) => c.id === inc.id_cliente),
      }));

      const accionesCompletas = (accionesRes.data as AccionPreventiva[] || []).map((accion) => {
        const incidencia = (incidenciasRes.data as Incidencia[] || []).find((i) => i.id === accion.id_incidencia);
        const cliente = incidencia ? (clientesRes.data as Cliente[] || []).find((c) => c.id === incidencia.id_cliente) : undefined;
        return {
          ...accion,
          incidencia: incidencia ? { ...incidencia, cliente } : undefined,
        };
      });

      setAcciones(accionesCompletas);
      setIncidencias(incidenciasConClientes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccion) {
        const { error } = await (supabase as any)
          .from('acciones_preventivas')
          .update(formData)
          .eq('id', editingAccion.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('acciones_preventivas').insert(formData);
        if (error) throw error;
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving accion:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta acción?')) return;
    try {
      const { error } = await (supabase as any).from('acciones_preventivas').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting accion:', error);
    }
  };

  const openEditModal = (accion: AccionPreventiva) => {
    setEditingAccion(accion);
    setFormData({
      id_incidencia: accion.id_incidencia,
      descripcion: accion.descripcion,
      fecha: accion.fecha,
      estado: accion.estado,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id_incidencia: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'planificada',
    });
    setEditingAccion(null);
  };

  const filteredAcciones = acciones.filter((accion) =>
    accion.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (accion.incidencia?.cliente &&
      `${accion.incidencia.cliente.nombres} ${accion.incidencia.cliente.apellidos}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()))
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'planificada':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'en_ejecucion':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completada':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Acciones Preventivas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Seguimiento de medidas preventivas basadas en incidencias</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Acción
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
        {filteredAcciones.map((accion) => (
          <div
            key={accion.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {accion.incidencia?.cliente
                      ? `${accion.incidencia.cliente.nombres} ${accion.incidencia.cliente.apellidos}`
                      : 'Incidencia no encontrada'}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(accion.estado)}`}>
                    {accion.estado.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">{accion.descripcion}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Fecha: {new Date(accion.fecha).toLocaleDateString()}</span>
                  {accion.incidencia && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Relacionada: {accion.incidencia.tipo_incidencia.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(accion)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(accion.id)}
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
                  {editingAccion ? 'Editar Acción Preventiva' : 'Nueva Acción Preventiva'}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incidencia Relacionada</label>
                  <select
                    required
                    value={formData.id_incidencia}
                    onChange={(e) => setFormData({ ...formData, id_incidencia: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Seleccionar incidencia</option>
                    {incidencias.map((incidencia) => (
                      <option key={incidencia.id} value={incidencia.id}>
                        {incidencia.cliente
                          ? `${incidencia.cliente.nombres} ${incidencia.cliente.apellidos}`
                          : 'Cliente no encontrado'}{' '}
                        - {incidencia.tipo_incidencia.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <textarea
                    required
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Describe la acción preventiva a realizar..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="planificada">Planificada</option>
                      <option value="en_ejecucion">En Ejecución</option>
                      <option value="completada">Completada</option>
                    </select>
                  </div>
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
                    {editingAccion ? 'Actualizar' : 'Crear'}
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
