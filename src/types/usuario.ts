export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'vendedor' | 'gerente';
  activo: boolean;
  created_at: string;
  updated_at: string;
}
