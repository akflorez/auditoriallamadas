import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { addAudio, getAudios } from '../lib/db';
import { processQueue, addToQueue } from '../services/audioProcessor';
import { listNewAudios } from '../services/googleDriveService';
import { analyzeTranscript, analyzeImage } from '../services/openaiService';

const router = express.Router();

const EXTRA_KPI_NAMES = [
  'Tipificación',
  'Observación',
  'Registro De Datos Actualizados',
  'Agendamiento',
  'Cumplimiento En Seguimiento',
  'Realiza Devolución De Llamada',
  'Uso De Medios',
  'Protocolo De Gestión',
  'Protocolo De Gestión Final'
];

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Get all audios
router.get('/', (req, res) => {
  res.json(getAudios());
});

// Trigger manual process
router.post('/process', async (req, res) => {
  try {
    processQueue();
    res.json({ message: 'Procesamiento iniciado.' });
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
});

// Upload and analyze
router.post('/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const { originalname } = req.file;
  const { auditType, portfolio, agentId, date } = req.body;
  
  const newAudio: any = {
    id: uuidv4(),
    filename: originalname,
    storageName: req.file.filename,
    status: 'PROCESSING',
    date: date || new Date().toISOString(),
    executive: agentId || 'Identificando...',
    portfolio: portfolio || 'EMPRESARIAL',
    auditType: auditType || 'ESTÁNDAR',
    score: null,
    transcript: null,
    iaSummary: null,
    kpiResults: null,
    extraKpiResults: {}
  };
  
  addAudio(newAudio);
  addToQueue(newAudio.id);
  res.json(newAudio);
});

// Create manual WhatsApp or other audit with file upload and AI capability
router.post('/create-manual', upload.single('file'), async (req, res) => {
  try {
    const { executive, portfolio, auditType, date, transcript, channel, runAI } = req.body;
    
    const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    let settings: any = {};
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
    
    const assignedPortfolio = portfolio || 'EMPRESARIAL';
    const portfolioConfig = settings.portafolios?.[assignedPortfolio] || { kpis: [] };
    const kpis = portfolioConfig.kpis || [];
    
    let extractedText = '';
    let isImage = false;
    let filePath = '';

    if (req.file) {
      filePath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();
      
      if (ext === '.txt') {
        extractedText = fs.readFileSync(filePath, 'utf-8');
      } else if (ext === '.xlsx' || ext === '.xls') {
        try {
          const workbook = XLSX.readFile(filePath);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          extractedText = json.map(row => row.filter(cell => cell !== null && cell !== undefined).join(' | ')).join('\n');
        } catch (e) {
          console.error('Error parsing Excel file:', e);
          extractedText = 'Error leyendo archivo Excel.';
        }
      } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        isImage = true;
      }
    }

    const finalTranscript = extractedText || transcript || '';
    
    let kpiResults: Record<string, boolean> = {};
    let calculatedScore = 0;
    let finalSummary = 'Monitoreo manual del canal de WhatsApp.';
    let finalObservations = '';
    let finalExecutive = executive || 'Desconocido';

    const shouldRunAI = runAI === 'true' || runAI === true;

    if (shouldRunAI && settings.openaiApiKey) {
      try {
        const compiledPrompt = `${settings.baseContext || ''}\n\nREGLAS DE EVALUACIÓN PARA EL PORTAFOLIO [${assignedPortfolio}]:\n${kpis.map((k: any) => `${k.id}. ${k.name}: ${k.description}`).join('\n')}\n\nINSTRUCCIÓN ADICIONAL: Identifica el nombre del asesor que atiende el chat de WhatsApp. Retórnalo en el campo "nombre_agente_detectado".\n\nResponde estrictamente en formato JSON con llaves exactas para cada KPI (ej: 1_presentacion, etc.), resultado, porcentaje_cumplimiento, kpi, resumen_ejecutivo, observaciones y nombre_agente_detectado.`;

        let analysis: any;
        if (isImage && filePath) {
          analysis = await analyzeImage(filePath, compiledPrompt, settings.openaiApiKey);
        } else {
          analysis = await analyzeTranscript(finalTranscript, compiledPrompt, settings.openaiApiKey);
        }

        kpiResults = analysis.kpi || {};
        const totalItems = Object.keys(kpiResults).length || kpis.length || 20;
        const passedItems = Object.values(kpiResults).filter(v => v === true).length;
        calculatedScore = Math.round((passedItems / totalItems) * 100);
        finalSummary = analysis.resumen_ejecutivo || 'Calificación realizada por IA.';
        finalObservations = analysis.observaciones || '';
        if (analysis.nombre_agente_detectado && analysis.nombre_agente_detectado !== 'No identificado') {
          finalExecutive = analysis.nombre_agente_detectado.toUpperCase();
        }
      } catch (aiError) {
        console.error('Error running AI on manual WhatsApp audit:', aiError);
        // Fallback to manual initialization if AI fails
        kpis.forEach((k: any) => {
          const key = `${k.id}_${k.name.toLowerCase().replace(/\s+/g, '_')}`;
          kpiResults[key] = false;
        });
      }
    } else {
      // Manual mode or no API key, initialize all to false
      kpis.forEach((k: any) => {
        const key = `${k.id}_${k.name.toLowerCase().replace(/\s+/g, '_')}`;
        kpiResults[key] = false;
      });
    }

    const extraKpiResults: Record<string, string> = {};
    EXTRA_KPI_NAMES.forEach(name => {
      extraKpiResults[name] = 'NA';
    });

    const newAudit = {
      id: uuidv4(),
      filename: req.file ? req.file.originalname : `WhatsApp - ${finalExecutive} - ${date}`,
      storageName: req.file ? req.file.filename : null,
      status: 'PROCESSED',
      channel: channel || 'WHATSAPP',
      date: date || new Date().toISOString().split('T')[0],
      executive: finalExecutive,
      portfolio: assignedPortfolio,
      auditType: auditType || 'MONITOREO 1',
      score: calculatedScore,
      transcript: isImage ? 'Captura de pantalla de chat WhatsApp.' : finalTranscript,
      iaSummary: finalSummary,
      observations: finalObservations,
      kpiResults,
      extraKpiResults,
      resultStatus: calculatedScore >= 80 ? 'APROBADO' : 'NO APROBADO'
    };

    addAudio(newAudit);
    res.json(newAudit);
  } catch (error: any) {
    console.error('Error creating manual audit:', error);
    res.status(500).json({ message: 'Error al crear auditoría manual', error: error.message });
  }
});

// Re-process
router.post('/reprocess/:id', async (req, res) => {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const idx = data.audios.findIndex((a: any) => a.id === req.params.id);
    if (idx !== -1) {
      data.audios[idx].status = 'PROCESSING';
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      addToQueue(req.params.id);
      res.json({ message: 'En cola' });
    }
  } catch (e) { res.status(500).send(e); }
});

// Helper to extract data from filename
const extractDataFromFilename = (filename: string) => {
  // Try YYYY-MM-DD
  let dateRegex = /(\d{4}-\d{2}-\d{2})/;
  let dateMatch = filename.match(dateRegex);
  let date = dateMatch ? dateMatch[1] : null;

  // Try DD-MM-YYYY if not found
  if (!date) {
    dateRegex = /(\d{2}-\d{2}-\d{4})/;
    dateMatch = filename.match(dateRegex);
    if (dateMatch) {
        const parts = dateMatch[1].split('-');
        date = `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to YYYY-MM-DD
    }
  }

  // Clean name: everything before the date or the whole filename without extension
  let name = filename.replace(/\.(mp3|wav|m4a)$/i, '');
  if (dateMatch) {
    name = name.split(dateMatch[1])[0].trim();
  }
  
  // Remove trailing numbers or symbols often added to names
  name = name.replace(/[-_]\d+$/, '').trim();

  return { name, date };
};

// Helper to build Excel Row
const buildExcelRow = (audio: any, portfolioKpis: any[]) => {
  const { name: extractedName, date: extractedDate } = extractDataFromFilename(audio.filename);
  
  const finalExecutive = (audio.executive && audio.executive !== 'Manual Upload' && audio.executive !== 'Identificando...') 
    ? audio.executive 
    : extractedName;
    
  const finalDate = audio.date && !audio.date.includes('T') // If it's a simple date string
    ? audio.date 
    : (extractedDate || (audio.date ? new Date(audio.date).toISOString().split('T')[0] : ''));

  const row: any = {
    'ID': audio.id.slice(0,8),
    'CARTERA': audio.portfolio || 'EMPRESARIAL',
    'TIPO DE AUDITORÍA': audio.auditType || 'MONITOREO 1',
    'NOMBRE DE EJECUTIVO': finalExecutive,
    'FECHA DE MONITOREO': finalDate,
    'SCORE FINAL': audio.score !== null ? `${audio.score}%` : '0%',
    'ESTADO': audio.resultStatus || 'PENDIENTE',
    'RESUMEN IA': audio.iaSummary || '',
    'HALLAZGOS/OBSERVACIONES': audio.observations || ''
  };

  // 20 IA KPIs
  portfolioKpis.forEach((k: any) => {
    const key = Object.keys(audio.kpiResults || {}).find(key => key.includes(k.id.toString()));
    row[k.name.toUpperCase()] = (key && audio.kpiResults[key]) ? '1.00' : '0.00';
  });

  // 9 Manual KPIs
  EXTRA_KPI_NAMES.forEach(name => {
    const val = audio.extraKpiResults && audio.extraKpiResults[name];
    row[name.toUpperCase()] = (val === 'SI') ? '1.00' : '0.00';
  });

  return row;
};

// Export ALL
router.get('/export-all', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'db.json'), 'utf-8'));
    const settings = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'settings.json'), 'utf-8'));
    const processed = data.audios.filter((a: any) => a.status === 'PROCESSED');

    const wb = XLSX.utils.book_new();
    const rows = processed.map((a: any) => {
        const kpis = settings.portafolios?.[a.portfolio || 'EMPRESARIAL']?.kpis || [];
        return buildExcelRow(a, kpis);
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Consolidado');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=CONSOLIDADO_EMDECOB.xlsx`);
    res.send(buf);
  } catch (e) { res.status(500).send(e); }
});

// Export INDIVIDUAL
router.get('/export/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'db.json'), 'utf-8'));
    const settings = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'settings.json'), 'utf-8'));
    const audio = data.audios.find((a: any) => a.id === req.params.id);

    if (!audio) return res.status(404).send('No found');

    const kpis = settings.portafolios?.[audio.portfolio || 'EMPRESARIAL']?.kpis || [];
    const row = buildExcelRow(audio, kpis);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([row]);
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoria');
    
    // Add observations below
    XLSX.utils.sheet_add_aoa(ws, [
        [],
        ['TRANSCRIPCION'],
        [audio.transcript || '']
    ], { origin: -1 });

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', `attachment; filename=Auditoria_${audio.id.slice(0,8)}.xlsx`);
    res.send(buf);
  } catch (e) { res.status(500).send(e); }
});

// Download populated template
router.get('/download-template/:id', async (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'db.json'), 'utf-8'));
    const audio = data.audios.find((a: any) => a.id === req.params.id);

    if (!audio) return res.status(404).send('Audio not found');

    const templatePath = path.join(process.cwd(), '..', 'plantilla calidad.xlsx');
    
    // Use exceljs to preserve styles, images, and merged cells
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const worksheet = workbook.worksheets[0];

    const { name: extractedName, date: extractedDate } = extractDataFromFilename(audio.filename);
    const finalDate = extractedDate || (audio.date ? new Date(audio.date).toISOString().split('T')[0] : '');
    const finalExecutive = (audio.executive && audio.executive !== 'Manual Upload' && audio.executive !== 'Identificando...') 
      ? audio.executive 
      : extractedName;

    // --- 1. HEADERS ---
    // A6 -> Portfolio (Below A5: CARTERA)
    worksheet.getCell('A6').value = audio.portfolio || 'EMPRESARIAL';
    // B6 -> Executive (Below B5: NOMBRE EJECUTIVO)
    worksheet.getCell('B6').value = finalExecutive;
    // F4 -> Audit Type (Beside E4: TIPO AUDITORIA)
    worksheet.getCell('F4').value = audio.auditType || 'MONITOREO 1';
    // G5 -> Audit Date (Beside F5: FECCHA DE LA AUDITORIA)
    worksheet.getCell('G5').value = finalDate;
    // G6 -> Monitoring Date (Beside F6: FECHA MONITOREO)
    worksheet.getCell('G6').value = new Date().toISOString().split('T')[0];

    // --- 2. IA KPIs (20 items) ---
    // Mapping: Rows 9-18 (KPIs 1-10) and 20-29 (KPIs 11-20)
    const kpiResults = audio.kpiResults || {};
    for (let i = 1; i <= 20; i++) {
        const rowNum = i <= 10 ? (8 + i) : (9 + i);
        // Find key that starts with "i_" or "i."
        const kpiKey = Object.keys(kpiResults).find(k => k.startsWith(`${i}_`) || k.startsWith(`${i}.`));
        const passed = kpiKey ? kpiResults[kpiKey] === true : false;
        
        // Column E for SI, F for NO
        worksheet.getCell(`E${rowNum}`).value = passed ? 'X' : '';
        worksheet.getCell(`F${rowNum}`).value = passed ? '' : 'X';
    }

    // --- 3. MANUAL KPIs (9 items) ---
    // Mapping: Rows 31-36 and 38-40
    const extraKpis = audio.extraKpiResults || {};
    EXTRA_KPI_NAMES.forEach((name, index) => {
        const i = index + 1;
        const rowNum = i <= 6 ? (30 + i) : (31 + i);
        const val = extraKpis[name];
        
        worksheet.getCell(`E${rowNum}`).value = (val === 'SI') ? 'X' : '';
        worksheet.getCell(`F${rowNum}`).value = (val === 'NO') ? 'X' : '';
    });

    // --- 4. SUMMARY & SCORE ---
    // G41 -> Score (Beside C41: TOTALES)
    worksheet.getCell('G41').value = audio.score !== null ? `${audio.score}%` : '0%';
    // A43 -> Observations (Below A42: DETALLE DE LA ATENCION)
    worksheet.getCell('A43').value = `RESUMEN IA:\n${audio.iaSummary || 'No disponible'}\n\nHALLAZGOS/OBSERVACIONES:\n${audio.observations || 'Sin observaciones'}`;
    worksheet.getCell('A43').alignment = { wrapText: true, vertical: 'top' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Plantilla_${audio.filename}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (e: any) {
    console.error(e);
    res.status(500).send(`Error al generar plantilla: ${e.message || e}`);
  }
});

// Bulk Export (Selected)
router.post('/bulk-export', (req, res) => {
  try {
    const { ids } = req.body;
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'db.json'), 'utf-8'));
    const settings = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'settings.json'), 'utf-8'));
    const selected = data.audios.filter((a: any) => ids.includes(a.id));

    const wb = XLSX.utils.book_new();
    const rows = selected.map((a: any) => {
        const kpis = settings.portafolios?.[a.portfolio || 'EMPRESARIAL']?.kpis || [];
        return buildExcelRow(a, kpis);
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Seleccionados');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Auditoria_Seleccionada.xlsx`);
    res.send(buf);
  } catch (e) { res.status(500).send(e); }
});

// Update Meta
router.post('/update-metadata/:id', (req, res) => {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const idx = data.audios.findIndex((a: any) => a.id === req.params.id);
    if (idx !== -1) {
      data.audios[idx] = { ...data.audios[idx], ...req.body };
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      res.json({ message: 'OK' });
    }
  } catch (e) { res.status(500).send(e); }
});

export default router;
