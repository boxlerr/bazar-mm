'use server';

import { createClient } from '@/lib/supabase/server';
import { NotificacionesConfig } from '@/types';
import { revalidatePath } from 'next/cache';

const DEFAULT_NOTIF_CONFIG: NotificacionesConfig = {
    alertas_stock: true,
    stock_minimo_global: 5,
    alertas_ventas: false,
    email_notificaciones: '',
};

export async function getNotificacionesConfig(): Promise<NotificacionesConfig> {
    const supabase = await createClient();

    try {
        // Asumimos que usamos la misma tabla 'configuracion' y que tiene estas columnas.
        // Si no, esto fallará y devolveremos default.
        // Idealmente, si la tabla es única para toda la config, hacemos select de todo.
        // Pero para mantenerlo limpio, hacemos select de las columnas específicas si es posible,
        // o select * y mapeamos.
        const { data, error } = await supabase
            .from('configuracion')
            .select('*')
            .single();

        if (error) {
            if (error.code === 'PGRST116') return DEFAULT_NOTIF_CONFIG;
            console.error('Error fetching notif config:', error);
            return DEFAULT_NOTIF_CONFIG;
        }

        // Mapeo seguro por si faltan columnas en BD
        return {
            id: data.id,
            alertas_stock: data.alertas_stock ?? DEFAULT_NOTIF_CONFIG.alertas_stock,
            stock_minimo_global: data.stock_minimo_global ?? DEFAULT_NOTIF_CONFIG.stock_minimo_global,
            alertas_ventas: data.alertas_ventas ?? DEFAULT_NOTIF_CONFIG.alertas_ventas,
            email_notificaciones: data.email_notificaciones ?? DEFAULT_NOTIF_CONFIG.email_notificaciones,
        };
    } catch (error) {
        console.error('Unexpected error fetching notif config:', error);
        return DEFAULT_NOTIF_CONFIG;
    }
}

export async function saveNotificacionesConfig(config: NotificacionesConfig) {
    const supabase = await createClient();

    try {
        const { data: existing } = await supabase
            .from('configuracion')
            .select('id')
            .single();

        const dataToSave = {
            alertas_stock: config.alertas_stock,
            stock_minimo_global: config.stock_minimo_global,
            alertas_ventas: config.alertas_ventas,
            email_notificaciones: config.email_notificaciones,
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

        revalidatePath('/configuracion/notificaciones');
        return { success: true };
    } catch (error) {
        console.error('Error saving notif config:', error);
        return { success: false, error: 'Error al guardar la configuración' };
    }
}
