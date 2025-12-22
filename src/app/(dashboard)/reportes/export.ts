'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export async function exportToCSV(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.csv`);
}

export async function exportToXLSX(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export async function exportToPDF(data: any[], filename: string, title: string, columns: string[]) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30);

  // Transformar datos para autoTable
  // Asumimos que data es un array de objetos y columns son las keys que queremos mostrar
  const tableBody = data.map(row => columns.map(col => {
    const val = row[col];
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    return val;
  }));

  autoTable(doc, {
    head: [columns.map(c => c.toUpperCase())],
    body: tableBody,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 66, 66] },
  });

  doc.save(`${filename}.pdf`);
}

export async function exportClientsToXLSX(clientes: any[]) {
  console.log('Exporting clients:', clientes);
  const data = clientes.map(c => ({
    Nombre: c.nombre,
    DNI: c.dni || '',
    'Teléfono': c.telefono || '',
    Dirección: c.direccion || '',
    'E-mail': c.email || '',
    'Deuda': c.saldo_cuenta_corriente ? `$${Number(c.saldo_cuenta_corriente).toFixed(2)}` : '$0.00'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Adjust column widths
  const wscols = [
    { wch: 30 }, // Nombre
    { wch: 15 }, // DNI
    { wch: 15 }, // Teléfono
    { wch: 40 }, // Dirección
    { wch: 30 }, // E-mail
    { wch: 15 }  // Deuda
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
  XLSX.writeFile(workbook, `Clientes_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export async function exportStockToXLSX(stock: any[]) {
  const data = stock.map(p => ({
    Código: p.codigo,
    Nombre: p.nombre,
    Categoría: p.categoria,
    Stock: p.stock_actual,
    Mínimo: p.stock_minimo,
    'Precio Venta': p.precio_venta ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(p.precio_venta) : '$0'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Adjust column widths
  const wscols = [
    { wch: 15 }, // Código
    { wch: 40 }, // Nombre
    { wch: 20 }, // Categoría
    { wch: 10 }, // Stock
    { wch: 10 }, // Mínimo
    { wch: 15 }  // Precio Venta
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');
  XLSX.writeFile(workbook, `Stock_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export async function exportCajaToXLSX(movimientos: any[]) {
  const data = movimientos.map(m => ({
    Fecha: new Date(m.created_at).toLocaleString(),
    Tipo: m.tipo,
    Concepto: m.concepto,
    Monto: m.monto ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(m.monto) : '$0',
    Usuario: m.caja?.usuario?.nombre || 'Desconocido'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Adjust column widths
  const wscols = [
    { wch: 20 }, // Fecha
    { wch: 10 }, // Tipo
    { wch: 40 }, // Concepto
    { wch: 15 }, // Monto
    { wch: 20 }  // Usuario
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');
  XLSX.writeFile(workbook, `Caja_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export async function exportCajasToXLSX(cajas: any[]) {
  const data = cajas.map(c => ({
    'Fecha Apertura': new Date(c.fecha_apertura).toLocaleString(),
    'Fecha Cierre': c.fecha_cierre ? new Date(c.fecha_cierre).toLocaleString() : 'Abierta',
    Usuario: c.usuario?.nombre || 'Desconocido',
    Estado: c.estado,
    'Saldo Inicial': c.saldo_inicial ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(c.saldo_inicial) : '$0',
    'Saldo Final': c.saldo_final ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(c.saldo_final) : '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Adjust column widths
  const wscols = [
    { wch: 20 }, // Fecha Apertura
    { wch: 20 }, // Fecha Cierre
    { wch: 20 }, // Usuario
    { wch: 10 }, // Estado
    { wch: 15 }, // Saldo Inicial
    { wch: 15 }  // Saldo Final
  ];
  worksheet['!cols'] = wscols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cierres de Caja');
  XLSX.writeFile(workbook, `Cierres_Caja_${new Date().toISOString().split('T')[0]}.xlsx`);
}
