'use server';

import { createClient } from '@/lib/supabase/server';
import { Usuario, PERMISOS_POR_ROL } from '@/types/usuario';
import { revalidatePath } from 'next/cache';

export async function obtenerUsuarios() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nombre');

    if (error) throw error;
    
    return { success: true, data: data as Usuario[] };
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error);
    return { success: false, error: error.message };
  }
}

export async function obtenerUsuarioPorId(id: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return { success: true, data: data as Usuario };
  } catch (error: any) {
    console.error('Error al obtener usuario:', error);
    return { success: false, error: error.message };
  }
}

export async function crearUsuario(usuario: Partial<Usuario>) {
  try {
    const supabase = await createClient();

    // Asignar permisos según el rol
    const permisos = usuario.rol ? PERMISOS_POR_ROL[usuario.rol] : PERMISOS_POR_ROL.vendedor;

    const nuevoUsuario = {
      email: usuario.email,
      nombre: usuario.nombre,
      telefono: usuario.telefono || null,
      avatar: usuario.avatar || null,
      rol: usuario.rol || 'vendedor',
      permisos: permisos,
      activo: usuario.activo !== undefined ? usuario.activo : true,
    };

    const { data, error } = await supabase
      .from('usuarios')
      .insert([nuevoUsuario])
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/usuarios');
    return { success: true, data: data as Usuario };
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    return { success: false, error: error.message };
  }
}

export async function actualizarUsuario(id: string, usuario: Partial<Usuario>) {
  try {
    const supabase = await createClient();

    // Si cambia el rol, actualizar permisos
    let permisos = usuario.permisos;
    if (usuario.rol && !usuario.permisos) {
      permisos = PERMISOS_POR_ROL[usuario.rol];
    }

    const usuarioActualizado = {
      email: usuario.email,
      nombre: usuario.nombre,
      telefono: usuario.telefono,
      avatar: usuario.avatar,
      rol: usuario.rol,
      permisos: permisos,
      activo: usuario.activo,
      updated_at: new Date().toISOString(),
    };

    // Eliminar campos undefined
    Object.keys(usuarioActualizado).forEach(key => {
      if (usuarioActualizado[key as keyof typeof usuarioActualizado] === undefined) {
        delete usuarioActualizado[key as keyof typeof usuarioActualizado];
      }
    });

    const { data, error } = await supabase
      .from('usuarios')
      .update(usuarioActualizado)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/usuarios');
    return { success: true, data: data as Usuario };
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    return { success: false, error: error.message };
  }
}

export async function eliminarUsuario(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    return { success: false, error: error.message };
  }
}

export async function cambiarEstadoUsuario(id: string, activo: boolean) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('usuarios')
      .update({ activo, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/usuarios');
    return { success: true, data: data as Usuario };
  } catch (error: any) {
    console.error('Error al cambiar estado del usuario:', error);
    return { success: false, error: error.message };
  }
}

export async function actualizarPermisosUsuario(id: string, permisos: Usuario['permisos']) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('usuarios')
      .update({ permisos, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/usuarios');
    return { success: true, data: data as Usuario };
  } catch (error: any) {
    console.error('Error al actualizar permisos:', error);
    return { success: false, error: error.message };
  }
}
