'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function crearCliente(formData: FormData) {
  const supabase = createServerComponentClient({ cookies });

  const clienteData = {
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    telefono: formData.get('telefono'),
    dni: formData.get('dni'),
    direccion: formData.get('direccion'),
  };

  const { error } = await supabase.from('clientes').insert(clienteData);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/clientes');
  return { success: true };
}

export async function actualizarCliente(id: string, formData: FormData) {
  const supabase = createServerComponentClient({ cookies });

  const clienteData = {
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    telefono: formData.get('telefono'),
    dni: formData.get('dni'),
    direccion: formData.get('direccion'),
  };

  const { error } = await supabase
    .from('clientes')
    .update(clienteData)
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/clientes');
  return { success: true };
}
