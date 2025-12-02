'use client';

import { useState } from 'react';
import { NotificacionesConfig } from '@/types';
import { saveNotificacionesConfig } from '@/app/(dashboard)/configuracion/notificaciones/actions';
import { Save, Bell, Mail, AlertTriangle, ShoppingBag } from 'lucide-react';

interface NotificacionesFormProps {
    initialConfig: NotificacionesConfig;
}

export default function NotificacionesForm({ initialConfig }: NotificacionesFormProps) {
    const [config, setConfig] = useState<NotificacionesConfig>(initialConfig);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const result = await saveNotificacionesConfig(config);

        if (result.success) {
            setMessage({ type: 'success', text: 'Preferencias guardadas correctamente' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Error al guardar' });
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Preferencias de Alertas</h2>
                    <p className="text-sm text-gray-500">Configura cuándo y cómo quieres recibir notificaciones</p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Guardando...' : 'Guardar Preferencias'}
                </button>
            </div>

            <div className="p-6 space-y-8">
                {/* Sección Stock */}
                <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Alertas de Stock
                    </h3>
                    <div className="space-y-4 pl-7">
                        <div className="flex items-start gap-3">
                            <div className="flex items-center h-5">
                                <input
                                    id="alertas_stock"
                                    type="checkbox"
                                    checked={config.alertas_stock}
                                    onChange={(e) => setConfig({ ...config, alertas_stock: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="text-sm">
                                <label htmlFor="alertas_stock" className="font-medium text-gray-700">Activar alertas de stock bajo</label>
                                <p className="text-gray-500">Recibe una notificación cuando un producto esté por agotarse.</p>
                            </div>
                        </div>

                        {config.alertas_stock && (
                            <div className="max-w-xs">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo Global</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        value={config.stock_minimo_global}
                                        onChange={(e) => setConfig({ ...config, stock_minimo_global: parseInt(e.target.value) || 0 })}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Valor por defecto si el producto no tiene uno específico.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Sección Ventas */}
                <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-green-500" />
                        Alertas de Ventas
                    </h3>
                    <div className="space-y-4 pl-7">
                        <div className="flex items-start gap-3">
                            <div className="flex items-center h-5">
                                <input
                                    id="alertas_ventas"
                                    type="checkbox"
                                    checked={config.alertas_ventas}
                                    onChange={(e) => setConfig({ ...config, alertas_ventas: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="text-sm">
                                <label htmlFor="alertas_ventas" className="font-medium text-gray-700">Resumen diario de ventas</label>
                                <p className="text-gray-500">Recibe un correo al final del día con el total de ventas.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Sección Email */}
                <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-500" />
                        Canal de Notificación
                    </h3>
                    <div className="pl-7 max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico para Alertas</label>
                        <input
                            type="email"
                            value={config.email_notificaciones}
                            onChange={(e) => setConfig({ ...config, email_notificaciones: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="alertas@tunegocio.com"
                        />
                        <p className="mt-1 text-xs text-gray-500">Si se deja vacío, se enviarán al correo del administrador principal.</p>
                    </div>
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
