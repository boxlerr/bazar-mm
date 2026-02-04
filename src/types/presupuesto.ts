export interface Presupuesto {
    id: string;
    cliente_id?: string;
    usuario_id: string;
    subtotal: number;
    total: number;
    descuento: number;
    estado: 'pendiente' | 'convertido' | 'cancelado';
    observaciones?: string;
    nro_presupuesto: number;
    created_at: string;
    // Relations
    clientes?: { nombre: string };
    usuarios?: { nombre: string };
    presupuesto_items?: PresupuestoItem[];
}

export interface PresupuestoItem {
    id: string;
    presupuesto_id: string;
    producto_id?: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    created_at: string;
    // Relations
    productos?: { nombre: string; codigo: string };
}
