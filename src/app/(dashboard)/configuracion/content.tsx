'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Settings, Receipt, Download, Building2, Shield, Bell, ChevronRight } from 'lucide-react';

const configSections = [
    {
        icon: Receipt,
        title: 'Configuración de Tickets',
        description: 'Personaliza el formato, logo y diseño de tus comprobantes impresos.',
        href: '/configuracion/ticket',
        color: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/20',
        badge: 'Nuevo'
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

export default function ConfiguracionContent() {
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
                        return (
                            <motion.div key={section.href} variants={item}>
                                <Link
                                    href={section.href}
                                    className="group relative flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                                >
                                    {section.badge && (
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-3 py-1 bg-gradient-to-r ${section.color} text-white text-xs font-bold rounded-full shadow-lg`}>
                                                {section.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-6 flex items-start gap-5 flex-1">
                                        <div className={`p-4 rounded-xl bg-gradient-to-br ${section.color} ${section.shadow} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-7 h-7" />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                {section.title}
                                            </h3>
                                            <p className="text-gray-500 leading-relaxed">
                                                {section.description}
                                            </p>
                                        </div>

                                        <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                            <ChevronRight className="w-6 h-6 text-gray-300" />
                                        </div>
                                    </div>

                                    <div className={`h-1.5 w-0 group-hover:w-full bg-gradient-to-r ${section.color} transition-all duration-500 ease-out`} />
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Backup Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl overflow-hidden text-white"
                >
                    <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-start gap-6">
                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <Download className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Copia de Seguridad</h2>
                                <p className="text-gray-300 max-w-xl leading-relaxed">
                                    Mantén tus datos seguros descargando una copia completa de tu base de datos.
                                    Recomendamos realizar este proceso semanalmente.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <button className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 hover:-translate-y-0.5 active:translate-y-0">
                                <Download className="w-5 h-5" />
                                Descargar Backup
                            </button>

                            <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all backdrop-blur-sm">
                                <Shield className="w-5 h-5" />
                                Configurar Automático
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
