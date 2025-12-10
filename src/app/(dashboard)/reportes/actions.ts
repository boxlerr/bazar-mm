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

    // Helper to get date string in Argentina timezone (YYYY-MM-DD)
    const getArgDateString = (date: Date) => {
        return date.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    };

    const now = new Date();

    // Calculate 7 days ago range
    // We fetch a bit more data (from 8 days ago) to avoid timezone edge cases at the boundary
    const queryDate = new Date(now);
    queryDate.setDate(now.getDate() - 8);

    const { data: ventas } = await supabase
        .from('ventas')
        .select('created_at, total')
        .gte('created_at', queryDate.toISOString());

    const dailySales = new Map<string, number>();
    const last7Days = [];

    // Initialize map with last 7 days (including today)
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = getArgDateString(d);
        dailySales.set(dateKey, 0);
        last7Days.push({ date: d, key: dateKey });
    }

    ventas?.forEach(v => {
        const date = new Date(v.created_at);
        const dateKey = getArgDateString(date);
        if (dailySales.has(dateKey)) {
            dailySales.set(dateKey, dailySales.get(dateKey)! + v.total);
        }
    });

    // Format for chart
    const chartData = last7Days.map(({ date, key }) => {
        return {
            day: date.toLocaleDateString('es-AR', { weekday: 'short', timeZone: 'America/Argentina/Buenos_Aires' }),
            value: dailySales.get(key) || 0,
            fullDate: key
        };
    });

    return chartData;
}
