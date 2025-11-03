export interface Venta {
  id: string;
  cliente_id?: string;
  usuario_id: string;
  total: number;
  subtotal: number;
  iva: number;
  descuento?: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente';
  estado: 'pendiente' | 'completada' | 'cancelada';
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface VentaItem {
  id: string;
  venta_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
}
