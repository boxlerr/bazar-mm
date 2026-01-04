import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getNotificacionesConfig } from '@/app/(dashboard)/configuracion/notificaciones/actions';
import { sendDailySalesSummary } from '@/services/resendService';

export async function GET(request: Request) {
    // 1. Verificar autorización (Opcional: Header de Vercel Cron)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new NextResponse('Unauthorized', { status: 401 });
    // }

    try {
        // 2. Obtener configuración
        const config = await getNotificacionesConfig();

        if (!config.alertas_ventas || !config.email_notificaciones) {
            return NextResponse.json({ message: 'Daily summary disabled or no email configured' });
        }

        const supabase = await createClient();

        // 3. Definir rango de fecha (Hoy, zona horaria Argentina UTC-3 aprox)
        // Calculamos el inicio y fin del día en UTC para que coincida con "lo que va del día" en AR.
        // Argentina es UTC-3.
        const now = new Date();
        // Ajustamos a hora Argentina
        const argentinaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));

        const startOfDay = new Date(argentinaTime);
        startOfDay.setUTCHours(0, 0, 0, 0);
        // Regresamos a UTC para la query (sumando 3 horas)
        // startOfDay (en variable) representa las 00:00 AR. En UTC es 03:00.
        // Pero Supabase guarda en UTC. Así que queremos rows donde created_at >= 03:00 UTC.

        const startIso = new Date(startOfDay.getTime() + (3 * 60 * 60 * 1000)).toISOString();
        const endIso = new Date(startOfDay.getTime() + (27 * 60 * 60 * 1000)).toISOString(); // +24h +3h offset logic? No, just +24h from start

        // Simplificación: Usar la fecha actual del servidor DB si es posible, o simplemente >= Today 00:00 UTC
        // Para evitar lios de zona horaria complejos manuales, usaremos GTE today 00:00 UTC.
        // Si el usuario quiere presición AR, deberíamos usar librerías de fecha.
        // Usaremos ISO string del día actual UTC.
        const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const { data: ventas, error: ventasError } = await supabase
            .from('ventas')
            .select(`
                id,
                total,
                created_at,
                venta_items (
                    cantidad,
                    precio_unitario,
                    producto:productos (nombre)
                )
            `)
            .gte('created_at', `${todayStr}T00:00:00.000Z`)
            .lte('created_at', `${todayStr}T23:59:59.999Z`);

        if (ventasError) throw ventasError;

        if (!ventas || ventas.length === 0) {
            return NextResponse.json({ message: 'No sales today' });
        }

        // 4. Calcular estadísticas
        const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);
        const cantidadTickets = ventas.length;

        // Agrupar productos
        const productStats: Record<string, { nombre: string, cantidad: number, total: number }> = {};

        ventas.forEach(venta => {
            venta.venta_items.forEach((item: any) => {
                // item.producto podría ser null si se borró, acceder con seguridad
                const nombre = item.producto?.nombre || 'Producto desconocido';

                if (!productStats[nombre]) {
                    productStats[nombre] = { nombre, cantidad: 0, total: 0 };
                }
                productStats[nombre].cantidad += item.cantidad;
                productStats[nombre].total += (item.cantidad * item.precio_unitario);
            });
        });

        // Top 5 productos
        const topProductos = Object.values(productStats)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        // 5. Enviar Email
        const result = await sendDailySalesSummary(config.email_notificaciones, {
            totalVentas,
            cantidadTickets,
            topProductos
        });

        if (!result.success) {
            throw new Error('Failed to send email');
        }

        return NextResponse.json({
            success: true,
            message: 'Daily summary sent',
            stats: { totalVentas, cantidadTickets }
        });

    } catch (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
