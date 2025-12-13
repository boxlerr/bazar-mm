'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowRightLeft, Search, Save, History } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Producto } from '@/types/producto';
import { MotivoAjuste, registrarAjuste, obtenerHistorialMovimientos } from './actions';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AjustesStockPage() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [busqueda, setBusqueda] = useState('');
    const [cantidad, setCantidad] = useState<string>('');
    const [tipo, setTipo] = useState<'entrada' | 'salida'>('entrada');
    const [motivo, setMotivo] = useState<MotivoAjuste>('inventario');
    const [observaciones, setObservaciones] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [historial, setHistorial] = useState<any[]>([]);

    const { success, error } = useToast();

    // Cargar productos para el buscador
    useEffect(() => {
        const loadProductos = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('productos').select('*').order('nombre');
            if (data) setProductos(data);
        };
        loadProductos();
    }, []);

    const handleSearch = (term: string) => {
        setBusqueda(term);
        // Reset selection if manipulating search directly? 
        // Better to separate search input from selection display
    };

    const selectProducto = async (producto: Producto) => {
        setProductoSeleccionado(producto);
        setBusqueda(''); // Clear search to show clean UI
        setHistorial([]);
        const movs = await obtenerHistorialMovimientos(producto.id);
        setHistorial(movs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productoSeleccionado) return;
        if (!cantidad || Number(cantidad) <= 0) {
            error('Ingrese una cantidad válida');
            return;
        }

        setProcesando(true);
        const res = await registrarAjuste(
            productoSeleccionado.id,
            Number(cantidad),
            motivo,
            observaciones,
            tipo
        );

        if (res.success) {
            success('Ajuste registrado correctamente');
            setCantidad('');
            setObservaciones('');
            // Recargar historial y producto actualizadisimo
            const supabase = createClient();
            const { data } = await supabase.from('productos').select('*').eq('id', productoSeleccionado.id).single();
            if (data) setProductoSeleccionado(data);

            const movs = await obtenerHistorialMovimientos(productoSeleccionado.id);
            setHistorial(movs);
        } else {
            error(res.error || 'Generando ajuste');
        }
        setProcesando(false);
    };

    const productosFiltrados = busqueda
        ? productos.filter(p =>
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.codigo.toLowerCase().includes(busqueda.toLowerCase())
        ).slice(0, 5)
        : [];

    return (
        <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="bg-purple-50 p-2.5 rounded-xl">
                            <ArrowRightLeft className="w-8 h-8 text-purple-600" />
                        </div>
                        Ajuste Manual de Stock
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Registrar ingresos o egresos manuales (roturas, inventario, etc.)
                    </p>
                </div>

                {/* Seleccionador de Producto */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Producto</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o código..."
                            value={productoSeleccionado ? productoSeleccionado.nombre : busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setProductoSeleccionado(null); // Deseleccionar al escribir
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                        />
                        {/* Dropdown de resultados */}
                        {busqueda && !productoSeleccionado && productosFiltrados.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                {productosFiltrados.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => selectProducto(p)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div className="font-medium text-gray-900">{p.nombre}</div>
                                        <div className="text-xs text-gray-500 flex justify-between">
                                            <span>Cod: {p.codigo}</span>
                                            <span className={`font-semibold ${p.stock_actual <= p.stock_minimo ? 'text-red-500' : 'text-green-600'}`}>
                                                Stock: {p.stock_actual}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {productoSeleccionado && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 pt-6 border-t border-gray-100"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Stock Actual</p>
                                    <p className="text-3xl font-bold text-gray-900">{productoSeleccionado.stock_actual}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Precio Costo</p>
                                    <p className="text-xl font-medium text-gray-700">${productoSeleccionado.precio_costo}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Ajuste</label>
                                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setTipo('entrada')}
                                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${tipo === 'entrada' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                Entrada
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTipo('salida')}
                                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${tipo === 'salida' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                Salida
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={cantidad}
                                            onChange={(e) => setCantidad(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
                                    <select
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value as MotivoAjuste)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                    >
                                        <option value="inventario">Ajuste de Inventario</option>
                                        <option value="rotura">Rotura / Daño</option>
                                        <option value="perdida">Pérdida / Robo</option>
                                        <option value="regalo">Regalo / Bonificación</option>
                                        <option value="actualizacion">Actualización de Sistema</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                                    <textarea
                                        value={observaciones}
                                        onChange={(e) => setObservaciones(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none"
                                        placeholder="Detalles adicionales..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={procesando}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {procesando ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save size={20} />
                                    )}
                                    <span>Confirmar Ajuste</span>
                                </button>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Panel Derecho: Historial */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col h-full">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <History size={20} className="text-gray-500" />
                    Historial de Movimientos
                </h3>

                {!productoSeleccionado ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center p-8">
                        <Package size={48} className="mb-3 opacity-20" />
                        <p>Selecciona un producto para ver su historial completo de movimientos.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {historial.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No hay movimientos registrados.</p>
                        ) : (
                            historial.map((mov, idx) => (
                                <div key={`${mov.tipo}-${mov.id}-${idx}`} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${mov.tipo === 'venta' ? 'bg-green-100 text-green-700' :
                                                    mov.tipo === 'compra' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-purple-100 text-purple-700'
                                                }`}>
                                                {mov.tipo}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {format(new Date(mov.fecha), "d MMM yyyy, HH:mm", { locale: es })}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">{mov.descripcion}</p>
                                    </div>
                                    <div className={`text-lg font-bold ${mov.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {mov.cantidad > 0 ? '+' : ''}{mov.cantidad}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
