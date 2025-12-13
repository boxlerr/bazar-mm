export interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  dni?: string;
  direccion?: string;
  saldo_cuenta_corriente: number;
  limite_credito?: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MovimientoCuentaCorriente {
  id: string;
  cliente_id: string;
  tipo: 'debito' | 'credito';
  monto: number;
  descripcion: string;
  venta_id?: string;
  created_at: string;
}
