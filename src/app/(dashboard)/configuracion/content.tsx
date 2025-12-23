'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Settings, Receipt, Download, Building2, Shield, Bell, ChevronRight } from 'lucide-react';

const configSections = [
    {
        icon: Download,
        title: 'Copia de Seguridad',
        description: 'Descarga una copia completa de tu base de datos para mantener tu información segura.',
        href: '#backup',
        color: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/20',
        action: 'backup'
    },
    {
        icon: Building2,
        title: 'Información del Negocio',
        description: 'Gestiona los datos de contacto, dirección y detalles fiscales de tu empresa.',
        href: '/configuracion/empresa',
        color: 'from-emerald-500 to-emerald-600',
        shadow: 'shadow-emerald-500/20'
    },
    {
        icon: Bell,
        title: 'Notificaciones',
        description: 'Configura alertas de stock bajo y reportes automáticos por correo.',
        href: '/configuracion/notificaciones',
        color: 'from-amber-500 to-amber-600',
        shadow: 'shadow-amber-500/20'
    },
    {
        icon: Shield,
        title: 'Seguridad y Permisos',
        description: 'Administra usuarios, roles y niveles de acceso al sistema.',
        href: '/usuarios',
        color: 'from-violet-500 to-violet-600',
        shadow: 'shadow-violet-500/20'
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

import { useState } from 'react';
import { toast } from 'sonner';

export default function ConfiguracionContent() {
    const [downloading, setDownloading] = useState(false);

    const handleDownloadBackup = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            const response = await fetch('/api/backup');
            if (!response.ok) throw new Error('Error generando backup');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-bazar-mm-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Backup descargado correctamente');
        } catch (error) {
            console.error('Backup error:', error);
            toast.error('Error al descargar el backup');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <Settings className="w-8 h-8 text-gray-700" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configuración</h1>
                            <p className="text-gray-500 text-lg">Personaliza cada aspecto de tu sistema</p>
                        </div>
                    </div>
                </motion.div>

                {/* Grid de secciones */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
                >
                    {configSections.map((section) => {
                        const Icon = section.icon;
                        const isBackup = (section as any).action === 'backup';

                        const CardContent = () => (
                            <>
                                {section.badge && (
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 bg-gradient-to-r ${section.color} text-white text-xs font-bold rounded-full shadow-lg`}>
                                            {section.badge}
                                        </span>
                                    </div>
                                )}

                                <div className="p-6 flex items-start gap-5 flex-1 text-left">
                                    <div className={`p-4 rounded-xl bg-gradient-to-br ${section.color} ${section.shadow} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 relative`}>
                                        <Icon className={`w-7 h-7 ${isBackup && downloading ? 'opacity-0' : 'opacity-100'}`} />
                                        {isBackup && downloading && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                            {isBackup && downloading ? 'Generando Backup...' : section.title}
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed">
                                            {section.description}
                                        </p>
                                    </div>

                                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                        {isBackup ? <Download className="w-6 h-6 text-gray-300" /> : <ChevronRight className="w-6 h-6 text-gray-300" />}
                                    </div>
                                </div>

                                <div className={`h-1.5 w-0 group-hover:w-full bg-gradient-to-r ${section.color} transition-all duration-500 ease-out`} />
                            </>
                        );

                        return (
                            <motion.div key={section.href} variants={item}>
                                {isBackup ? (
                                    <button
                                        onClick={handleDownloadBackup}
                                        disabled={downloading}
                                        className="w-full group relative flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                                    >
                                        <CardContent />
                                    </button>
                                ) : (
                                    <Link
                                        href={section.href}
                                        className="group relative flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <CardContent />
                                    </Link>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
