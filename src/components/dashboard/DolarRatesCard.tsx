'use client';

import { useEffect, useState } from 'react';
import { getDolarOficial, getDolarBlue } from '@/services/dolarService';
import { DollarSign, RefreshCw, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Rate {
    compra: number;
    venta: number;
    fechaActualizacion: string;
}

export default function DolarRatesCard() {
    const [oficial, setOficial] = useState<Rate | null>(null);
    const [blue, setBlue] = useState<Rate | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRates = async () => {
        setLoading(true);
        try {
            const [oficialData, blueData] = await Promise.all([
                getDolarOficial(),
                getDolarBlue()
            ]);
            setOficial(oficialData);
            setBlue(blueData);
        } catch (error) {
            console.error('Error fetching rates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
        const interval = setInterval(fetchRates, 300000); // Actualizar cada 5 min
        return () => clearInterval(interval);
    }, []);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 w-full h-full flex flex-col justify-between"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1.5 rounded-lg">
                        <DollarSign className="w-4 h-4 text-green-700" />
                    </div>
                    <h3 className="font-bold text-neutral-800 text-sm">Cotizaciones</h3>
                </div>
                <button
                    onClick={fetchRates}
                    disabled={loading}
                    className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500 hover:text-neutral-700"
                    title="Actualizar cotizaciones"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
                {/* Dólar Oficial */}
                <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-neutral-600">Oficial</span>
                        {/* <span className="text-[10px] text-neutral-400">{formatDate(oficial?.fechaActualizacion)}</span> */}
                    </div>
                    <div>
                        <div className="flex justify-between items-end text-xs mb-1">
                            <span className="text-neutral-500">C:</span>
                            <span className="font-bold text-neutral-900">${oficial?.compra || '-'}</span>
                        </div>
                        <div className="flex justify-between items-end text-xs">
                            <span className="text-neutral-500">V:</span>
                            <span className="font-bold text-green-600">${oficial?.venta || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Dólar Blue */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-1 opacity-5">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between mb-1 relative z-10">
                        <span className="text-xs font-bold text-blue-800">Blue</span>
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-end text-xs mb-1">
                            <span className="text-blue-600/70">C:</span>
                            <span className="font-bold text-blue-900">${blue?.compra || '-'}</span>
                        </div>
                        <div className="flex justify-between items-end text-xs">
                            <span className="text-blue-600/70">V:</span>
                            <span className="font-bold text-blue-700">${blue?.venta || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
