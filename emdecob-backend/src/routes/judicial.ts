import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import OpenAI from 'openai';

const router = express.Router();

const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'no-key-provided',
  });
};

// Multer config for Excel uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `judicial-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

/**
 * Endpoint to classify Excel rows using OpenAI
 */
router.post('/classify', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo' });
  }

  const filePath = req.file.path;

  try {
    const workbook = XLSX.readFile(filePath);
    // Find "Comentarios" sheet or use the first one
    const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('comentarios')) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: 'El archivo Excel está vacío o no tiene el formato correcto.' });
    }

    // Detect columns
    const firstRow = data[0];
    const colActuacion = Object.keys(firstRow).find(k => k.toLowerCase().includes('actuacion') || k.toLowerCase().includes('actuación'));
    const colComentario = Object.keys(firstRow).find(k => k.toLowerCase().includes('descripcion') || k.toLowerCase().includes('descripción') || k.toLowerCase().includes('comentario'));

    if (!colActuacion) {
      return res.status(400).json({ message: 'No se encontró la columna "Actuación" en el archivo.' });
    }

    // Process rows in batches to avoid OpenAI timeouts/token limits
    const BATCH_SIZE = 20;
    const results = [];

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE).map((row, idx) => ({
        index: i + idx,
        actuacion: row[colActuacion] || '',
        comentario: colComentario ? row[colComentario] : ''
      }));

      const classificationPrompt = `
Eres un experto jurídico especializado en clasificar actuaciones procesales.
Tu tarea es clasificar cada fila en una CATEGORÍA MACRO y una SUBCATEGORÍA, justificando tu decisión.

REGLAS DE CLASIFICACIÓN MACRO:
1. "Actuaciones de Juzgado": Todo lo que provenga del juzgado o autoridad (autos, sentencias, requerimientos judiciales, traslados, admisiones, etc). Idea clave: Órdenes o decisiones del juzgado.
2. "Actuaciones Administrativas": Trámites operativos o de sistema (registros en plataformas, carga en portales, estados de sistema, reparto, radicación, validación de sistema, etc). Idea clave: Gestión técnica/plataformas.
3. "Actuaciones de Abogado": Gestión o solicitudes realizadas por el apoderado (memoriales, recursos, subsanaciones, escritos, impulsos, aportes documentales, etc). Idea clave: Solicitud o actuación del abogado.

REGLAS DE SUBCATEGORÍA:
- Para Abogado: Solicitudes, Recursos, Subsanaciones, Oficios, Memoriales, Aportes documentales, Impulso procesal, Otro abogado.
- Para Administrativa: Plataformas, Radicación, Reparto, Registro, Consulta, Carga de información, Validación, Seguimiento administrativo, Otro administrativo.
- Para Juzgado: Requerimientos, Sentencias, Interlocutorios, Autos, Admisión, Inadmisión, Rechazo, Traslado, Mandamiento, Fijación en lista, Otro juzgado.

IMPORTANTE:
- Prioriza el CONTEXTO DEL COMENTARIO sobre el nombre de la actuación.
- Si no hay suficiente información, marca como "Por revisar".
- Responde ESTRICTAMENTE en formato JSON un array de objetos con esta estructura:
[
  {
    "index": number,
    "macro": "Actuaciones de Juzgado" | "Actuaciones Administrativas" | "Actuaciones de Abogado" | "Por revisar",
    "sub": "...",
    "motivo": "..."
  }
]
`;

      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: classificationPrompt },
          { role: "user", content: `Clasifica estas actuaciones: ${JSON.stringify(batch)}` }
        ]
      });

      const content = response.choices[0].message.content;
      if (content) {
        const batchResults = JSON.parse(content).results || JSON.parse(content); // Handle different JSON wrappers if any
        results.push(...(Array.isArray(batchResults) ? batchResults : []));
      }
    }

    // Merge results back to original data
    const finalData = data.map((row, idx) => {
      const match = results.find(r => r.index === idx);
      return {
        ...row,
        'Clasificación Macro': match ? match.macro : 'Por revisar',
        'Subclasificación': match ? match.sub : 'Por revisar',
        'Motivo de Clasificación': match ? match.motivo : 'No se pudo procesar automáticamente'
      };
    });

    res.json(finalData);

  } catch (error) {
    console.error('Judicial Classification Error:', error);
    res.status(500).json({ message: 'Error procesando la clasificación con IA.' });
  } finally {
    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

export default router;
