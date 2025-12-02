'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import CajaStats from '@/components/caja/CajaStats';
import CajaActions from '@/components/caja/CajaActions';
import MovimientosList from '@/components/caja/MovimientosList';
import CajaModal from '@/components/caja/CajaModal';
import { CajaEstado, CajaMovimiento } from '@/types';

// Estado inicial simulado
const INITIAL_STATE: CajaEstado = {
  abierta: false,
  saldoInicial: 0,
  totalIngresos: 0,
  totalEgresos: 0,
  saldoActual: 0,
};

export default function CajaPage() {
  const [estado, setEstado] = useState<CajaEstado>(INITIAL_STATE);
  const [movimientos, setMovimientos] = useState<CajaMovimiento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ABRIR' | 'CERRAR' | 'INGRESO' | 'EGRESO'>('ABRIR');

  const handleOpenModal = (type: 'ABRIR' | 'CERRAR' | 'INGRESO' | 'EGRESO') => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleModalSubmit = (data: any) => {
    if (modalType === 'ABRIR') {
      const saldoInicial = data.monto;
      setEstado({
        ...estado,
        abierta: true,
        saldoInicial,
        saldoActual: saldoInicial,
        fechaApertura: new Date(),
      });
    } else if (modalType === 'CERRAR') {
      setEstado({
        ...INITIAL_STATE,
        abierta: false,
        fechaCierre: new Date(),
      });
      setMovimientos([]);
    } else {
      const nuevoMovimiento: CajaMovimiento = {
        id: Math.random().toString(36).substr(2, 9),
        fecha: new Date(),
        tipo: modalType,
        monto: data.monto,
        descripcion: data.descripcion,
        usuario: 'Usuario Actual', // Esto debería venir del contexto de auth
      };

      setMovimientos([nuevoMovimiento, ...movimientos]);

      setEstado(prev => ({
        ...prev,
        totalIngresos: modalType === 'INGRESO' ? prev.totalIngresos + data.monto : prev.totalIngresos,
        totalEgresos: modalType === 'EGRESO' ? prev.totalEgresos + data.monto : prev.totalEgresos,
        saldoActual: modalType === 'INGRESO'
          ? prev.saldoActual + data.monto
          : prev.saldoActual - data.monto,
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
