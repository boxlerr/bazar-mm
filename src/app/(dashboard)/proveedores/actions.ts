'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Proveedor } from '@/types/proveedor';

export async function obtenerProveedores() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('activo', true)
        .order('nombre');

    if (error) {
        console.error('Error al obtener proveedores:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data: data as Proveedor[] };
}

export async function crearProveedor(data: Partial<Proveedor>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('proveedores')
        .insert({
            ...data,
            activo: true
        });

    if (error) {
        console.error('Error al crear proveedor:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/proveedores');
    return { success: true };
}

export async function actualizarProveedor(id: string, data: Partial<Proveedor>) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('proveedores')
        .update(data)
        .eq('id', id);

    if (error) {
        console.error('Error al actualizar proveedor:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/proveedores');
    return { success: true };
}

export async function eliminarProveedor(id: string) {
    const supabase = await createClient();

    // Soft delete
    const { error } = await supabase
        .from('proveedores')
        .update({ activo: false })
        .eq('id', id);

    if (error) {
        console.error('Error al eliminar proveedor:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/proveedores');
    return { success: true };
}
