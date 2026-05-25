import XLSX from 'xlsx';
const outputPath = 'c:/Users/ANA KARINA/Desktop/automatización llamadas/emdecob-backend/test_filled.xlsx';
const workbook = XLSX.readFile(outputPath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

console.log('A8:', worksheet['A8']?.v);
console.log('B6:', worksheet['B6']?.v);
console.log('E5:', worksheet['E5']?.v);
console.log('F7:', worksheet['F7']?.v);
