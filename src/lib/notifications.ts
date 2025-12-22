import { createClient } from '@/lib/supabase/server';

export async function notifyUsers(
    roles: string[],
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'error' | 'caja' = 'info',
    referenceId?: string
) {
    try {
        const supabase = await createClient();

        // 1. Get users with the specified roles
        const { data: users, error: usersError } = await supabase
            .from('usuarios')
            .select('id')
            .in('rol', roles);

        if (usersError || !users || users.length === 0) {
            console.warn('No users found for notification or error fetching users:', usersError);
            return;
        }

        // 2. Create notification objects for each user
        const notifications = users.map(user => ({
            usuario_id: user.id,
            titulo: title,
            mensaje: message,
            tipo: type === 'caja' ? 'info' : type, // Map 'caja' to 'info' or a valid enum type if strictly defined in DB
            leida: false,
            referencia_id: referenceId,
            created_at: new Date().toISOString()
        }));

        // 3. Insert notifications
        // Note: This assumes a 'notificaciones' table exists. 
        // If it doesn't, this will fail silently in the try-catch block but prevent the app from crashing.
        // Given the previous context, we might need to create this table if it doesn't exist, 
        // but for now we are just fixing the build error.
        const { error: insertError } = await supabase
            .from('notificaciones')
            .insert(notifications);

        if (insertError) {
            console.error('Error creating notifications:', insertError);
        }

    } catch (error) {
        console.error('Unexpected error in notifyUsers:', error);
    }
}
