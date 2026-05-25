import XLSX from 'xlsx';
import path from 'path';

const filePath = 'c:/Users/ANA KARINA/Desktop/automatización llamadas/PARTITURA AGOSTO EMPRESARIAL.xlsx';
const workbook = XLSX.readFile(filePath);

['CUARTIL', 'CONSOLIDADO'].forEach(sn => {
    console.log(`--- Sheet: ${sn} ---`);
    const worksheet = workbook.Sheets[sn];
    if (!worksheet) { console.log('Not found'); return; }
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(JSON.stringify(data.slice(0, 20), null, 2));
});
