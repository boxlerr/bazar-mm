'use server';

import { createClient } from '@/lib/supabase/server';
import { Venta, Producto, Cliente } from '@/types';

export interface VentaPorUsuario {
    usuario: string;
    total_ventas: number;
    cantidad_tickets: number;
}

export interface RentabilidadItem {
    fecha: string;
    venta_total: number;
    costo_total: number;
    ganancia: number;
    margen: number;
}

export async function getVentasPorVendedor(startDate?: Date, endDate?: Date) {
    const supabase = await createClient();

    // 1. Fetch users first to have the mapping
    const { data: usuarios, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('id, nombre');

    if (errorUsuarios) {
        console.error('Error fetching usuarios for report:', JSON.stringify(errorUsuarios, null, 2));
        // Continue with empty map, will show as 'Desconocido'
    }

    const usuariosMap = new Map<string, string>();
    usuarios?.forEach((u: any) => {
        if (u.id && u.nombre) usuariosMap.set(u.id, u.nombre);
    });

    // 2. Fetch sales
    let query = supabase
        .from('ventas')
        .select('total, usuario_id')
        .eq('estado', 'completada');

    if (startDate) query = query.gte('created_at', startDate.toISOString());
    if (endDate) query = query.lte('created_at', endDate.toISOString());

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching ventas por vendedor:', JSON.stringify(error, null, 2));
        return [];
    }

    // 3. Group by user
    const agrupado: Record<string, VentaPorUsuario> = {};

    data?.forEach((venta: any) => {
        const nombre = usuariosMap.get(venta.usuario_id) || 'Desconocido';

        if (!agrupado[nombre]) {
            agrupado[nombre] = { usuario: nombre, total_ventas: 0, cantidad_tickets: 0 };
        }
        agrupado[nombre].total_ventas += venta.total;
        agrupado[nombre].cantidad_tickets += 1;
    });

    return Object.values(agrupado).sort((a, b) => b.total_ventas - a.total_ventas);
}

export async function getRentabilidadReport(startDate?: Date, endDate?: Date) {
    const supabase = await createClient();

    // Necesitamos los items de venta para saber el costo en el momento de la venta
    // Pero si no guardamos historial de costo en venta_items, usamos el precio_costo actual (aproximación)
    // O mejor: venta_items tiene precio_unitario (venta).
    // ¿Tiene costo? Veo la tabla venta_items en init_schema:
    // producto_id, cantidad, precio_unitario, subtotal. NO TIENE COSTO HISTÓRICO.
    // Esto es un fallo común. Para rentabilidad exacta necesitamos el costo al momento de venta.
    // Asumiremos el costo actual del producto como aproximación, o modificamos la tabla.
    // Dado que NO puedo modificar "todo" el sistema histórico, usaré el costo actual del producto.

    let query = supabase
        .from('venta_items')
        .select(`
            cantidad,
            subtotal,
            created_at,
            producto:productos(precio_costo)
        `);

    if (startDate) query = query.gte('created_at', startDate.toISOString());
    if (endDate) query = query.lte('created_at', endDate.toISOString());

    const { data, error } = await query;

    if (error) return [];

    // Agrupar por día
    const porDia: Record<string, RentabilidadItem> = {};

    data?.forEach((item: any) => {
        const fecha = new Date(item.created_at).toISOString().split('T')[0];
        const costoUnitario = item.producto?.precio_costo || 0;
        const costoTotalItem = costoUnitario * item.cantidad;

        if (!porDia[fecha]) {
            porDia[fecha] = { fecha, venta_total: 0, costo_total: 0, ganancia: 0, margen: 0 };
        }

        porDia[fecha].venta_total += item.subtotal;
        porDia[fecha].costo_total += costoTotalItem;
    });

    // Calcular ganancia y margen final
    return Object.values(porDia).map(d => ({
        ...d,
        ganancia: d.venta_total - d.costo_total,
        margen: d.venta_total > 0 ? ((d.venta_total - d.costo_total) / d.venta_total) * 100 : 0
    })).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export async function getMovimientosCajaReport(startDate?: Date, endDate?: Date) {
    const supabase = await createClient();

    let query = supabase
        .from('movimientos_caja')
        .select(`
            *,
            caja:caja(usuario:usuarios(nombre))
        `)
        .order('created_at', { ascending: false });

    if (startDate) query = query.gte('created_at', startDate.toISOString());
    if (endDate) query = query.lte('created_at', endDate.toISOString());

    const { data, error } = await query;

    if (error) return [];

    return data;
}


export async function getVentasReport(startDate?: Date, endDate?: Date) {
    const supabase = await createClient();

    // 1. Fetch users for mapping
    const { data: usuarios } = await supabase.from('usuarios').select('id, nombre');
    const usuariosMap = new Map(usuarios?.map((u: any) => [u.id, u.nombre]));

    // 2. Fetch sales with clients and items
    let query = supabase
        .from('ventas')
        .select('*, clientes(nombre), venta_items(*, productos(*))')
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

    // 3. Map users
    const result = data.map((v: any) => ({
        ...v,
        usuario: {
            nombre: usuariosMap.get(v.usuario_id) || 'Desconocido'
        },
        cliente: v.clientes // Map clientes to a consistent property if needed, or just use v.clientes
    }));

    return result;
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

export type TimeRange = '7d' | '30d' | '60d' | '90d' | '12m';

export async function getSalesChartData(range: TimeRange = '7d') {
    const supabase = await createClient();
    const now = new Date();
    const timeZone = 'America/Argentina/Buenos_Aires';

    let startDate = new Date(now);
    let aggregation: 'daily' | 'weekly' | 'monthly' = 'daily';
    let daysToSubtract = 7;

    switch (range) {
        case '7d':
            daysToSubtract = 7;
            startDate.setDate(now.getDate() - 7);
            aggregation = 'daily';
            break;
        case '30d':
            daysToSubtract = 30;
            startDate.setDate(now.getDate() - 30);
            aggregation = 'daily';
            break;
        case '60d':
            daysToSubtract = 60;
            startDate.setDate(now.getDate() - 60);
            aggregation = 'weekly';
            break;
        case '90d':
            daysToSubtract = 90;
            startDate.setDate(now.getDate() - 90);
            aggregation = 'weekly';
            break;
        case '12m':
            daysToSubtract = 365;
            startDate.setFullYear(now.getFullYear() - 1);
            aggregation = 'monthly';
            break;
    }

    // Adjust start date to be slightly earlier to ensure we cover the edge of the first bucket in UTC
    const queryDate = new Date(startDate);
    queryDate.setDate(queryDate.getDate() - (aggregation === 'weekly' ? 7 : 2));

    const { data: ventas } = await supabase
        .from('ventas')
        .select('created_at, total')
        .gte('created_at', queryDate.toISOString());

    const chartDataMap = new Map<string, { day: string, value: number, fullDate: string, sortOrder: number }>();

    // Helper functions for formatting
    const getDailyKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone });
    const getWeeklyKey = (d: Date) => {
        // Get start of week (Sunday)
        const date = new Date(d);
        const day = date.getDay(); // 0 is Sunday
        date.setDate(date.getDate() - day);
        return date.toLocaleDateString('en-CA', { timeZone });
    };
    const getMonthlyKey = (d: Date) => {
        // First day of month
        return d.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', timeZone }).slice(0, 7); // YYYY-MM
    };

    const formatLabel = (d: Date, type: typeof aggregation) => {
        if (type === 'monthly') {
            return d.toLocaleDateString('es-AR', { month: 'short', timeZone });
        } else if (type === 'weekly') {
            const endOfWeek = new Date(d);
            endOfWeek.setDate(d.getDate() + 6);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        } else {
            return d.toLocaleDateString('es-AR', { weekday: 'short', timeZone });
        }
    };

    // Initialize buckets
    if (aggregation === 'daily') {
        for (let i = daysToSubtract - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = getDailyKey(d);
            chartDataMap.set(key, {
                day: formatLabel(d, 'daily'),
                value: 0,
                fullDate: key,
                sortOrder: d.getTime()
            });
        }
    } else if (aggregation === 'weekly') {
        // Start from current week and go back
        let current = new Date(now);
        // Align to start of week (Sunday) for consistency
        current.setDate(current.getDate() - current.getDay());

        const limitDate = new Date(startDate);

        while (current >= limitDate) {
            const key = getWeeklyKey(current);
            chartDataMap.set(key, {
                day: formatLabel(current, 'weekly'),
                value: 0,
                fullDate: key,
                sortOrder: current.getTime()
            });
            current.setDate(current.getDate() - 7);
        }
    } else if (aggregation === 'monthly') {
        let current = new Date(now);
        current.setDate(1); // Start of current month

        for (let i = 0; i < 12; i++) {
            const key = getMonthlyKey(current);
            chartDataMap.set(key, {
                day: formatLabel(current, 'monthly'),
                value: 0,
                fullDate: key,
                sortOrder: current.getTime()
            });
            current.setMonth(current.getMonth() - 1);
        }
    }

    // Fill buckets with data
    ventas?.forEach(v => {
        const date = new Date(v.created_at);
        let key = '';
        if (aggregation === 'daily') key = getDailyKey(date);
        else if (aggregation === 'weekly') key = getWeeklyKey(date);
        else if (aggregation === 'monthly') key = getMonthlyKey(date);

        if (chartDataMap.has(key)) {
            chartDataMap.get(key)!.value += v.total;
        }
    });

    // Sort and return array
    return Array.from(chartDataMap.values())
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ day, value, fullDate }) => ({ day, value, fullDate }));
}

export async function getCajasReport(startDate?: Date, endDate?: Date) {
    const supabase = await createClient();
    console.log('Fetching Cajas Report (Manual Join)...');

    // 1. Fetch users
    const { data: usuarios } = await supabase.from('usuarios').select('id, nombre');
    const usuariosMap = new Map(usuarios?.map((u: any) => [u.id, u.nombre]));

    // 2. Fetch cajas without join
    let query = supabase
        .from('caja')
        .select('*')
        .order('fecha_apertura', { ascending: false });

    if (startDate) query = query.gte('fecha_apertura', startDate.toISOString());
    if (endDate) query = query.lte('fecha_apertura', endDate.toISOString());

    const { data: cajas, error } = await query;

    if (error) {
        console.error('Error fetching cajas:', error);
        return [];
    }

    // 3. Map users to cajas
    const result = cajas.map((c: any) => ({
        ...c,
        usuario: {
            nombre: usuariosMap.get(c.usuario_id) || 'Desconocido'
        }
    }));

    return result;
}
