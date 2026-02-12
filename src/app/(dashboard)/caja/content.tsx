'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CajaStats from '@/components/caja/CajaStats';
import CajaActions from '@/components/caja/CajaActions';
import MovimientosList from '@/components/caja/MovimientosList';
import CajaModal from '@/components/caja/CajaModal';
import { CajaEstado, CajaMovimiento } from '@/types';
import { getCajaState, getMovimientos, abrirCaja, cerrarCaja, registrarMovimiento } from './actions';
import { toast } from 'sonner';

const INITIAL_STATE: CajaEstado = {
    abierta: false,
    saldoInicial: 0,
    totalIngresos: 0,
    totalEgresos: 0,
    saldoActual: 0,
};

export default function CajaContent() {
    const [estado, setEstado] = useState<CajaEstado>(INITIAL_STATE);
    const [movimientos, setMovimientos] = useState<CajaMovimiento[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'ABRIR' | 'CERRAR' | 'INGRESO' | 'EGRESO'>('ABRIR');
    const [loading, setLoading] = useState(true);
    const [cajaId, setCajaId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const caja = await getCajaState();

            if (caja) {
                setCajaId(caja.id);
                setEstado({
                    abierta: true,
                    saldoInicial: caja.saldo_inicial,
                    totalIngresos: caja.totalIngresos,
                    totalEgresos: caja.totalEgresos,
                    saldoActual: caja.saldoActual,
                    fechaApertura: new Date(caja.fecha_apertura),
                });

                const movs = await getMovimientos(caja.id);
                setMovimientos(movs.map((m: any) => ({
                    id: m.id,
                    fecha: new Date(m.created_at),
                    tipo: m.tipo.toUpperCase(),
                    monto: m.monto,
                    descripcion: m.concepto + (m.ventas ? ` (Ticket #${m.ventas.nro_ticket})` : ''),
                    usuario: 'Usuario' // Idealmente traer nombre
                })));
            } else {
                setEstado(INITIAL_STATE);
                setMovimientos([]);
                setCajaId(null);
            }
        } catch (error) {
            console.error('Error loading caja data:', error);
            toast.error('Error al cargar datos de caja');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (type: 'ABRIR' | 'CERRAR' | 'INGRESO' | 'EGRESO') => {
        setModalType(type);
        setModalOpen(true);
    };

    const handleModalSubmit = async (data: any) => {
        try {
            let result;

            if (modalType === 'ABRIR') {
                result = await abrirCaja(data.monto);
            } else if (modalType === 'CERRAR') {
                if (!cajaId) return;
                // Use calculated saldoActual instead of user input (which is missing/NaN)
                result = await cerrarCaja(cajaId, estado.saldoActual, data.descripcion || '');
            } else {
                if (!cajaId) return;
                result = await registrarMovimiento(
                    cajaId,
                    modalType === 'INGRESO' ? 'ingreso' : 'egreso',
                    data.monto,
                    data.descripcion
                );
            }

            if (result.success) {
                toast.success('Operación realizada con éxito');
                await loadData(); // Recargar datos frescos
                setModalOpen(false);
            } else {
                toast.error(result.error || 'Error al realizar la operación');
            }
        } catch (error) {
            console.error('Error submitting modal:', error);
            toast.error('Ocurrió un error inesperado');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-900">Control de Caja</h1>
                <p className="text-gray-500 mt-2">Gestiona los movimientos diarios de efectivo</p>
            </motion.div>

            <CajaStats estado={estado} />

            <CajaActions
                cajaAbierta={estado.abierta}
                onAbrirCaja={() => handleOpenModal('ABRIR')}
                onCerrarCaja={() => handleOpenModal('CERRAR')}
                onNuevoIngreso={() => handleOpenModal('INGRESO')}
                onNuevoEgreso={() => handleOpenModal('EGRESO')}
            />

            <MovimientosList movimientos={movimientos} />

            <CajaModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={
                    modalType === 'ABRIR' ? 'Apertura de Caja' :
                        modalType === 'CERRAR' ? 'Cierre de Caja' :
                            modalType === 'INGRESO' ? 'Registrar Ingreso' :
                                'Registrar Egreso'
                }
                type={modalType}
                onSubmit={handleModalSubmit}
            />
        </div>
    );
}
