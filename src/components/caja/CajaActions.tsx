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
            transition={{ delay: 0.4, ease: "easeOut" }}
            className="flex flex-wrap gap-4 mb-10"
        >
            {!cajaAbierta ? (
                <button
                    onClick={onAbrirCaja}
                    className="w-full sm:w-auto justify-center flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_-6px_rgba(5,150,105,0.4)] hover:shadow-[0_12px_24px_-8px_rgba(5,150,105,0.6)] hover:-translate-y-0.5 active:scale-95"
                >
                    <Unlock className="w-5 h-5" />
                    Abrir Caja
                </button>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap gap-4 w-full">
                    <button
                        onClick={onNuevoIngreso}
                        className="justify-center flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_24px_-8px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 active:scale-95"
                    >
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        Nuevo Ingreso
                    </button>
                    <button
                        onClick={onNuevoEgreso}
                        className="justify-center flex items-center gap-2.5 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_8px_20px_-6px_rgba(225,29,72,0.4)] hover:shadow-[0_12px_24px_-8px_rgba(225,29,72,0.6)] hover:-translate-y-0.5 active:scale-95"
                    >
                        <Minus className="w-5 h-5" strokeWidth={2.5} />
                        Nuevo Egreso
                    </button>
                    <button
                        onClick={onCerrarCaja}
                        className="justify-center flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 md:ml-auto col-span-1 sm:col-span-2 md:col-span-1"
                    >
                        <Lock className="w-5 h-5" strokeWidth={2.5} />
                        Cerrar Caja
                    </button>
                </div>
            )}
        </motion.div>
    );
}
