'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Truck, Filter, MapPin, Phone, FileText } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Proveedor } from '@/types/proveedor';
import { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from './actions';
import Modal from '@/components/ui/Modal';
import ProveedorForm from './components/ProveedorForm';
import ProveedoresTable from './components/ProveedoresTable';

export default function ProveedoresPage() {
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [modalAbierto, setModalAbierto] = useState(false);
    const [proveedorEditar, setProveedorEditar] = useState<Proveedor | null>(null);
    const [procesando, setProcesando] = useState(false);

    const { success, error } = useToast();

    const cargarData = async () => {
        setCargando(true);
        const res = await obtenerProveedores();
        if (res.success && res.data) {
            setProveedores(res.data);
        } else {
            error('No se pudieron cargar los proveedores');
        }
        setCargando(false);
    };

    useEffect(() => {
        cargarData();
    }, []);

    const handleGuardar = async (data: Partial<Proveedor>) => {
        setProcesando(true);
        let res;

        if (proveedorEditar) {
            res = await actualizarProveedor(proveedorEditar.id, data);
        } else {
            res = await crearProveedor(data);
        }

        if (res.success) {
            success(proveedorEditar ? 'Proveedor actualizado' : 'Proveedor creado');
            setModalAbierto(false);
            setProveedorEditar(null);
            cargarData();
        } else {
            error(res.error || 'Error al guardar');
        }
        setProcesando(false);
    };

    const handleEliminar = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este proveedor?')) return;

        const res = await eliminarProveedor(id);
        if (res.success) {
            success('Proveedor eliminado');
            cargarData();
        } else {
            error(res.error || 'Error al eliminar');
        }
    };

    const proveedoresFiltrados = proveedores.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.razon_social?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.cuit?.includes(busqueda)
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="bg-orange-50 p-2.5 rounded-xl">
                            <Truck className="w-8 h-8 text-orange-600" />
                        </div>
                        Proveedores
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Gestión de compras y cadena de suministro
                    </p>
                </div>
                <button
                    onClick={() => {
                        setProveedorEditar(null);
                        setModalAbierto(true);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20 font-medium"
                >
                    <Plus size={20} />
                    <span>Nuevo Proveedor</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                        <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Proveedores</p>
                        <p className="text-2xl font-bold text-gray-900">{proveedores.length}</p>
                    </div>
                </div>
                {/* Add more stats if available later */}
            </div>

            {/* Filtros y Búsqueda */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, razón social o CUIT..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                </div>
            </div>

            {/* Tabla */}
            {cargando ? (
                <div className="py-20 text-center text-gray-500">Cargando proveedores...</div>
            ) : (
                <ProveedoresTable
                    proveedores={proveedoresFiltrados}
                    onEdit={(p) => {
                        setProveedorEditar(p);
                        setModalAbierto(true);
                    }}
                    onDelete={(id) => handleEliminar(id)}
                />
            )}

            <Modal
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                title={proveedorEditar ? "Editar Proveedor" : "Nuevo Proveedor"}
            >
                <ProveedorForm
                    initialData={proveedorEditar || undefined}
                    onSubmit={handleGuardar}
                    onCancel={() => setModalAbierto(false)}
                    loading={procesando}
                />
            </Modal>
        </div>
    );
}
