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
