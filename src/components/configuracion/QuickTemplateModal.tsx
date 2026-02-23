'use client';

import { X } from 'lucide-react';
import PDFTemplateEditor from './PDFTemplateEditor';
import { PDFTemplate } from '@/types/pdf_template';
import { toast } from 'sonner';

interface QuickTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialFile?: File;
}

export default function QuickTemplateModal({ isOpen, onClose, onSuccess, initialFile }: QuickTemplateModalProps) {

    if (!isOpen) return null;

    const handleSave = async (data: Partial<PDFTemplate>) => {
        try {
            const res = await fetch('/api/configuracion/pdf-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Error al guardar plantilla');

            toast.success('Plantilla configurada correctamente');
            onSuccess(); // Trigger reload/reparse in parent
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar la plantilla');
        }
    };

    return (
        // CONTENEDOR FONDO OSCURO (Fijo, sin scroll)
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-hidden">
            {/* CONTENEDOR MODAL BLANCO (Único con scroll y con la referencia) */}
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative animate-in fade-in duration-200"
            >
                {/* Header Sticky */}
                <div className="sticky top-0 bg-white z-40 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Configurar Nuevo Formato PDF</h2>
                        <p className="text-sm text-gray-500">Define las reglas para leer este archivo automáticamente.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Renderizado de PDFTemplateEditor */}
                <div className="p-6">
                    <PDFTemplateEditor
                        onSave={handleSave}
                        initialFile={initialFile}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
}
