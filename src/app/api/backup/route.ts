import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-bazar-mm-${timestamp}.json`;

        // List of tables to backup
        const tables = [
            'productos',
            'clientes',
            'ventas',
            'venta_items',
            'caja',
            'movimientos_caja',
            'compras',
            'compra_items',
            'proveedores',
            'usuarios',
            'configuracion'
        ];

        const backupData: Record<string, any[]> = {};

        // Fetch data from all tables sequentially
        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('*');
            if (error) {
                console.error(`Error backing up table ${table}:`, error);
                // Continue with other tables but log error
                backupData[table] = [{ error: error.message }];
            } else {
                backupData[table] = data || [];
            }
        }

        // Create response with JSON data
        const json = JSON.stringify(backupData, null, 2);

        return new NextResponse(json, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('Backup error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
