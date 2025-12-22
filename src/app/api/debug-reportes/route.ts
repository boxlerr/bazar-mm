import { NextResponse } from 'next/server';
import { getVentasPorVendedor } from '@/app/(dashboard)/reportes/actions';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('🔍 Debugging getVentasPorVendedor...');
        const result = await getVentasPorVendedor();
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('❌ Error in debug endpoint:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error
        }, { status: 500 });
    }
}
