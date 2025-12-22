'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';

interface DateRangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (startDate: Date | null, endDate: Date | null) => void;
    title: string;
}

export default function DateRangeModal({ isOpen, onClose, onGenerate, title }: DateRangeModalProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            // Default to current month? Or empty? Let's default to empty (all history) or current month.
            // User asked for "fechas o un tiempo historico".
            // Let's leave empty by default to imply "All time" or let them pick.
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const lastDay = new Date().toISOString().split('T')[0];
            setStartDate(firstDay);
            setEndDate(lastDay);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // Adjust end date to end of day if needed, but usually actions handle "lte" which might need time adjustment.
        // For simplicity, we pass the dates as is, actions usually handle comparison.
        // Actually, to include the end date fully, we might want to set time to 23:59:59 if it's a date string.
        if (end) {
            end.setHours(23, 59, 59, 999);
        }

        onGenerate(start, end);
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha Inicio
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha Fin
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Quick select: Last 30 days
                                            const now = new Date();
                                            setEndDate(now.toISOString().split('T')[0]);
                                            const start = new Date();
                                            start.setDate(start.getDate() - 30);
                                            setStartDate(start.toISOString().split('T')[0]);
                                        }}
                                        className="flex-1 py-2 px-4 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all text-sm"
                                    >
                                        Últimos 30 días
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Quick select: This month
                                            const now = new Date();
                                            const first = new Date(now.getFullYear(), now.getMonth(), 1);
                                            setStartDate(first.toISOString().split('T')[0]);
                                            setEndDate(now.toISOString().split('T')[0]);
                                        }}
                                        className="flex-1 py-2 px-4 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all text-sm"
                                    >
                                        Este Mes
                                    </button>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-sm hover:shadow active:scale-[0.98]"
                                    >
                                        Generar Reporte
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
