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
