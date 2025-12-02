import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EmpresaForm from '@/components/configuracion/EmpresaForm';
import { getEmpresaConfig } from './actions';

export const metadata: Metadata = {
    title: 'Información del Negocio | Bazar M&M',
    description: 'Configuración de datos de la empresa',
};

export default async function EmpresaPage() {
    const config = await getEmpresaConfig();

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

                <h1 className="text-3xl font-bold text-gray-900">Información del Negocio</h1>
                <p className="text-gray-500 mt-2">
                    Gestiona los datos que identifican a tu empresa en el sistema y comprobantes.
                </p>
            </div>

            <EmpresaForm initialConfig={config} />
        </div>
    );
}
