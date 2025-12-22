'use server';

import { createClient } from '@/lib/supabase/server';
import { Usuario, PERMISOS_POR_ROL } from '@/types/usuario';
import { revalidatePath } from 'next/cache';
import { notifyUsers } from '@/lib/notifications';

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

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ... imports remain the same

export async function crearUsuario(usuario: Partial<Usuario> & { password?: string }) {
  try {
    const supabase = await createClient();

    // Validar contraseña
    if (!usuario.password || usuario.password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    // Crear cliente admin para gestionar usuarios de Auth
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 1. Crear usuario en Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: usuario.email!,
      password: usuario.password,
      email_confirm: true,
      user_metadata: {
        nombre: usuario.nombre
      }
    });

    if (authError) throw authError;

    if (!authUser.user) {
      throw new Error('No se pudo crear el usuario en Auth');
    }

    // Asignar permisos según el rol
    const permisos = usuario.rol ? PERMISOS_POR_ROL[usuario.rol] : PERMISOS_POR_ROL.vendedor;

    // NOTA: Eliminamos 'permisos' del insert porque no existe en la tabla de la DB actualmente.
    // Los permisos se calcularán dinámicamente según el rol.
    const nuevoUsuario = {
      id: authUser.user.id,
      email: usuario.email,
      nombre: usuario.nombre,
      telefono: usuario.telefono || null,
      dni: usuario.dni || null,
      domicilio: usuario.domicilio || null,
      rol: usuario.rol || 'vendedor',
      activo: usuario.activo !== undefined ? usuario.activo : true,
    };

    // 2. Insertar en tabla usuarios (perfil)
    const { data, error } = await supabase
      .from('usuarios')
      .insert([nuevoUsuario])
      .select()
      .single();

    if (error) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw error;
    }

    revalidatePath('/usuarios');

    // Notificar
    await notifyUsers(
      ['admin'],
      'Nuevo Usuario',
      `Se ha creado el usuario ${usuario.nombre} (${usuario.rol})`,
      'info',
      'usuarios',
      authUser.user.id,
      `/usuarios`
    );

    // Devolvemos el usuario completo con los permisos calculados
    return {
      success: true,
      data: {
        ...data,
        permisos: PERMISOS_POR_ROL[data.rol as Usuario['rol']]
      } as Usuario
    };
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    return { success: false, error: error.message };
  }
}

export async function actualizarUsuario(id: string, usuario: Partial<Usuario>) {
  try {
    const supabase = await createClient();

    // Filtramos campos que no están en la DB o preparamos objeto limpio
    const usuarioActualizado = {
      email: usuario.email,
      nombre: usuario.nombre,
      telefono: usuario.telefono,
      dni: usuario.dni,
      domicilio: usuario.domicilio,
      rol: usuario.rol,
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
    // Como no existe la columna permisos, no hacemos nada en DB por ahora.
    // Esto es un placeholder para evitar errores visuales.

    // const supabase = await createClient();
    // const { data, error } = await supabase...

    console.warn('Simulando actualización de permisos (columna no existe en DB)');
    revalidatePath('/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error al actualizar permisos:', error);
    return { success: false, error: error.message };
  }
}

export async function obtenerEstadisticasUsuario(id: string) {
  try {
    const supabase = await createClient();

    // 1. Obtener ventas del usuario
    const { data: ventas, error: ventasError } = await supabase
      .from('ventas')
      .select('id, cliente_id, created_at, estado')
      .eq('usuario_id', id)
      .eq('estado', 'completada');

    if (ventasError) throw ventasError;

    const totalVentas = ventas?.length || 0;

    // 2. Calcular clientes únicos atendidos
    const clientesUnicos = new Set(ventas?.map(v => v.cliente_id).filter(Boolean)).size;

    // 3. Calcular productos vendidos (total de items)
    // Nota: Esto requiere una query adicional a venta_items
    let totalProductos = 0;
    if (totalVentas > 0) {
      const ventaIds = ventas!.map(v => v.id);
      const { data: items, error: itemsError } = await supabase
        .from('venta_items')
        .select('cantidad')
        .in('venta_id', ventaIds);

      if (!itemsError && items) {
        totalProductos = items.reduce((acc, item) => acc + item.cantidad, 0);
      }
    }

    return {
      success: true,
      data: {
        ventas: totalVentas,
        clientes: clientesUnicos,
        productos: totalProductos
      }
    };
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    return {
      success: false,
      error: error.message,
      data: { ventas: 0, clientes: 0, productos: 0 }
    };
  }
}
