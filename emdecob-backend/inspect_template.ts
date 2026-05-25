import XLSX from 'xlsx';
import path from 'path';

const filePath = 'c:/Users/ANA KARINA/Desktop/automatización llamadas/plantilla calidad.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const sheet = workbook.Sheets[sheetName];
const headersToFind = ['CARTERA', 'NOMBRE EJECUTIVO', 'TIPO AUDITORIA', 'FECHA MONITOREO'];
const positions: any = {};

for (let z in sheet) {
  if (z[0] === '!') continue;
  const cell = sheet[z];
  if (cell.v && typeof cell.v === 'string') {
    headersToFind.forEach(h => {
      if (cell.v.toUpperCase().includes(h)) {
        positions[h] = z;
      }
    });
  }
}

console.log(JSON.stringify(positions, null, 2));
