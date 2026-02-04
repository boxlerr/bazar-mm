'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { eliminarCompra } from '../actions';

interface Props {
    id: string;
}

export function PurchaseActions({ id }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const result = await eliminarCompra(id);
            if (result.success) {
                router.push('/compras');
                router.refresh();
            } else {
                toast.error(result.error || 'Error al eliminar la compra');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al eliminar la compra');
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="w-full md:w-auto justify-center bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium border border-red-200"
            >
                <Trash2 className="w-4 h-4" />
                Eliminar Compra
            </button>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center"
                        >
                            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Compra?</h3>
                            <p className="text-gray-500 mb-6">
                                Esta acción eliminará la compra y <strong>revertirá el stock</strong> de todos los productos asociados. Esta acción no se puede deshacer.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-700 font-medium disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition font-bold shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Eliminando...
                                        </>
                                    ) : (
                                        'Confirmar Eliminación'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
