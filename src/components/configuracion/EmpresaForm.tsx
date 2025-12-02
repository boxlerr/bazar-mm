'use client';

import { useState } from 'react';
import { EmpresaConfig } from '@/types';
import { saveEmpresaConfig } from '@/app/(dashboard)/configuracion/empresa/actions';
import { Save, Building2, Phone, Mail, FileText, MapPin } from 'lucide-react';

interface EmpresaFormProps {
    initialConfig: EmpresaConfig;
}

export default function EmpresaForm({ initialConfig }: EmpresaFormProps) {
    const [config, setConfig] = useState<EmpresaConfig>(initialConfig);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const result = await saveEmpresaConfig(config);

        if (result.success) {
            setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Error al guardar' });
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Datos de la Empresa</h2>
                    <p className="text-sm text-gray-500">Esta información aparecerá en los tickets y reportes</p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            required
                            value={config.nombre}
                            onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: Bazar M&M"
                        />
                    </div>
                </div>

                {/* CUIT */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">CUIT / Identificación Fiscal</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={config.cuit}
                            onChange={(e) => setConfig({ ...config, cuit: e.target.value })}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: 20-12345678-9"
                        />
                    </div>
                </div>

                {/* Dirección */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Completa</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            required
                            value={config.direccion}
                            onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Calle 123, Ciudad, Provincia"
                        />
                    </div>
                </div>

                {/* Teléfono */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={config.telefono}
                            onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+54 9 11 1234-5678"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            value={config.email}
                            onChange={(e) => setConfig({ ...config, email: e.target.value })}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="contacto@negocio.com"
                        />
                    </div>
                </div>

                {/* Mensaje Ticket */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje al pie del ticket</label>
                    <textarea
                        rows={3}
                        value={config.mensaje_ticket}
                        onChange={(e) => setConfig({ ...config, mensaje_ticket: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="¡Gracias por su compra! Vuelva pronto."
                    />
                    <p className="mt-1 text-xs text-gray-500">Este mensaje aparecerá al final de todos los comprobantes impresos.</p>
                </div>
            </div>

            {message && (
                <div className={`mx-6 mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className="font-medium">{message.text}</p>
                </div>
            )}
        </form>
    );
}
