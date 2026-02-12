'use client';

import { useState, useEffect } from 'react';
import { Usuario } from '@/types/usuario';
import {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    cambiarEstadoUsuario,
} from './actions';
import TablaUsuarios from './tabla';
import UsuarioForm from './form';
import DetalleUsuario from './detalle';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { motion } from 'framer-motion';
import {
    Users,
    UserCheck,
    Shield,
    Briefcase,
    Plus,
    Loader2,
    Trash2
} from 'lucide-react';

export default function UsuariosContent() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [cargando, setCargando] = useState(true);
    const [modalFormulario, setModalFormulario] = useState(false);
    const [modalDetalle, setModalDetalle] = useState(false);
    const [modalEliminar, setModalEliminar] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const [procesando, setProcesando] = useState(false);

    const { toasts, removeToast, success, error } = useToast();

    // Cargar usuarios
    useEffect(() => {
        const cargarUsuarios = async () => {
            setCargando(true);
            const resultado = await obtenerUsuarios();
            if (resultado.success && resultado.data) {
                setUsuarios(resultado.data);
            } else {
                error('Error al cargar usuarios');
            }
            setCargando(false);
        };

        cargarUsuarios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const recargarUsuarios = async () => {
        // No mostramos loading global para evitar parpadeos
        const resultado = await obtenerUsuarios();
        if (resultado.success && resultado.data) {
            setUsuarios(resultado.data);
        }
    };

    // Abrir modal de crear
    const handleNuevoUsuario = () => {
        setUsuarioSeleccionado(null);
        setModalFormulario(true);
    };

    // Abrir modal de editar
    const handleEditarUsuario = (usuario: Usuario) => {
        setUsuarioSeleccionado(usuario);
        setModalFormulario(true);
    };

    // Abrir modal de detalle
    const handleVerDetalle = (usuario: Usuario) => {
        setUsuarioSeleccionado(usuario);
        setModalDetalle(true);
    };

    // Abrir modal de eliminar
    const handleEliminarUsuario = (usuario: Usuario) => {
        setUsuarioSeleccionado(usuario);
        setModalEliminar(true);
    };

    // Confirmar eliminación
    const confirmarEliminar = async () => {
        if (!usuarioSeleccionado) return;

        setProcesando(true);
        const resultado = await eliminarUsuario(usuarioSeleccionado.id);

        if (resultado.success) {
            success('Usuario eliminado correctamente');
            setModalEliminar(false);
            setUsuarioSeleccionado(null);
            recargarUsuarios();
        } else {
            error(resultado.error || 'Error al eliminar usuario');
        }
        setProcesando(false);
    };

    // Cambiar estado del usuario
    const handleCambiarEstado = async (id: string, activo: boolean) => {
        // Optimistic update
        setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo } : u));

        const resultado = await cambiarEstadoUsuario(id, activo);

        if (resultado.success) {
            success(activo ? 'Usuario activado' : 'Usuario desactivado');
            // No necesitamos recargar si el optimistic update fue correcto
        } else {
            // Revertir si falló
            setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !activo } : u));
            error(resultado.error || 'Error al cambiar estado');
        }
    };

    // Guardar usuario (crear o actualizar)
    const handleGuardarUsuario = async (data: Partial<Usuario>) => {
        setProcesando(true);

        let resultado;
        if (usuarioSeleccionado) {
            resultado = await actualizarUsuario(usuarioSeleccionado.id, data);
        } else {
            resultado = await crearUsuario(data);
        }

        if (resultado.success) {
            success(
                usuarioSeleccionado
                    ? 'Usuario actualizado correctamente'
                    : 'Usuario creado correctamente'
            );
            setModalFormulario(false);
            setUsuarioSeleccionado(null);
            recargarUsuarios();
        } else {
            error(resultado.error || 'Error al guardar usuario');
        }
        setProcesando(false);
    };

    const stats = [
        {
            label: 'Total de Usuarios',
            value: usuarios.length,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100'
        },
        {
            label: 'Usuarios Activos',
            value: usuarios.filter((u) => u.activo).length,
            icon: UserCheck,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-100'
        },
        {
            label: 'Administradores',
            value: usuarios.filter((u) => u.rol === 'admin').length,
            icon: Shield,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-100'
        },
        {
            label: 'Vendedores',
            value: usuarios.filter((u) => u.rol === 'vendedor').length,
            icon: Briefcase,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-100'
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-6 max-w-7xl mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-gray-500 mt-1 text-lg">
                        Administra los usuarios del sistema y sus permisos
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNuevoUsuario}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-blue-600/20 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nuevo Usuario</span>
                </motion.button>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`bg-white rounded-xl shadow-sm p-4 md:p-5 border ${stat.border} hover:shadow-md transition-shadow`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className={`text-3xl font-bold ${stat.color}`}>
                                    {stat.value}
                                </div>
                                <div className="text-gray-600 text-sm mt-1 font-medium">{stat.label}</div>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tabla de usuarios */}
            {cargando ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Cargando usuarios...</p>
                </div>
            ) : (
                <TablaUsuarios
                    usuarios={usuarios}
                    onEditar={handleEditarUsuario}
                    onEliminar={handleEliminarUsuario}
                    onVerDetalle={handleVerDetalle}
                    onCambiarEstado={handleCambiarEstado}
                />
            )}

            {/* Modal de formulario */}
            <Modal
                isOpen={modalFormulario}
                onClose={() => {
                    if (!procesando) {
                        setModalFormulario(false);
                        setUsuarioSeleccionado(null);
                    }
                }}
                title={usuarioSeleccionado ? 'Editar Usuario' : 'Nuevo Usuario'}
            >
                <UsuarioForm
                    usuario={usuarioSeleccionado}
                    onSubmit={handleGuardarUsuario}
                    onCancel={() => {
                        if (!procesando) {
                            setModalFormulario(false);
                            setUsuarioSeleccionado(null);
                        }
                    }}
                />
                {procesando && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                    </div>
                )}
            </Modal>

            {/* Modal de detalle */}
            <Modal
                isOpen={modalDetalle}
                onClose={() => {
                    setModalDetalle(false);
                    setUsuarioSeleccionado(null);
                }}
                title="Detalle del Usuario"
                maxWidth="max-w-4xl"
            >
                {usuarioSeleccionado && (
                    <DetalleUsuario
                        usuario={usuarioSeleccionado}
                        onClose={() => {
                            setModalDetalle(false);
                            setUsuarioSeleccionado(null);
                        }}
                    />
                )}
            </Modal>

            {/* Modal de confirmación de eliminación */}
            <Modal
                isOpen={modalEliminar}
                onClose={() => {
                    if (!procesando) {
                        setModalEliminar(false);
                        setUsuarioSeleccionado(null);
                    }
                }}
                title="Confirmar Eliminación"
            >
                <div className="space-y-6">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-start space-x-4">
                        <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
                            <Shield className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-red-800 font-bold text-lg mb-1">¿Eliminar usuario?</h3>
                            <p className="text-red-700">
                                Estás a punto de eliminar a <strong>{usuarioSeleccionado?.nombre}</strong>.
                                Esta acción es irreversible y se perderán todos los datos asociados.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                if (!procesando) {
                                    setModalEliminar(false);
                                    setUsuarioSeleccionado(null);
                                }
                            }}
                            disabled={procesando}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmarEliminar}
                            disabled={procesando}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center space-x-2 font-medium shadow-lg shadow-red-600/20"
                        >
                            {procesando ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            <span>{procesando ? 'Eliminando...' : 'Eliminar Usuario'}</span>
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Toast notifications */}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`px-6 py-4 rounded-xl shadow-lg text-white flex items-center space-x-3 ${toast.type === 'success'
                            ? 'bg-green-600'
                            : toast.type === 'error'
                                ? 'bg-red-600'
                                : toast.type === 'warning'
                                    ? 'bg-yellow-600'
                                    : 'bg-blue-600'
                            }`}
                    >
                        <span>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/80 hover:text-white font-bold"
                        >
                            ✕
                        </button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
