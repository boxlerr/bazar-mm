'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CajaModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onSubmit: (data: any) => void;
    type: 'ABRIR' | 'CERRAR' | 'INGRESO' | 'EGRESO';
}

export default function CajaModal({ isOpen, onClose, title, onSubmit, type }: CajaModalProps) {
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setMonto('');
            setDescripcion('');
            setLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        onSubmit({
            monto: parseFloat(monto),
            descripcion
        });
        setLoading(false);
        onClose();
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
                                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {type !== 'CERRAR' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Monto
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={monto}
                                                onChange={(e) => setMonto(e.target.value)}
                                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="0.00"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                )}

                                {(type === 'INGRESO' || type === 'EGRESO' || type === 'CERRAR') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {type === 'CERRAR' ? 'Observaciones de Cierre' : 'Descripción'}
                                        </label>
                                        <textarea
                                            required={type !== 'CERRAR'}
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                            placeholder={type === 'CERRAR' ? 'Opcional...' : 'Detalle del movimiento...'}
                                        />
                                    </div>
                                )}

                                {type === 'CERRAR' && (
                                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                        <p className="text-sm text-yellow-800">
                                            Al cerrar la caja, se generará un reporte final y no se podrán agregar más movimientos a esta sesión.
                                        </p>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed ${type === 'EGRESO'
                                                ? 'bg-red-600 hover:bg-red-700'
                                                : type === 'CERRAR'
                                                    ? 'bg-gray-800 hover:bg-gray-900'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        {loading ? 'Procesando...' : 'Confirmar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
