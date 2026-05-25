import XLSX from 'xlsx';
import path from 'path';

const filePath = 'c:/Users/ANA KARINA/Desktop/automatización llamadas/PARTITURA AGOSTO EMPRESARIAL.xlsx';
const workbook = XLSX.readFile(filePath);

workbook.SheetNames.forEach(sn => {
    console.log(`--- Sheet: ${sn} ---`);
    const worksheet = workbook.Sheets[sn];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(JSON.stringify(data.slice(0, 10), null, 2));
});
