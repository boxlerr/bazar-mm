// Constantes del sistema

// Nombres de tablas
export const TABLES = {
  USUARIOS: 'usuarios',
  PRODUCTOS: 'productos',
  CLIENTES: 'clientes',
  VENTAS: 'ventas',
  VENTA_ITEMS: 'venta_items',
  COMPRAS: 'compras',
  COMPRA_ITEMS: 'compra_items',
  CAJA: 'caja',
  MOVIMIENTOS_CAJA: 'movimientos_caja',
};

// Roles de usuario
export const ROLES = {
  ADMIN: 'admin',
  VENDEDOR: 'vendedor',
  GERENTE: 'gerente',
};

// Estados de venta
export const VENTA_ESTADOS = {
  PENDIENTE: 'pendiente',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
};

// Métodos de pago
export const METODOS_PAGO = {
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia',
  CUENTA_CORRIENTE: 'cuenta_corriente',
};

// Categorías de productos (ejemplo)
export const CATEGORIAS = [
  'Almacén',
  'Bebidas',
  'Limpieza',
  'Perfumería',
  'Bazar',
  'Otros',
];

// Configuración de paginación
export const ITEMS_PER_PAGE = 20;

// URLs de API
export const API_ENDPOINTS = {
  VENTAS: '/api/ventas',
  CLIENTES: '/api/clientes',
  DOLARHOY: '/api/dolarhoy',
  RESEND: '/api/resend',
};
