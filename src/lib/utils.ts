// Formatear moneda (pesos argentinos)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Formatear fecha
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

// Formatear fecha y hora
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Función para truncar texto
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Capitalizar primera letra
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Generar ID único
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Validar CUIT/CUIL
export function validateCUIT(cuit: string): boolean {
  if (!/^\d{11}$/.test(cuit)) return false;
  
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digits = cuit.split('').map(Number);
  const verificador = digits.pop()!;
  
  const suma = digits.reduce((acc, digit, i) => acc + digit * multiplicadores[i], 0);
  const resto = suma % 11;
  const digitoVerificador = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;
  
  return digitoVerificador === verificador;
}
