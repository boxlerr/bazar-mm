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
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
                            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 w-full max-w-md pointer-events-auto overflow-hidden p-2"
                        >
                            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100/50">
                                <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5">
                                {type !== 'CERRAR' && (
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            Monto
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={monto}
                                                onChange={(e) => setMonto(e.target.value)}
                                                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold tracking-wide placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 text-lg"
                                                placeholder="0.00"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                )}

                                {(type === 'INGRESO' || type === 'EGRESO' || type === 'CERRAR') && (
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            {type === 'CERRAR' ? 'Observaciones de Cierre' : 'Descripción'}
                                        </label>
                                        <textarea
                                            required={type !== 'CERRAR'}
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none font-medium placeholder:font-normal placeholder:text-slate-400"
                                            placeholder={type === 'CERRAR' ? 'Opcional...' : 'Detalle del movimiento...'}
                                        />
                                    </div>
                                )}

                                {type === 'CERRAR' && (
                                    <div className="bg-amber-50/80 border border-amber-200/50 rounded-xl p-4">
                                        <p className="text-sm text-amber-800 font-medium">
                                            Al cerrar la caja, se generará un reporte final y no se podrán agregar más movimientos a esta sesión.
                                        </p>
                                    </div>
                                )}

                                <div className="pt-4 mt-2 border-t border-gray-100/60">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3.5 px-4 rounded-xl text-white font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${type === 'EGRESO'
                                            ? 'bg-rose-600 hover:bg-rose-500 shadow-[0_8px_20px_-6px_rgba(225,29,72,0.4)]'
                                            : type === 'CERRAR'
                                                ? 'bg-slate-800 hover:bg-slate-700 shadow-[0_8px_20px_-6px_rgba(30,41,59,0.4)]'
                                                : 'bg-blue-600 hover:bg-blue-500 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)]'
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
