// Función para obtener la cotización del dólar
export async function getDolarRate(): Promise<number> {
  try {
    const response = await fetch('/api/dolarhoy');
    if (!response.ok) throw new Error('Error al obtener cotización');
    
    const data = await response.json();
    return data.rate || 0;
  } catch (error) {
    console.error('Error obteniendo cotización del dólar:', error);
    return 0;
  }
}

// Convertir de pesos a dólares
export function pesosToUSD(pesos: number, rate: number): number {
  if (rate === 0) return 0;
  return pesos / rate;
}

// Convertir de dólares a pesos
export function usdToPesos(usd: number, rate: number): number {
  return usd * rate;
}
