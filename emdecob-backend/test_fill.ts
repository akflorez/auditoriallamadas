import XLSX from 'xlsx';
import path from 'path';

const templatePath = 'c:/Users/ANA KARINA/Desktop/automatización llamadas/plantilla calidad.xlsx';
const outputPath = 'c:/Users/ANA KARINA/Desktop/automatización llamadas/emdecob-backend/test_filled.xlsx';

try {
    const workbook = XLSX.readFile(templatePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Helper to set cell value
    const setCell = (cell: string, value: any) => {
        if (!worksheet[cell]) worksheet[cell] = { t: 's', v: '' };
        worksheet[cell].v = value;
        worksheet[cell].t = 's';
    };

    setCell('A8', 'TEST CARTERA');
    setCell('B6', 'TEST EJECUTIVO');
    setCell('E5', 'TEST AUDITORIA');
    setCell('F7', '2026-04-28');

    XLSX.writeFile(workbook, outputPath);
    console.log('Test file created at ' + outputPath);
} catch (e) {
    console.error(e);
}
