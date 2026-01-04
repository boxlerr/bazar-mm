import { NextRequest, NextResponse } from 'next/server';
import { PDFService } from '@/services/pdfService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔥 API /api/compras/pdf llamada');

  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    console.log('📁 Archivo recibido:', file?.name, file?.size, 'bytes');

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó un archivo PDF' },
        { status: 400 }
      );
    }

    // Validar que sea un PDF
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un PDF' },
        { status: 400 }
      );
    }

    // Convertir a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('🔄 Procesando PDF...');

    // Extraer datos del PDF
    const data = await PDFService.extractDataFromPDF(buffer);

    console.log('✅ Datos extraídos:', {
      orden: data.numero_orden,
      productos: data.productos.length,
      total: data.total
    });

    // Log de primeros 3 productos para debug
    console.log('🔍 Primeros 3 productos extraídos:', JSON.stringify(data.productos.slice(0, 3), null, 2));

    // Validar datos extraídos
    const validation = PDFService.validateExtractedData(data);

    console.log('📊 Validación:', validation);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'El PDF no tiene el formato esperado',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error('❌ Error procesando PDF - DETALLES COMPLETOS:', error);
    console.error('❌ Stack:', error.stack);

    // Devolvemos el error detallado para debug en producción
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor al procesar el PDF',
        details: error.message,
        stack: error.stack, // Debug info
        type: error.constructor.name
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
