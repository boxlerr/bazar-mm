'use client';

import { Proveedor } from '@/types/proveedor';
import { Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProveedoresTableProps {
    proveedores: Proveedor[];
    onEdit: (proveedor: Proveedor) => void;
    onDelete: (id: string) => void;
}

export default function ProveedoresTable({ proveedores, onEdit, onDelete }: ProveedoresTableProps) {
    if (proveedores.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No hay proveedores registrados</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Condición IVA</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {proveedores.map((proveedor) => (
                            <motion.tr
                                key={proveedor.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-semibold text-gray-900">{proveedor.nombre}</div>
                                        {proveedor.razon_social && proveedor.razon_social !== proveedor.nombre && (
                                            <div className="text-xs text-gray-500">{proveedor.razon_social}</div>
                                        )}
                                        <div className="text-xs text-gray-400 mt-0.5">CUIT: {proveedor.cuit || 'N/A'}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
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
                                <td className="px-6 py-4">
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
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${proveedor.condicion_iva === 'RI' ? 'bg-blue-50 text-blue-700' :
                                            proveedor.condicion_iva === 'Monotributo' ? 'bg-green-50 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {proveedor.condicion_iva || 'S/D'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
