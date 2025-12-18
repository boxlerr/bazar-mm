'use client';

import { Cliente } from '@/types/cliente';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, User, ArrowRight, Wallet, Users, AlertCircle, Edit } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ClienteForm from '@/app/(dashboard)/clientes/form';
import { crearCliente, actualizarCliente } from '@/app/(dashboard)/clientes/actions';
import { useToast } from '@/hooks/useToast';

interface ClientsListProps {
    initialClientes: Cliente[];
    onSelect?: (cliente: Cliente) => void;
}

export default function ClientsList({ initialClientes, onSelect }: ClientsListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
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

    const filteredClientes = initialClientes.filter((cliente) =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefono?.includes(searchTerm)
    );

    const totalClients = initialClientes.length;
    const totalReceivables = initialClientes.reduce((sum, cliente) => sum + (cliente.saldo_cuenta_corriente || 0), 0);

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4"
                >
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Clientes</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalClients}</h3>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4"
                >
                    <div className="bg-red-50 p-3 rounded-lg text-red-600">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Por Cobrar</p>
                        <h3 className="text-2xl font-bold text-gray-900">${totalReceivables.toFixed(2)}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
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
                    {/* Replaced Link with Button to open Modal */}
                    <Button className="w-full sm:w-auto" onClick={handleNewClient}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Cliente
                    </Button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Saldo</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence mode="popLayout">
                                {filteredClientes.map((cliente, index) => (
                                    <motion.tr
                                        key={cliente.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-blue-50/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                    {cliente.nombre.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{cliente.nombre}</div>
                                                    <div className="text-xs text-gray-400">{cliente.dni || 'Sin DNI'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex flex-col gap-1">
                                                <span>{cliente.email}</span>
                                                <span className="text-xs text-gray-400">{cliente.telefono}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(cliente.saldo_cuenta_corriente || 0) > 0
                                                ? 'bg-red-50 text-red-700'
                                                : 'bg-green-50 text-green-700'
                                                }`}>
                                                {(cliente.saldo_cuenta_corriente || 0) > 0 && <AlertCircle size={12} className="mr-1" />}
                                                ${(cliente.saldo_cuenta_corriente || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {onSelect ? (
                                                <Button
                                                    // variant="secondary"
                                                    size="sm"
                                                    onClick={() => onSelect(cliente)}
                                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium"
                                                >
                                                    Seleccionar
                                                </Button>
                                            ) : (
                                                <Link href={`/clientes/${cliente.id}`} className="inline-block">
                                                    <div className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors">
                                                        <ArrowRight size={18} />
                                                    </div>
                                                </Link>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>

                            {filteredClientes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron clientes que coincidan con "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Client Form Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
            >
                <ClienteForm
                    cliente={selectedClient}
                    onSubmit={handleSaveClient}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div >
    );
}
