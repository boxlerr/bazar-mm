export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  proveedor?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}
