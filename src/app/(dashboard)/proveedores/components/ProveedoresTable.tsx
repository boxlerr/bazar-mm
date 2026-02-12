'use client';
import { useState, Fragment } from 'react';
import { Proveedor } from '@/types/proveedor';
import { Edit2, Trash2, Phone, Mail, MapPin, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getComprasByProveedor } from '../actions';
import Link from 'next/link';

interface ProveedoresTableProps {
    proveedores: Proveedor[];
    onEdit: (proveedor: Proveedor) => void;
    onDelete: (id: string) => void;
}

export default function ProveedoresTable({ proveedores, onEdit, onDelete }: ProveedoresTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [compras, setCompras] = useState<Record<string, any[]>>({});
    const [loadingCompras, setLoadingCompras] = useState<Record<string, boolean>>({});

    const toggleExpand = async (proveedorId: string) => {
        if (expandedId === proveedorId) {
            setExpandedId(null);
            return;
        }

        setExpandedId(proveedorId);

        if (!compras[proveedorId]) {
            setLoadingCompras(prev => ({ ...prev, [proveedorId]: true }));
            const data = await getComprasByProveedor(proveedorId);
            setCompras(prev => ({ ...prev, [proveedorId]: data }));
            setLoadingCompras(prev => ({ ...prev, [proveedorId]: false }));
        }
    };

    if (proveedores.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No hay proveedores registrados</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="w-10"></th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Condición IVA</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {proveedores.map((proveedor) => (
                                <Fragment key={proveedor.id}>
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${expandedId === proveedor.id ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => toggleExpand(proveedor.id)}
                                    >
                                        <td className="px-4 py-4 text-gray-400">
                                            {expandedId === proveedor.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-semibold text-gray-900">{proveedor.nombre}</div>
                                                {proveedor.razon_social && proveedor.razon_social !== proveedor.nombre && (
                                                    <div className="text-xs text-gray-500">{proveedor.razon_social}</div>
                                                )}
                                                <div className="text-xs text-gray-400 mt-0.5">CUIT: {proveedor.cuit || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                {proveedor.email && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Mail size={14} className="mr-2 text-gray-400" />
                                                        {proveedor.email}
                                                    </div>
                                                )}
                                                {proveedor.telefono && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Phone size={14} className="mr-2 text-gray-400" />
                                                        {proveedor.telefono}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {(proveedor.direccion || proveedor.ciudad) ? (
                                                <div className="flex items-start text-sm text-gray-600">
                                                    <MapPin size={14} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                                                    <span>
                                                        {proveedor.direccion}
                                                        {proveedor.direccion && proveedor.ciudad && ', '}
                                                        {proveedor.ciudad}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${proveedor.condicion_iva === 'RI' ? 'bg-blue-50 text-blue-700' :
                                                    proveedor.condicion_iva === 'Monotributo' ? 'bg-green-50 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {proveedor.condicion_iva || 'S/D'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => onEdit(proveedor)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(proveedor.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                    <AnimatePresence>
                                        {expandedId === proveedor.id && (
                                            <motion.tr
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <td colSpan={6} className="bg-gray-50/50 px-4 py-3 border-t border-gray-100">
                                                    <div className="pl-10">
                                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Historial de Compras</h4>
                                                        {loadingCompras[proveedor.id] ? (
                                                            <div className="text-sm text-gray-500">Cargando compras...</div>
                                                        ) : compras[proveedor.id]?.length > 0 ? (
                                                            <div className="grid gap-3">
                                                                {compras[proveedor.id].map((compra) => (
                                                                    <Link
                                                                        key={compra.id}
                                                                        href={`/compras/${compra.id}`}
                                                                        className="block bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <div>
                                                                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                                                                    Orden #{compra.numero_orden || 'S/N'}
                                                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${compra.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                                                        }`}>
                                                                                        {compra.estado}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 mt-1">
                                                                                    {new Date(compra.created_at).toLocaleDateString()} • {compra.metodo_pago}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="text-right">
                                                                                    <div className="font-bold text-gray-900">
                                                                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(compra.total)}
                                                                                    </div>
                                                                                </div>
                                                                                <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-500 italic">No hay compras registradas para este proveedor.</div>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
                {proveedores.map((proveedor) => (
                    <motion.div
                        key={proveedor.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div
                            className="p-4 cursor-pointer"
                            onClick={() => toggleExpand(proveedor.id)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{proveedor.nombre}</h3>
                                    {proveedor.razon_social && proveedor.razon_social !== proveedor.nombre && (
                                        <p className="text-xs text-gray-500">{proveedor.razon_social}</p>
                                    )}
                                    <p className="text-xs text-gray-400 font-mono mt-1">CUIT: {proveedor.cuit || 'N/A'}</p>
                                </div>
                                <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase
                                    ${proveedor.condicion_iva === 'RI' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                        proveedor.condicion_iva === 'Monotributo' ? 'bg-green-50 text-green-700 border border-green-100' :
                                            'bg-gray-50 text-gray-600 border border-gray-100'
                                    }`}>
                                    {proveedor.condicion_iva || 'S/D'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-3">
                                {(proveedor.email || proveedor.telefono) && (
                                    <div className="flex flex-col gap-1">
                                        {proveedor.telefono && (
                                            <div className="flex items-center">
                                                <Phone size={14} className="mr-2 text-blue-500" />
                                                <span>{proveedor.telefono}</span>
                                            </div>
                                        )}
                                        {proveedor.email && (
                                            <div className="flex items-center">
                                                <Mail size={14} className="mr-2 text-orange-500" />
                                                <span className="truncate">{proveedor.email}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {(proveedor.direccion || proveedor.ciudad) && (
                                    <div className="flex items-start pt-2 border-t border-gray-50">
                                        <MapPin size={14} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                                        <span className="text-xs">
                                            {proveedor.direccion}
                                            {proveedor.direccion && proveedor.ciudad && ', '}
                                            {proveedor.ciudad}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand(proveedor.id);
                                    }}
                                    className="text-xs font-semibold text-blue-600 flex items-center gap-1"
                                >
                                    {expandedId === proveedor.id ? (
                                        <>Ver menos <ChevronUp size={14} /></>
                                    ) : (
                                        <>Ver compras <ChevronDown size={14} /></>
                                    )}
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(proveedor);
                                        }}
                                        className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(proveedor.id);
                                        }}
                                        className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedId === proveedor.id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-gray-50 border-t border-gray-100"
                                >
                                    <div className="p-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Historial Reciente</h4>
                                        {loadingCompras[proveedor.id] ? (
                                            <div className="text-sm text-gray-500 text-center py-2">Cargando...</div>
                                        ) : compras[proveedor.id]?.length > 0 ? (
                                            <div className="space-y-2">
                                                {compras[proveedor.id].map((compra) => (
                                                    <Link
                                                        key={compra.id}
                                                        href={`/compras/${compra.id}`}
                                                        className="block bg-white p-3 rounded-lg border border-gray-200 shadow-sm active:scale-[0.98] transition-all"
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-mono text-xs font-bold text-gray-900">#{compra.numero_orden || 'S/N'}</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${compra.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {compra.estado}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-xs text-gray-500">{new Date(compra.created_at).toLocaleDateString()}</span>
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(compra.total)}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500 italic text-center py-2">Sin compras registradas</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </>
    );
}
