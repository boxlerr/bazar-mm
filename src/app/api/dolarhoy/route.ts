import { NextResponse } from 'next/server';

// Cache para almacenar la cotización del dólar
let cachedData: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

export async function GET() {
  try {
    // Verificar si hay datos en caché válidos
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Obtener cotización de DólarHoy API
    const response = await fetch(process.env.DOLARHOY_API_URL || 'https://dolarapi.com/v1/dolares/blue');
    
    if (!response.ok) {
      throw new Error('Error al obtener la cotización');
    }

    const data = await response.json();
    
    cachedData = {
      rate: data.venta || data.compra || 0,
      timestamp: Date.now(),
    };

    return NextResponse.json(cachedData);
  } catch (error) {
    console.error('Error en API dólar:', error);
    return NextResponse.json(
      { error: 'Error al obtener la cotización del dólar' },
      { status: 500 }
    );
  }
}
