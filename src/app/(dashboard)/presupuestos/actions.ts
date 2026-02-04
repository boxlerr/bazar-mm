'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Presupuesto } from '@/types/presupuesto';

export async function createBudget(budgetData: {
    cliente_id?: string;
    items: { producto_id?: string; nombre: string; cantidad: number; precio_unitario: number }[];
    subtotal: number;
    total: number;
    descuento?: number;
    observaciones?: string;
}) {
    const supabase = await createClient();

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error('No se pudo autenticar al usuario');
        }

        // 1. Crear el presupuesto header
        const { data: presupuesto, error: presupuestoError } = await supabase
            .from('presupuestos')
            .insert({
                cliente_id: budgetData.cliente_id,
                usuario_id: user.id,
                subtotal: budgetData.subtotal,
                total: budgetData.total,
                descuento: budgetData.descuento || 0,
                observaciones: budgetData.observaciones,
                estado: 'pendiente'
            })
            .select('*, clientes(nombre), usuarios(nombre)')
            .single();

        if (presupuestoError) {
            console.error('Error creating budget:', presupuestoError);
            throw new Error(`Error al crear presupuesto: ${presupuestoError.message}`);
        }

        // 2. Insertar items
        const itemsData = budgetData.items.map((item) => ({
            presupuesto_id: presupuesto.id,
            producto_id: item.producto_id || null,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.cantidad * item.precio_unitario,
        }));

        const { error: itemsError } = await supabase
            .from('presupuesto_items')
            .insert(itemsData);

        if (itemsError) {
            console.error('Error creating budget items:', itemsError);
            // Intentar limpiar el presupuesto si fallan los items
            await supabase.from('presupuestos').delete().eq('id', presupuesto.id);
            throw new Error(`Error al crear items del presupuesto: ${itemsError.message}`);
        }

        revalidatePath('/presupuestos');
        return { success: true, presupuesto };
    } catch (error: any) {
        console.error('Error processing budget:', error);
        return { success: false, error: error.message };
    }
}

export async function getBudgets() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('presupuestos')
        .select(`
      *,
      clientes (nombre),
      usuarios (nombre),
      presupuesto_items (
        nombre,
        cantidad,
        precio_unitario,
        productos (nombre, codigo)
      )
    `)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching budgets:', error);
        return [];
    }

    return data as Presupuesto[];
}

export async function deleteBudget(id: string) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('presupuestos')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/presupuestos');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting budget:', error);
        return { success: false, error: error.message };
    }
}

export async function updateBudgetStatus(id: string, estado: 'pendiente' | 'convertido' | 'cancelado') {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('presupuestos')
            .update({ estado })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/presupuestos');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating budget status:', error);
        return { success: false, error: error.message };
    }
}
export async function updateBudgetObservation(id: string, observaciones: string) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('presupuestos')
            .update({ observaciones })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/presupuestos');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating budget observation:', error);
        return { success: false, error: error.message };
    }
}
