'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit, FileText, Loader2, Receipt } from 'lucide-react';
import { PDFTemplate } from '@/types/pdf_template';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

export default function PDFTemplatesPage() {
    const [templates, setTemplates] = useState<PDFTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
    const router = useRouter();
    const { success, error } = useToast();

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const res = await fetch('/api/configuracion/pdf-templates');
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            } else {
                error('Error al cargar plantillas');
            }
        } catch (err) {
            console.error(err);
            error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!templateToDelete) return;

        try {
            const res = await fetch(`/api/configuracion/pdf-templates/${templateToDelete}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                success('Plantilla eliminada');
                loadTemplates();
            } else {
                error('No se pudo eliminar la plantilla');
            }
        } catch (err) {
            error('Error al eliminar');
        } finally {
            setDeleteModalOpen(false);
            setTemplateToDelete(null);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Receipt className="w-8 h-8 text-blue-600" />
                        Plantillas de PDF
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Configura cómo leer los PDFs de nuevos proveedores
                    </p>
                </div>
                <Link
                    href="/configuracion/pdf-templates/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-600/20 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Plantilla
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/configuracion/pdf-templates/${template.id}`}
                                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={() => {
                                        setTemplateToDelete(template.id);
                                        setDeleteModalOpen(true);
                                    }}
                                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg mb-1">{template.nombre}</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {template.activo ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Activo
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    Inactivo
                                </span>
                            )}
                        </p>

                        <div className="space-y-2">
                            <div className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">Keywords:</span> {template.detect_keywords?.join(', ') || 'N/A'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {templates.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No hay plantillas creadas</h3>
                    <p className="text-gray-500 mb-6">Crea una plantilla para empezar a leer PDFs automáticamente</p>
                    <Link
                        href="/configuracion/pdf-templates/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Crear Plantilla
                    </Link>
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Plantilla"
                description="¿Estás seguro? Esto no se puede deshacer."
            />
        </div>
    );
}
