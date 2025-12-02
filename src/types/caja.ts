export type TipoMovimiento = 'INGRESO' | 'EGRESO';

export interface CajaMovimiento {
    id: string;
    fecha: Date;
    tipo: TipoMovimiento;
    monto: number;
    descripcion: string;
    usuario: string; // Nombre del usuario que registró el movimiento
}

export interface CajaEstado {
    abierta: boolean;
    saldoInicial: number;
    totalIngresos: number;
    totalEgresos: number;
    saldoActual: number;
    fechaApertura?: Date;
    fechaCierre?: Date;
}

export interface CajaSesion extends CajaEstado {
    id: string;
    movimientos: CajaMovimiento[];
}
