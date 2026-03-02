'use client';

import { Cliente } from '@/types/cliente';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, User, ArrowRight, Wallet, Users, AlertCircle, Edit, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ClienteForm from '@/app/(dashboard)/clientes/form';
import { crearCliente, actualizarCliente, eliminarCliente } from '@/app/(dashboard)/clientes/actions';
import { useToast } from '@/hooks/useToast';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { exportClientsToXLSX } from '@/app/(dashboard)/reportes/export';

// Funciones utilitarias para UI
const getAvatarColor = (name: string) => {
    const colors = [
        'from-blue-500 to-indigo-600',
        'from-emerald-400 to-teal-600',
        'from-amber-400 to-orange-600',
        'from-rose-400 to-pink-600',
        'from-violet-500 to-purple-700',
        'from-cyan-400 to-blue-600',
    ];
    // Simple hash
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
};

interface ClientsListProps {
    initialClientes: Cliente[];
    onSelect?: (cliente: Cliente) => void;
}

export default function ClientsList({ initialClientes, onSelect }: ClientsListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBalance, setFilterBalance] = useState<'all' | 'with_balance'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { success, error } = useToast();

    const handleNewClient = () => {
        setSelectedClient(null);
        setIsModalOpen(true);
    };

    const handleEditClient = (cliente: Cliente) => {
        setSelectedClient(cliente);
        setIsModalOpen(true);
    };

    const handleSaveClient = async (formData: FormData) => {
        let result;
        if (selectedClient) {
            result = await actualizarCliente(selectedClient.id, formData);
        } else {
            result = await crearCliente(formData);
        }

        if (result.success) {
            success(selectedClient ? 'Cliente actualizado' : 'Cliente creado exitosamente');
            setIsModalOpen(false);
            setSelectedClient(null);
        } else {
            error(result.error || 'Error al guardar cliente');
            throw new Error(result.error);
        }
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setClientToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;
        setLoading(true);
        const res = await eliminarCliente(clientToDelete);
        if (res.success) {
            success('Cliente eliminado');
        } else {
            error(res.error || 'Error al eliminar cliente');
        }
        setLoading(false);
        setDeleteModalOpen(false);
        setClientToDelete(null);
    };

    const handleExport = () => {
        exportClientsToXLSX(initialClientes);
    };

    const filteredClientes = initialClientes.filter((cliente) => {
        const matchesSearch = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.telefono?.includes(searchTerm);

        if (!matchesSearch) return false;

        if (filterBalance === 'with_balance') {
            return (cliente.saldo_cuenta_corriente || 0) !== 0;
        }

        return true;
    });

    const totalClients = filteredClientes.length;
    const totalReceivables = filteredClientes.reduce((sum, cliente) => sum + (cliente.saldo_cuenta_corriente || 0), 0);

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 flex items-center justify-between group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Clientes</p>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalClients}</h3>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl text-blue-600 shadow-inner">
                        <Users size={32} strokeWidth={1.5} />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 flex items-center justify-between group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Por Cobrar</p>
                        <h3 className="text-4xl font-black text-slate-800 tracking-tight">${totalReceivables.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-4 rounded-2xl text-rose-600 shadow-inner">
                        <Wallet size={32} strokeWidth={1.5} />
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100/50 flex flex-col xl:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto flex-1">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                            <button
                                onClick={() => setFilterBalance('all')}
                                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filterBalance === 'all'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilterBalance('with_balance')}
                                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filterBalance === 'with_balance'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Con Saldo
                            </button>
                        </div>
                    </div>
                    {/* Replaced Link with Button to open Modal */}
                    <div className="flex gap-2 w-full lg:w-auto">
                        <Button
                            onClick={handleExport}
                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Exportar
                        </Button>
                        <Button className="flex-1 sm:flex-none" onClick={handleNewClient}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Cliente
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className={`overflow-x-auto ${onSelect ? 'max-h-[60vh] overflow-y-auto' : ''}`}>
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence mode="popLayout">
                                {filteredClientes.map((cliente, index) => (
                                    <motion.tr
                                        key={cliente.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                        className="hover:bg-gray-50/80 transition-all duration-200 group relative"
                                    >
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getAvatarColor(cliente.nombre)} flex items-center justify-center text-white font-bold shadow-sm transform transition-transform group-hover:scale-105 group-hover:rotate-3`}>
                                                    {cliente.nombre.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-base">{cliente.nombre}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                            {cliente.dni || 'S/D'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {cliente.email || <span className="text-gray-400 italic">Sin correo</span>}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {cliente.telefono || <span className="text-gray-400 italic">Sin teléfono</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                            <div className="flex justify-end">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${(cliente.saldo_cuenta_corriente || 0) > 0
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200/60 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                                                    : (cliente.saldo_cuenta_corriente || 0) < 0
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                                        : 'bg-gray-50 text-gray-600 border-gray-200/60'
                                                    }`}>
                                                    {(cliente.saldo_cuenta_corriente || 0) > 0 && <AlertCircle size={14} className="mr-1.5" strokeWidth={2.5} />}
                                                    ${Math.abs(cliente.saldo_cuenta_corriente || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right">
                                            {onSelect ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => onSelect(cliente)}
                                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border-0 shadow-none transition-colors"
                                                >
                                                    Seleccionar
                                                </Button>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditClient(cliente);
                                                        }}
                                                        className="p-2.5 hover:bg-white rounded-xl text-gray-400 hover:text-blue-600 hover:shadow-sm border border-transparent hover:border-gray-200/60 transition-all"
                                                        title="Editar"
                                                    >
                                                        <Edit size={18} strokeWidth={2} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteClick(cliente.id, e)}
                                                        className="p-2.5 hover:bg-white rounded-xl text-gray-400 hover:text-rose-600 hover:shadow-sm border border-transparent hover:border-gray-200/60 transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} strokeWidth={2} />
                                                    </button>
                                                    <Link href={`/clientes/${cliente.id}`} className="inline-block">
                                                        <div className="p-2.5 hover:bg-gray-900 rounded-xl text-gray-400 hover:text-white transition-all shadow-sm">
                                                            <ArrowRight size={18} strokeWidth={2} />
                                                        </div>
                                                    </Link>
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>

                            {filteredClientes.length === 0 && (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <td colSpan={4} className="px-6 py-20 text-center bg-gray-50/30">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                                                <Search size={24} className="text-gray-300" />
                                            </div>
                                            <div className="text-gray-500 font-medium">No se encontraron clientes</div>
                                            <div className="text-gray-400 text-sm max-w-sm">
                                                Intenta ajustar los filtros de búsqueda o agrega un nuevo cliente al sistema.
                                            </div>
                                        </div>
                                    </td>
                                </motion.tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div >

            {/* Client Form Modal */}
            < Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)
                }
                title={selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
            >
                <ClienteForm
                    cliente={selectedClient}
                    onSubmit={handleSaveClient}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal >

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="¿Eliminar Cliente?"
                description="Esta acción eliminará el cliente del sistema. ¿Está seguro que desea continuar?"
                loading={loading}
            />
        </div >
    );
}
