import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import NotificacionesForm from '@/components/configuracion/NotificacionesForm';
import { getNotificacionesConfig } from './actions';

export const metadata: Metadata = {
    title: 'Notificaciones | Bazar M&M',
    description: 'Configuración de alertas y notificaciones',
};

export default async function NotificacionesPage() {
    const config = await getNotificacionesConfig();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <Link
                    href="/configuracion"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver a Configuración
                </Link>

                <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
                <p className="text-gray-500 mt-2">
                    Gestiona las alertas del sistema para mantenerte informado sobre stock y ventas.
                </p>
            </div>

            <NotificacionesForm initialConfig={config} />
        </div>
    );
}
