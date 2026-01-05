export interface Compra {
  id: string;
  proveedor_id: string;
  usuario_id: string;
  numero_orden?: string;
  total: number;
  metodo_pago: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
  observaciones?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CompraItem {
  id: string;
  compra_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
}

export interface ProductoExtraido {
  nombre: string;
  sku?: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
}

export interface PDFParseResult {
  productos: ProductoExtraido[];
  numero_orden?: string;
  fecha?: string;
  total?: number;
  descuento?: number;
  proveedor?: string;
}

export interface CompraFormData {
  proveedor_id: string;
  numero_orden: string;
  metodo_pago: string;
  observaciones: string;
  pdf_file?: File;
  items: CompraItemForm[];
}

export interface CompraItemForm {
  producto_id?: string; // Si existe en BD
  nombre: string;
  sku?: string;
  codigo?: string;
  categoria: string;
  cantidad: number;
  precio_costo: number;
  precio_venta: number;
  es_nuevo: boolean; // Si el producto no existe y hay que crearlo
}
