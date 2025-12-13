'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { registrarPago } from '@/app/(dashboard)/clientes/actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    clienteId: string;
    clienteNombre: string;
    saldoActual: number;
}

export default function PaymentModal({ isOpen, onClose, clienteId, clienteNombre, saldoActual }: PaymentModalProps) {
    const [monto, setMonto] = useState('');
    const [metodo, setMetodo] = useState('efectivo');
    const [notas, setNotas] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!monto) return;

        setLoading(true);
        try {
            const result = await registrarPago(clienteId, parseFloat(monto), metodo, notas);

            if (result.success) {
                toast.success('Pago registrado correctamente');
                onClose();
                setMonto('');
                setNotas('');
            } else {
                toast.error(result.error || 'Error al registrar pago');
            }
        } catch (error) {
            toast.error('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Registrar Pago - ${clienteNombre}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Saldo Actual Deudor</label>
                    <div className="text-2xl font-bold text-red-600">
                        ${saldoActual.toFixed(2)}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="monto" className="block text-sm font-medium text-gray-700">Monto a Pagar</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input
                            id="monto"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="metodo" className="block text-sm font-medium text-gray-700">Método de Pago</label>
                    <select
                        id="metodo"
                        value={metodo}
                        onChange={(e) => setMetodo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="notas" className="block text-sm font-medium text-gray-700">Notas (Opcional)</label>
                    <input
                        id="notas"
                        type="text"
                        placeholder="Referencia, nro comprobante, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading || !monto}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
                        Confirmar Pago
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
