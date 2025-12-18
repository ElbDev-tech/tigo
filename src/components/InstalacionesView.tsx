import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Instalacion, Cliente } from '../types/database';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

export default function InstalacionesView() {
  const [instalaciones, setInstalaciones] = useState<(Instalacion & { cliente?: Cliente })[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInstalacion, setEditingInstalacion] = useState<Instalacion | null>(null);
  const [formData, setFormData] = useState({
    id_cliente: '',
    direccion_instalacion: '',
    fecha_instalacion: new Date().toISOString().split('T')[0],
    tecnico_responsable: '',
    observaciones: '',
    estado: 'programada' as 'programada' | 'completada' | 'cancelada' | 'pendiente',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [instalacionesRes, clientesRes] = await Promise.all([
        (supabase as any).from('instalaciones').select('*').order('fecha_instalacion', { ascending: false }),
        (supabase as any).from('clientes').select('*'),
      ]);

      if (instalacionesRes.error) throw instalacionesRes.error;
      if (clientesRes.error) throw clientesRes.error;

      const instalacionesConClientes = (instalacionesRes.data as Instalacion[] || []).map((inst) => ({
        ...inst,
        cliente: (clientesRes.data as Cliente[] || []).find((c) => c.id === inst.id_cliente),
      }));

      setInstalaciones(instalacionesConClientes);
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
      if (editingInstalacion) {
        const { error } = await (supabase as any)
          .from('instalaciones')
          .update(formData)
          .eq('id', editingInstalacion.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from('instalaciones').insert(formData);
        if (error) throw error;
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving instalacion:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta instalación?')) return;
    try {
      const { error } = await (supabase as any).from('instalaciones').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting instalacion:', error);
    }
  };

  const openEditModal = (instalacion: Instalacion) => {
    setEditingInstalacion(instalacion);
    setFormData({
      id_cliente: instalacion.id_cliente,
      direccion_instalacion: instalacion.direccion_instalacion,
      fecha_instalacion: instalacion.fecha_instalacion,
      tecnico_responsable: instalacion.tecnico_responsable,
      observaciones: instalacion.observaciones,
      estado: instalacion.estado,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id_cliente: '',
      direccion_instalacion: '',
      fecha_instalacion: new Date().toISOString().split('T')[0],
      tecnico_responsable: '',
      observaciones: '',
      estado: 'programada',
    });
    setEditingInstalacion(null);
  };

  const filteredInstalaciones = instalaciones.filter((inst) =>
    (inst.cliente &&
      `${inst.cliente.nombres} ${inst.cliente.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
    inst.tecnico_responsable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programada':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completada':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelada':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pendiente':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Instalaciones</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Instalación
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por cliente o técnico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredInstalaciones.map((instalacion) => (
          <div
            key={instalacion.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {instalacion.cliente
                      ? `${instalacion.cliente.nombres} ${instalacion.cliente.apellidos}`
                      : 'Cliente no encontrado'}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(instalacion.estado)}`}>
                    {instalacion.estado}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Dirección:</span> {instalacion.direccion_instalacion}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Fecha:</span>{' '}
                    {new Date(instalacion.fecha_instalacion).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Técnico:</span> {instalacion.tecnico_responsable}
                  </p>
                  {instalacion.observaciones && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Observaciones:</span> {instalacion.observaciones}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(instalacion)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(instalacion.id)}
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
                  {editingInstalacion ? 'Editar Instalación' : 'Nueva Instalación'}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección de Instalación</label>
                  <input
                    type="text"
                    required
                    value={formData.direccion_instalacion}
                    onChange={(e) => setFormData({ ...formData, direccion_instalacion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Instalación</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_instalacion}
                      onChange={(e) => setFormData({ ...formData, fecha_instalacion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Técnico Responsable</label>
                    <input
                      type="text"
                      required
                      value={formData.tecnico_responsable}
                      onChange={(e) => setFormData({ ...formData, tecnico_responsable: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="programada">Programada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={3}
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
                    {editingInstalacion ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div >
      )
      }
    </div >
  );
}
