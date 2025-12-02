'use client';

import { motion } from 'framer-motion';
import { LucideIcon, Download } from 'lucide-react';

interface ReportCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    delay: number;
    onGenerate: () => void;
}

export default function ReportCard({
    title,
    description,
    icon: Icon,
    color,
    bg,
    delay,
    onGenerate,
}: ReportCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow"
        >
            <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-grow">{description}</p>

            <button
                onClick={onGenerate}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-900 px-4 py-2.5 rounded-lg font-medium transition-colors border border-gray-200"
            >
                <Download className="w-4 h-4" />
                Generar Reporte
            </button>
        </motion.div>
    );
}
