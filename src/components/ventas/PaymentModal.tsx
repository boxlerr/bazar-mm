'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Banknote, Smartphone, Receipt, AlertCircle, User, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onConfirm: (pagos: { metodo: string; monto: number }[], descuento?: number) => Promise<void>;
    loading: boolean;
    selectedClient: import('@/types/cliente').Cliente | null;
    dolarBlue?: number;
    dolarOficial?: number;
}

export default function PaymentModal({
    isOpen,
    onClose,
    total,
    onConfirm,
    loading,
    selectedClient,
    dolarBlue = 0,
    dolarOficial = 0
}: PaymentModalProps) {
    const [pagos, setPagos] = useState<{ metodo: string; monto: number }[]>([]);
    const [discountPercentage, setDiscountPercentage] = useState<string>('');

    // Estado para la selección actual
    const [currentMethod, setCurrentMethod] = useState<string>('efectivo');
    const [currentAmount, setCurrentAmount] = useState<string>('');

    // Reiniciar estados al abrir/cerrar
    useEffect(() => {
        if (isOpen) {
            setPagos([]);
            setCurrentMethod('efectivo');
            setDiscountPercentage('');
            setCurrentAmount(total.toFixed(2));
        }
    }, [isOpen, total]);

    // Calcular totales
    // Calcular totales con descuento
    const discountValue = (parseFloat(discountPercentage) || 0);
    const totalDescuento = (total * discountValue) / 100;
    const finalTotal = total - totalDescuento;

    const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
    const faltante = finalTotal - totalPagado;

    // Actualizar el monto sugerido automáticamente
    useEffect(() => {
        if (faltante > 0) {
            setCurrentAmount(faltante.toFixed(2));
        } else {
            setCurrentAmount('0.00');
        }
    }, [totalPagado, finalTotal]);

    const methods = [
        { id: 'efectivo', label: 'Efectivo', icon: Banknote, color: 'text-green-600', bg: 'bg-green-100', border: 'hover:border-green-200 hover:bg-green-50' },
        { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-100', border: 'hover:border-blue-200 hover:bg-blue-50' },
        { id: 'transferencia', label: 'Transferencia', icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-100', border: 'hover:border-purple-200 hover:bg-purple-50' },
        { id: 'cuenta_corriente', label: 'Cta. Corriente', icon: Receipt, color: 'text-orange-600', bg: 'bg-orange-100', border: 'hover:border-orange-200 hover:bg-orange-50' },
    ];

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatUSD = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const handleAddPayment = () => {
        const amount = parseFloat(currentAmount);
        if (isNaN(amount) || amount <= 0) return;

        // Validación Cta Corriente
        if (currentMethod === 'cuenta_corriente' && !selectedClient) return;

        setPagos([...pagos, { metodo: currentMethod, monto: amount }]);
    };

    const removePayment = (index: number) => {
        const newPagos = [...pagos];
        newPagos.splice(index, 1);
        setPagos(newPagos);
    };

    const handleConfirm = async () => {
        // Ajuste automático si es efectivo y hay vuelto (único pago)
        let pagosFinales = [...pagos];
        if (pagos.length === 1 && pagos[0].metodo === 'efectivo' && pagos[0].monto > finalTotal) {
            pagosFinales[0].monto = finalTotal;
        }
        await onConfirm(pagosFinales, totalDescuento);
    };

    const vuelto = (pagos.length === 1 && pagos[0].metodo === 'efectivo')
        ? pagos[0].monto - finalTotal
        : (totalPagado > finalTotal ? totalPagado - finalTotal : 0);

    const isComplete = faltante <= 0.05; // Tolerancia pequeña

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all"
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl pointer-events-auto overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-white/20"
                        >
                            {/* COLUMNA IZQUIERDA: Selección y Detalles */}
                            <div className="w-full md:w-7/12 p-8 bg-gray-50 flex flex-col overflow-y-auto">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Seleccionar Método</h3>
                                    <p className="text-gray-500 text-sm">Elija cómo desea abonar el saldo pendiente</p>
                                </div>

                                {/* Grid de Métodos */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                                    {methods.map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setCurrentMethod(m.id)}
                                            disabled={isComplete && currentMethod !== m.id} // Deshabilitar cambio si ya está completo, salvo que sea para editar
                                            className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group ${currentMethod === m.id
                                                ? `border-blue-500 bg-white ring-4 ring-blue-500/10 shadow-lg scale-[1.02]`
                                                : `border-gray-200 bg-white ${m.border} hover:shadow-md hover:-translate-y-1`
                                                } ${isComplete && currentMethod !== m.id ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                                        >
                                            <div className={`p-3 rounded-xl transition-colors ${currentMethod === m.id ? m.bg : 'bg-gray-100 group-hover:bg-white'}`}>
                                                <m.icon className={`w-6 h-6 ${currentMethod === m.id ? m.color : 'text-gray-500 group-hover:text-gray-700'}`} />
                                            </div>
                                            <span className={`font-bold text-sm ${currentMethod === m.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {m.label}
                                            </span>
                                            {currentMethod === m.id && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Zona de Input y Datos */}
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monto a agregar</label>
                                        <button
                                            onClick={() => setCurrentAmount(faltante > 0 ? faltante.toFixed(2) : '0')}
                                            className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer active:scale-95"
                                            title="Click para completar con el restante"
                                        >
                                            Restante: {formatPrice(faltante < 0 ? 0 : faltante)}
                                        </button>
                                    </div>

                                    <div className="relative mb-6">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-2xl">$</span>
                                        <input
                                            type="number"
                                            value={currentAmount}
                                            onChange={(e) => setCurrentAmount(e.target.value)}
                                            disabled={isComplete}
                                            className="w-full pl-10 pr-20 py-4 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-3xl text-gray-900 placeholder:text-gray-300 transition-all bg-gray-50/50 focus:bg-white"
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => setCurrentAmount(faltante > 0 ? faltante.toFixed(2) : '0')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors uppercase tracking-wide"
                                        >
                                            Total
                                        </button>
                                    </div>

                                    {/* Información Contextual por Método */}
                                    <div className="mt-auto space-y-4">
                                        {currentMethod === 'cuenta_corriente' && (
                                            !selectedClient ? (
                                                <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100">
                                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                    <div className="text-sm">
                                                        <p className="font-bold">Cliente Requerido</p>
                                                        <p>Debe seleccionar un cliente antes de usar Cuenta Corriente.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100">
                                                    <User className="w-4 h-4" />
                                                    <span>Cliente: <strong>{selectedClient.nombre}</strong></span>
                                                </div>
                                            )
                                        )}

                                        {currentMethod === 'transferencia' && (
                                            <div className="grid grid-cols-1 gap-3 text-sm">
                                                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Banknote className="w-4 h-4 text-purple-600" />
                                                        <span className="font-bold text-purple-900">Banco (Agustin Maidana)</span>
                                                    </div>
                                                    <div className="space-y-1 text-gray-600 text-xs">
                                                        <div className="flex justify-between"><span>CBU:</span> <span className="font-mono font-medium select-all">3860015705000047843269</span></div>
                                                        <div className="flex justify-between"><span>Alias:</span> <span className="font-bold text-purple-700 select-all">agustint29</span></div>
                                                        <div className="flex justify-between"><span>Cuenta:</span> <span className="font-mono select-all">CC $ 015004784326</span></div>
                                                        <div className="flex justify-between"><span>CUIL:</span> <span className="font-mono select-all">20-43679729-0</span></div>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Smartphone className="w-4 h-4 text-blue-600" />
                                                        <span className="font-bold text-blue-900">Mercado Pago (Franco Agustin Paccot)</span>
                                                    </div>
                                                    <div className="space-y-1 text-gray-600 text-xs">
                                                        <div className="flex justify-between"><span>CVU:</span> <span className="font-mono font-medium select-all">0000003100056794337958</span></div>
                                                        <div className="flex justify-between"><span>Alias:</span> <span className="font-bold text-blue-700 select-all">peic.lqnf</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleAddPayment}
                                        disabled={isComplete || !currentAmount || parseFloat(currentAmount) <= 0 || (currentMethod === 'cuenta_corriente' && !selectedClient)}
                                        className="w-full mt-6 bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
                                        title="Agregar este monto a la lista de pagos"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Agregar Pago</span>
                                    </button>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: Resumen */}
                            <div className="w-full md:w-5/12 bg-white flex flex-col border-l border-gray-100 relative">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-bold text-gray-900">Resumen de la Venta</h3>
                                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                                </div>

                                <div className="p-8 text-center flex-shrink-0">
                                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Total a Pagar</p>
                                    <div className="text-5xl font-black text-gray-900 tracking-tight mb-4">
                                        {formatPrice(finalTotal)}
                                    </div>

                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <label className="text-sm font-bold text-gray-500">Descuento %</label>
                                        <div className="relative w-24">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={discountPercentage}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val < 0 || val > 100) return;
                                                    setDiscountPercentage(e.target.value);
                                                }}
                                                className="w-full pl-3 pr-8 py-1.5 border-2 border-gray-200 rounded-lg font-bold text-center text-gray-900 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder="0"
                                                inputMode="decimal"
                                                onFocus={(e) => e.target.select()}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                        </div>
                                    </div>

                                    {totalDescuento > 0 && (
                                        <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
                                            Ahorro: {formatPrice(totalDescuento)}
                                        </div>
                                    )}

                                    {(dolarBlue || dolarOficial) && (
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {dolarBlue && (
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                                                    Blue: {formatUSD(finalTotal / dolarBlue)}
                                                </span>
                                            )}
                                            {dolarOficial && (
                                                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                                                    Oficial: {formatUSD(finalTotal / dolarOficial)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-2">
                                    <div className="space-y-3">
                                        {pagos.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                                                <div className="p-3 bg-white rounded-full shadow-sm mb-2">
                                                    <CreditCard className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <p className="text-sm font-medium">Agregue un pago para comenzar</p>
                                            </div>
                                        ) : (
                                            <AnimatePresence>
                                                {pagos.map((p, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm group hover:border-blue-200 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2.5 rounded-lg ${methods.find(m => m.id === p.metodo)?.bg}`}>
                                                                {(() => {
                                                                    const Icon = methods.find(m => m.id === p.metodo)?.icon || Banknote;
                                                                    return <Icon className={`w-5 h-5 ${methods.find(m => m.id === p.metodo)?.color}`} />;
                                                                })()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{methods.find(m => m.id === p.metodo)?.label}</p>
                                                                <p className="text-xs text-gray-500">Pago Registrado</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-gray-900 text-lg">{formatPrice(p.monto)}</span>
                                                            <button
                                                                onClick={() => removePayment(idx)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Eliminar pago"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 border-t border-gray-200 mt-auto">
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center text-gray-600">
                                            <span>Pagado:</span>
                                            <span className="font-semibold">{formatPrice(totalPagado)}</span>
                                        </div>
                                        {isComplete ? (
                                            <div className="flex justify-between items-center text-green-600 bg-green-100/50 p-3 rounded-xl border border-green-200">
                                                <span className="font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> ¡Pago Completado!</span>
                                                {vuelto > 0 && <span className="font-bold text-sm">Vuelto: {formatPrice(vuelto)}</span>}
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center text-red-600 text-lg font-bold">
                                                <span>Faltante:</span>
                                                <span>{formatPrice(faltante)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleConfirm}
                                        disabled={loading || !isComplete}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Procesando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-6 h-6" />
                                                <span>Confirmar e Imprimir</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
