export interface EmpresaConfig {
    id?: string;
    nombre: string;
    direccion: string;
    telefono: string;
    cuit: string;
    email: string;
    mensaje_ticket: string;
    updated_at?: string;
}

export interface NotificacionesConfig {
    id?: string;
    alertas_stock: boolean;
    stock_minimo_global: number;
    alertas_ventas: boolean;
    email_notificaciones: string;
    updated_at?: string;
}
