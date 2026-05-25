import XLSX from 'xlsx';
import path from 'path';

const filePath = 'c:/Users/ANA KARINA/Desktop/automatización llamadas/plantilla calidad.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:H20');

for (let r = 0; r <= 50; r++) {
    let rowStr = '';
    for (let c = 0; c <= 15; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const cell = sheet[cellAddress];
        const val = cell ? cell.v : '';
        rowStr += `[${cellAddress}: ${val}] `.padEnd(30);
    }
    console.log(rowStr);
}
