import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, UserCog } from 'lucide-react';

type Usuario = {
    id: string;
    nombre: string;
    usuario: string;
    rol: 'administrador' | 'tecnico' | 'operador';
    estado: boolean;
};

export default function UsuariosView() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Usuario>>({ rol: 'operador', estado: true });

    useEffect(() => {
        fetchUsuarios();
    }, []);

    async function fetchUsuarios() {
        try {
            const { data, error } = await (supabase as any).from('usuarios').select('*');
            if (error) throw error;
            setUsuarios(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const { error } = await (supabase as any).from('usuarios').insert([formData]);
            if (error) throw error;
            setShowModal(false);
            setFormData({ rol: 'operador', estado: true });
            fetchUsuarios();
        } catch (e) {
            alert('Error al crear usuario');
        }
    }

    async function toggleEstado(id: string, actual: boolean) {
        await (supabase as any).from('usuarios').update({ estado: !actual }).eq('id', id);
        fetchUsuarios();
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <UserCog className="w-8 h-8 text-blue-600" />
                    Gestión de Usuarios
                </h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Usuario
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? <tr><td colSpan={5} className="p-4 text-center">Cargando...</td></tr> :
                            usuarios.map(USER => (
                                <tr key={USER.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{USER.nombre}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">@{USER.usuario}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">{USER.rol}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${USER.estado ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {USER.estado ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleEstado(USER.id, USER.estado)}
                                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                        >
                                            {USER.estado ? 'Desactivar' : 'Activar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Nuevo Usuario</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nombre Completo</label>
                                <input required className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nombre de Usuario</label>
                                <input required className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    onChange={e => setFormData({ ...formData, usuario: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Rol</label>
                                <select className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.rol}
                                    onChange={e => setFormData({ ...formData, rol: e.target.value as any })}>
                                    <option value="administrador">Administrador</option>
                                    <option value="tecnico">Técnico</option>
                                    <option value="operador">Operador</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
