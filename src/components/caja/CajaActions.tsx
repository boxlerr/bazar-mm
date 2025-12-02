'use client';

import { motion } from 'framer-motion';
import { Plus, Minus, Lock, Unlock } from 'lucide-react';

interface CajaActionsProps {
    cajaAbierta: boolean;
    onAbrirCaja: () => void;
    onCerrarCaja: () => void;
    onNuevoIngreso: () => void;
    onNuevoEgreso: () => void;
}

export default function CajaActions({
    cajaAbierta,
    onAbrirCaja,
    onCerrarCaja,
    onNuevoIngreso,
    onNuevoEgreso,
}: CajaActionsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 mb-8"
        >
            {!cajaAbierta ? (
                <button
                    onClick={onAbrirCaja}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
                >
                    <Unlock className="w-5 h-5" />
                    Abrir Caja
                </button>
            ) : (
                <>
                    <button
                        onClick={onNuevoIngreso}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Ingreso
                    </button>
                    <button
                        onClick={onNuevoEgreso}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
                    >
                        <Minus className="w-5 h-5" />
                        Nuevo Egreso
                    </button>
                    <button
                        onClick={onCerrarCaja}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow ml-auto"
                    >
                        <Lock className="w-5 h-5" />
                        Cerrar Caja
                    </button>
                </>
            )}
        </motion.div>
    );
}
