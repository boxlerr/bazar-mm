'use client';

import { Cliente, MovimientoCuentaCorriente } from '@/types/cliente';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wallet, User, Phone, Mail, MapPin, Receipt, History, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import PaymentModal from './PaymentModal';
import MovimientosTable from './MovimientosTable';

interface ClienteDetalleViewProps {
    cliente: Cliente;
    movimientos: MovimientoCuentaCorriente[];
}

export default function ClienteDetalleView({ cliente, movimientos }: ClienteDetalleViewProps) {
    const [activeTab, setActiveTab] = useState<'cuenta' | 'info'>('cuenta');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const saldo = cliente.saldo_cuenta_corriente || 0;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header & Navigation */}
            <div className="flex items-center gap-4">
                <Link
                    href="/clientes"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{cliente.nombre}</h1>
                    <p className="text-gray-500">Gestión de cliente y cuenta corriente</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Balance Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Wallet size={120} />
                        </div>

                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Saldo a Pagar</h3>
                        <div className={`text-4xl font-bold mb-6 ${saldo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${saldo.toFixed(2)}
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                            onClick={() => setIsPaymentModalOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Registrar Pago
                        </Button>
                    </motion.div>

                    {/* Quick Contact Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User size={20} className="text-gray-400" />
                            Datos de Contacto
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Mail size={18} />
                                <span>{cliente.email || 'Sin email'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Phone size={18} />
                                <span>{cliente.telefono || 'Sin teléfono'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <MapPin size={18} />
                                <span>{cliente.direccion || 'Sin dirección'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-gray-200">
                        {[
                            { id: 'cuenta', label: 'Cuenta Corriente', icon: Receipt },
                            { id: 'info', label: 'Información Detallada', icon: User },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'cuenta' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-gray-900">Movimientos Recientes</h2>
                                        <span className="text-sm text-gray-500">Últimos 50 movimientos</span>
                                    </div>
                                    <MovimientosTable movimientos={movimientos} />
                                </div>
                            )}

                            {activeTab === 'info' && (
                                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Información del Cliente</h2>
                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
                                            <dd className="mt-1 text-lg font-semibold text-gray-900">{cliente.nombre}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">DNI / CUIT</dt>
                                            <dd className="mt-1 text-lg font-semibold text-gray-900">{cliente.dni || '-'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="mt-1 text-base text-gray-900">{cliente.email || '-'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                                            <dd className="mt-1 text-base text-gray-900">{cliente.telefono || '-'}</dd>
                                        </div>
                                        <div className="col-span-2">
                                            <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                                            <dd className="mt-1 text-base text-gray-900">{cliente.direccion || '-'}</dd>
                                        </div>
                                        <div className="col-span-2 border-t pt-4 mt-4">
                                            <dt className="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                                            <dd className="mt-1 text-sm text-gray-600">
                                                {new Date(cliente.created_at).toLocaleDateString()}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                clienteId={cliente.id}
                clienteNombre={cliente.nombre}
                saldoActual={saldo}
            />
        </div>
    );
}
