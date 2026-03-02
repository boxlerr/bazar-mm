import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface CancelSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (motivo: string) => Promise<void>;
    title?: string;
}

export default function CancelSaleModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Anular Venta"
}: CancelSaleModalProps) {
    const [motivo, setMotivo] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (!motivo.trim()) return;
        setIsLoading(true);
        await onConfirm(motivo);
        setIsLoading(false);
        setMotivo('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-5 flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Esta acción marcará la venta como cancelada (Nota de Crédito), restaurará el stock de los productos involucrados y registrará un movimiento contable para la devolución del dinero. Esta acción no se puede deshacer.
                        </p>

                        <div className="mb-4">
                            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
                                Motivo de la anulación <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="motivo"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                rows={3}
                                placeholder="Ej: Error al facturar, cliente devolvió todo..."
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-5 py-3 flex justify-end gap-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || !motivo.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Procesando...</span>
                            </>
                        ) : (
                            <span>Confirmar Anulación</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
