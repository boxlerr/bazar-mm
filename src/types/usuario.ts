export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  telefono?: string;
  dni?: string;
  domicilio?: string;
  avatar?: string;
  rol: 'admin' | 'vendedor' | 'gerente';
  permisos: PermisosUsuario;
  activo: boolean;
  ultimo_acceso?: string;
  created_at: string;
  updated_at: string;
}

export interface PermisosUsuario {
  ventas: {
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    ver: boolean;
  };
  compras: {
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    ver: boolean;
  };
  productos: {
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    ver: boolean;
  };
  clientes: {
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    ver: boolean;
  };
  reportes: {
    ver: boolean;
    exportar: boolean;
  };
  configuracion: {
    acceder: boolean;
  };
  usuarios: {
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    ver: boolean;
  };
}

export const PERMISOS_POR_ROL: Record<Usuario['rol'], PermisosUsuario> = {
  admin: {
    ventas: { crear: true, editar: true, eliminar: true, ver: true },
    compras: { crear: true, editar: true, eliminar: true, ver: true },
    productos: { crear: true, editar: true, eliminar: true, ver: true },
    clientes: { crear: true, editar: true, eliminar: true, ver: true },
    reportes: { ver: true, exportar: true },
    configuracion: { acceder: true },
    usuarios: { crear: true, editar: true, eliminar: true, ver: true },
  },
  gerente: {
    ventas: { crear: true, editar: true, eliminar: false, ver: true },
    compras: { crear: true, editar: true, eliminar: false, ver: true },
    productos: { crear: true, editar: true, eliminar: false, ver: true },
    clientes: { crear: true, editar: true, eliminar: false, ver: true },
    reportes: { ver: true, exportar: true },
    configuracion: { acceder: false },
    usuarios: { crear: false, editar: false, eliminar: false, ver: true },
  },
  vendedor: {
    ventas: { crear: true, editar: false, eliminar: false, ver: true },
    compras: { crear: false, editar: false, eliminar: false, ver: false },
    productos: { crear: false, editar: false, eliminar: false, ver: true },
    clientes: { crear: true, editar: true, eliminar: false, ver: true },
    reportes: { ver: false, exportar: false },
    configuracion: { acceder: false },
    usuarios: { crear: false, editar: false, eliminar: false, ver: false },
  },
};
