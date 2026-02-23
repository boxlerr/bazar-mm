'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PDFTemplateEditor from '@/components/configuracion/PDFTemplateEditor';
import { PDFTemplate } from '@/types/pdf_template';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabaseClient';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function EditTemplatePage() {
    const params = useParams();
    const router = useRouter();
    const { success, error } = useToast();
    const [template, setTemplate] = useState<PDFTemplate | null>(null);
    const [loading, setLoading] = useState(true);

    const templateId = params.id as string;

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('pdf_parsing_templates')
                    .select('*')
                    .eq('id', templateId)
                    .single();

                if (fetchError) throw fetchError;
                if (data) {
                    setTemplate(data as PDFTemplate);
                }
            } catch (err) {
                console.error('Error fetching template:', err);
                error('Error al cargar la plantilla');
            } finally {
                setLoading(false);
            }
        };

        if (templateId) {
            fetchTemplate();
        }
    }, [templateId, error]);

    const handleSave = async (updatedData: Partial<PDFTemplate>) => {
        try {
            const res = await fetch(`/api/configuracion/pdf-templates/${templateId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                success('Plantilla actualizada exitosamente');
                router.push('/configuracion/pdf-templates');
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error('SERVER ERROR:', errData);
                error(`Error al actualizar la plantilla: ${errData.error || 'Server Error'}`);
            }
        } catch (err) {
            console.error('CLIENT ERROR:', err);
            error('Error de conexión');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                <p>Cargando plantilla...</p>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-xl border-gray-300 m-6 bg-gray-50">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Plantilla no encontrada</h3>
                <p className="text-gray-500 max-w-sm text-center mb-6">La plantilla que intentas editar no existe o fue eliminada.</p>
                <button
                    onClick={() => router.push('/configuracion/pdf-templates')}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md"
                >
                    Volver a Listar
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button
                onClick={() => router.push('/configuracion/pdf-templates')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors font-medium cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver a Plantillas
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Plantilla: {template.nombre}</h1>
            <PDFTemplateEditor onSave={handleSave} initialData={template} />
        </div>
    );
}
