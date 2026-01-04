import { createClient } from '@/lib/supabase/server';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';
export type NotificationModule = 'ventas' | 'compras' | 'stock' | 'clientes' | 'caja' | 'usuarios' | 'proveedores' | 'sistema';

export async function notifyUsers(
    roles: string[],
    title: string,
    message: string,
    type: NotificationType | 'caja' = 'info',
    module: NotificationModule,
    referenceId?: string,
    link?: string
) {
    try {
        const supabase = await createClient();
        const finalType: NotificationType = type === 'caja' ? 'info' : type;

        // 1. Get users with the specified roles
        const { data: users, error: usersError } = await supabase
            .from('usuarios')
            .select('id')
            .in('rol', roles);

        if (usersError || !users || users.length === 0) {
            // console.warn('No users found for notification or error fetching users:', usersError);
            return;
        }

        // 2. Noise Control: Check for duplicate notifications in the last 5 minutes
        // We only check for the first user to avoid N queries, assuming if one has it, others might too (simplification)
        // or we can just check globally if there is a notification with same title/ref/module created recently.
        if (referenceId) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const { data: duplicates } = await supabase
                .from('notificaciones')
                .select('id')
                .eq('referencia_id', referenceId)
                .eq('titulo', title)
                .gte('created_at', fiveMinutesAgo)
                .limit(1);

            if (duplicates && duplicates.length > 0) {
                console.log('Duplicate notification suppressed:', title);
                return;
            }
        }

        // 3. Create notification objects
        const notifications = users.map(user => ({
            usuario_id: user.id,
            titulo: title,
            mensaje: message,
            tipo: finalType,
            leida: false,
            referencia_id: referenceId,
            modulo: module,
            link: link,
            created_at: new Date().toISOString()
        }));

        // 4. Insert notifications
        const { error: insertError } = await supabase
            .from('notificaciones')
            .insert(notifications);

        if (insertError) {
            console.error('Error creating notifications:', insertError);
        }

        // 5. Lazy Cleanup: 10% chance to delete old notifications (> 30 days)
        if (Math.random() < 0.1) {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            await supabase
                .from('notificaciones')
                .delete()
                .lt('created_at', thirtyDaysAgo);
        }

        // ============================================
        //  EMAIL NOTIFICATIONS INTEGRATION
        // ============================================

        // Check conditions: High priority (warning/error/success) or Stock module
        // We do simplistic check here. In a real world, we check user preferences.
        // For now, only STOCK ALERTS and important warnings trigger emails to ADMINs.

        if (module === 'stock' && type === 'warning') {
            const { sendStockAlert } = await import('@/services/resendService');
            const { getNotificacionesConfig } = await import('@/app/(dashboard)/configuracion/notificaciones/actions');

            const config = await getNotificacionesConfig();

            if (config.alertas_stock && config.email_notificaciones) {
                let productData = null;

                // Intentar obtener datos reales del producto si hay referencia
                if (referenceId) {
                    const { data: realProduct } = await supabase
                        .from('productos')
                        .select('nombre, stock_actual, stock_minimo')
                        .eq('id', referenceId)
                        .single();

                    if (realProduct) {
                        productData = realProduct;
                    }
                }

                // Fallback si no se encontró el producto
                if (!productData) {
                    productData = {
                        nombre: message,
                        stock_actual: 'Ver link',
                        stock_minimo: config.stock_minimo_global
                    };
                }

                await sendStockAlert(config.email_notificaciones, [productData]);
            }
        }

    } catch (error) {
        console.error('Unexpected error in notifyUsers:', error);
    }
}
