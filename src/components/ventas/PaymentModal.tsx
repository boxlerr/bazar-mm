'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote, Smartphone, Receipt } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onConfirm: (method: string) => Promise<void>;
    loading: boolean;
}

export default function PaymentModal({
    isOpen,
    onClose,
    total,
    onConfirm,
    loading
}: PaymentModalProps) {
    const [method, setMethod] = useState<string>('efectivo');
    const [pagoCon, setPagoCon] = useState<string>('');

    const methods = [
        { id: 'efectivo', label: 'Efectivo', icon: Banknote, color: 'text-green-600', bg: 'bg-green-100' },
        { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 'transferencia', label: 'Transferencia', icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-100' },
        { id: 'cuenta_corriente', label: 'Cta. Corriente', icon: Receipt, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    const vuelto = pagoCon ? parseFloat(pagoCon) - total : 0;

    const handleConfirm = async () => {
        await onConfirm(method);
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900">Confirmar Pago</h3>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Total a Pagar</p>
                                    <p className="text-4xl font-bold text-gray-900">{formatPrice(total)}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {methods.map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setMethod(m.id)}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${method === m.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`p-2 rounded-full ${m.bg}`}>
                                                <m.icon className={`w-5 h-5 ${m.color}`} />
                                            </div>
                                            <span className={`font-medium ${method === m.id ? 'text-blue-700' : 'text-gray-600'}`}>
                                                {m.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {method === 'efectivo' && (
                                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Paga con</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    value={pagoCon}
                                                    onChange={(e) => setPagoCon(e.target.value)}
                                                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                                                    placeholder="0.00"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        {vuelto > 0 && (
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                <span className="font-medium text-gray-600">Su Vuelto:</span>
                                                <span className="font-bold text-xl text-green-600">{formatPrice(vuelto)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={handleConfirm}
                                    disabled={loading || (method === 'efectivo' && parseFloat(pagoCon || '0') < total)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-[0.98]"
                                >
                                    {loading ? 'Procesando...' : 'Confirmar e Imprimir Ticket'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
