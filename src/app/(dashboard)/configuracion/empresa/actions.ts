'use server';

import { createClient } from '@/lib/supabase/server';
import { EmpresaConfig } from '@/types';
import { revalidatePath } from 'next/cache';

const DEFAULT_CONFIG: EmpresaConfig = {
    nombre: 'Mi Negocio',
    direccion: 'Dirección del Local',
    telefono: '',
    cuit: '',
    email: '',
    mensaje_ticket: '¡Gracias por su compra!',
};

export async function getEmpresaConfig(): Promise<EmpresaConfig> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('configuracion')
            .select('*')
            .single();

        if (error) {
            // Si el error es que no hay filas (PGRST116), la tabla no existe (42P01) o no está en caché (PGRST205)
            if (error.code === 'PGRST116' || error.code === '42P01' || error.code === 'PGRST205') {
                return DEFAULT_CONFIG;
            }
            console.error('Error fetching config:', JSON.stringify(error, null, 2));
            return DEFAULT_CONFIG;
        }

        return data as EmpresaConfig;
    } catch (error) {
        console.error('Unexpected error fetching config:', error);
        return DEFAULT_CONFIG;
    }
}

export async function saveEmpresaConfig(config: EmpresaConfig) {
    const supabase = await createClient();

    try {
        // Intentamos obtener el ID existente si hay uno, o asumimos que solo habrá una fila
        const { data: existing } = await supabase
            .from('configuracion')
            .select('id')
            .single();

        const dataToSave = {
            ...config,
            updated_at: new Date().toISOString(),
        };

        let error;

        if (existing) {
            const { error: updateError } = await supabase
                .from('configuracion')
                .update(dataToSave)
                .eq('id', existing.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('configuracion')
                .insert(dataToSave);
            error = insertError;
        }

        if (error) throw error;

        revalidatePath('/configuracion/empresa');
        return { success: true };
    } catch (error) {
        console.error('Error saving config:', error);
        return { success: false, error: 'Error al guardar la configuración' };
    }
}
