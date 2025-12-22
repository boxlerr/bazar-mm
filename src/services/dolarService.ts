// Interfaces para la API de DolarAPI
interface DolarRate {
  compra: number;
  venta: number;
  casa: string;
  nombre: string;
  moneda: string;
  fechaActualizacion: string;
}

// URL base de la API
const API_URL = 'https://dolarapi.com/v1/dolares';

// Cache simple
let cachedRates: { [key: string]: { rate: DolarRate; timestamp: number } } = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutos

// Función genérica para obtener cotización
async function fetchRate(type: 'oficial' | 'blue'): Promise<DolarRate> {
  const now = Date.now();

  if (cachedRates[type] && now - cachedRates[type].timestamp < CACHE_DURATION) {
    return cachedRates[type].rate;
  }

  try {
    const response = await fetch(`${API_URL}/${type}`, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error(`Error fetching ${type} rate`);

    const rate: DolarRate = await response.json();
    cachedRates[type] = { rate, timestamp: now };

    return rate;
  } catch (error) {
    console.error(`Error obteniendo cotización ${type}:`, error);
    // Retornar valor fallback o el último conocido si falla
    if (cachedRates[type]) return cachedRates[type].rate;
    throw error;
  }
}

export async function getDolarOficial(): Promise<DolarRate> {
  return fetchRate('oficial');
}

export async function getDolarBlue(): Promise<DolarRate> {
  return fetchRate('blue');
}

// Helpers de conversión (usando Venta Blue por defecto para precios)
export async function convertirPrecioADolares(precioPesos: number, tipo: 'oficial' | 'blue' = 'blue'): Promise<number> {
  try {
    const rate = await fetchRate(tipo);
    if (rate.venta === 0) return 0;
    return Number((precioPesos / rate.venta).toFixed(2));
  } catch {
    return 0;
  }
}

export async function convertirPrecioAPesos(precioDolares: number, tipo: 'oficial' | 'blue' = 'blue'): Promise<number> {
  try {
    const rate = await fetchRate(tipo);
    return Math.ceil(precioDolares * rate.venta);
  } catch {
    return 0;
  }
}
