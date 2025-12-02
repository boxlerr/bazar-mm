'use server';

import { createClient } from '@/lib/supabase/server';
import { Venta, Producto, Cliente } from '@/types';

export async function getVentasReport(startDate?: Date, endDate?: Date) {
    const supabase = await createClient();

    let query = supabase
        .from('ventas')
        .select('*, venta_items(*, productos(*))')
        .order('created_at', { ascending: false });

    if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching ventas:', error);
        return [];
    }

    return data;
}

export async function getStockReport() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre');

    if (error) {
        console.error('Error fetching stock:', error);
        return [];
    }

    return data as Producto[];
}

export async function getClientesReport() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre');

    if (error) {
        console.error('Error fetching clientes:', error);
        return [];
    }

    return data as Cliente[];
}

export async function getDashboardStats() {
    const supabase = await createClient();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Ventas del mes
    const { data: ventasMes, error: errorVentas } = await supabase
        .from('ventas')
        .select('total')
        .gte('created_at', startOfMonth);

    const totalVentasMes = ventasMes?.reduce((sum, v) => sum + v.total, 0) || 0;

    // Clientes nuevos del mes
    const { count: clientesNuevos, error: errorClientes } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth);

    // Alertas de stock (productos con stock <= stock_minimo)
    // Nota: Esto es aproximado, idealmente se hace con una query directa si supabase lo permite facil,
    // o trayendo todo. Para optimizar, asumimos que hay una view o funcion, pero aqui lo haremos simple.
    const { count: alertasStock, error: errorStock } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .filter('stock_actual', 'lte', 'stock_minimo' as any); // Hacky filter, better to use raw query or RPC if complex

    // Para alertas de stock correcto, necesitamos comparar columnas. Supabase JS client no soporta col vs col directo en filter facil.
    // Vamos a traer los productos y filtrar en memoria por ahora (asumiendo no son millones).
    const { data: productos } = await supabase.from('productos').select('stock_actual, stock_minimo');
    const lowStockCount = productos?.filter(p => p.stock_actual <= p.stock_minimo).length || 0;

    return {
        ventasMes: totalVentasMes,
        clientesNuevos: clientesNuevos || 0,
        alertasStock: lowStockCount,
    };
}

export async function getWeeklySales() {
    const supabase = await createClient();
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: ventas } = await supabase
        .from('ventas')
        .select('created_at, total')
        .gte('created_at', sevenDaysAgo.toISOString());

    // Agrupar por día
    const dailySales = new Map<string, number>();

    // Inicializar últimos 7 días con 0
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dayName = d.toLocaleDateString('es-AR', { weekday: 'short' });
        // Usamos el nombre del día como clave simple, cuidado con duplicados si cruzamos semanas (ej 2 lunes), 
        // pero para 7 dias está bien. Mejor usar fecha completa para sort y luego formatear.
        dailySales.set(d.toISOString().split('T')[0], 0);
    }

    ventas?.forEach(v => {
        const dateKey = v.created_at.split('T')[0];
        if (dailySales.has(dateKey)) {
            dailySales.set(dateKey, dailySales.get(dateKey)! + v.total);
        }
    });

    // Convertir a array formato para el chart
    const chartData = Array.from(dailySales.entries()).map(([date, value]) => {
        const d = new Date(date);
        // Ajustar zona horaria si es necesario, pero split T00:00 asume UTC o local consistente
        // Para visualización simple:
        return {
            day: d.toLocaleDateString('es-AR', { weekday: 'short' }), // Lun, Mar...
            value,
            fullDate: date
        };
    });

    return chartData;
}
