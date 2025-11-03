import { getDolarRate, pesosToUSD, usdToPesos } from '@/lib/dolarhoy';

// Cache para almacenar la cotización
let cachedRate: { value: number; timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

// Obtener cotización con caché
export async function getCotizacionDolar(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
    return cachedRate.value;
  }

  const rate = await getDolarRate();
  cachedRate = {
    value: rate,
    timestamp: Date.now(),
  };

  return rate;
}

// Convertir precio de producto a dólares
export async function convertirPrecioADolares(precioPesos: number): Promise<number> {
  const rate = await getCotizacionDolar();
  return pesosToUSD(precioPesos, rate);
}

// Convertir precio de producto a pesos
export async function convertirPrecioAPesos(precioDolares: number): Promise<number> {
  const rate = await getCotizacionDolar();
  return usdToPesos(precioDolares, rate);
}

// Obtener cotización formateada
export async function getCotizacionFormateada(): Promise<string> {
  const rate = await getCotizacionDolar();
  return `$${rate.toFixed(2)}`;
}
