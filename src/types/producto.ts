export interface Producto {
  id: string;
  codigo: string;
  codigo_barra?: string; // SKU del proveedor para lector de código
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  proveedor_id?: string;
  proveedor?: string;
  activo: boolean;
  units_per_pack?: number;
  created_at: string;
  updated_at: string;
}
