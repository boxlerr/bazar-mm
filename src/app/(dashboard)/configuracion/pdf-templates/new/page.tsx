'use client';

import PDFTemplateEditor from '@/components/configuracion/PDFTemplateEditor';
import { PDFTemplate } from '@/types/pdf_template';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

export default function NewTemplatePage() {
    const router = useRouter();
    const { success, error } = useToast();

    const handleSave = async (template: Partial<PDFTemplate>) => {
        try {
            const res = await fetch('/api/configuracion/pdf-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template)
            });

            if (res.ok) {
                success('Plantilla creada exitosamente');
                router.push('/configuracion/pdf-templates');
            } else {
                error('Error al crear plantilla');
            }
        } catch (err) {
            console.error(err);
            error('Error de conexión');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Plantilla de PDF</h1>
            <PDFTemplateEditor onSave={handleSave} />
        </div>
    );
}
