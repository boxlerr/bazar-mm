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
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col h-full hover:shadow-md transition-shadow relative"
        >
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${bg} flex items-center justify-center mb-3 md:mb-4`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color}`} />
            </div>

            <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2 line-clamp-1">{title}</h3>
            <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-6 flex-grow line-clamp-2 md:line-clamp-none leading-relaxed">
                {description}
            </p>

            <button
                onClick={onGenerate}
                className="w-full flex items-center justify-center gap-1.5 md:gap-2 bg-gray-50 hover:bg-gray-100 text-gray-900 px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-colors border border-gray-200 mt-auto"
            >
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="md:inline">Generar</span>
            </button>
        </motion.div>
    );
}
