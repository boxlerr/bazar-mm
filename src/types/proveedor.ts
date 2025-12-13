export interface Proveedor {
    id: string;
    nombre: string;
    razon_social?: string;
    cuit?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    provincia?: string;
    pais?: string;
    condicion_iva?: 'RI' | 'Monotributo' | 'Exento' | 'CF' | 'No Responsable';
    observaciones?: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
}
