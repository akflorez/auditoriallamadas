import fs from 'fs';
import path from 'path';
import { transcribeAudio, analyzeTranscript } from './openaiService';

let isProcessing = false;
const queue: string[] = [];

/**
 * Adds an audio ID to the queue and starts processing if not already running.
 */
export const addToQueue = (audioId: string) => {
    if (!queue.includes(audioId)) {
        queue.push(audioId);
    }
    processNext();
};

/**
 * Main worker that processes the queue sequentially.
 */
const processNext = async () => {
    if (isProcessing || queue.length === 0) return;
    
    isProcessing = true;
    const audioId = queue.shift()!;
    
    console.log(`[Queue] Starting processing for Audio ID: ${audioId}`);
    
    try {
        const dbPath = path.join(process.cwd(), 'data', 'db.json');
        const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
        
        let settings: any = {};
        if (fs.existsSync(settingsPath)) {
            settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        }

        const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const audioIdx = data.audios.findIndex((a: any) => a.id === audioId);
        
        if (audioIdx === -1) {
            console.error(`[Queue] Audio ${audioId} not found in DB.`);
            isProcessing = false;
            processNext();
            return;
        }

        const audio = data.audios[audioIdx];
        const storageName = audio.storageName || audio.filename;
        const filePath = path.join(process.cwd(), 'uploads', storageName);

        if (!fs.existsSync(filePath)) {
            throw new Error(`Archivo no encontrado: ${filePath}`);
        }

        // 1. Update status to PROCESSING
        data.audios[audioIdx].status = 'PROCESSING';
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

        // 2. Transcribe
        const transcript = await transcribeAudio(filePath, settings.openaiApiKey);
        
        // 3. Construct Dynamic Prompt based on assigned Portfolio
        const assignedPortfolio = audio.portfolio || 'EMPRESARIAL';
        const portfolioConfig = settings.portafolios?.[assignedPortfolio] || { kpis: [] };
        const kpis = portfolioConfig.kpis || [];
        
        const compiledPrompt = `${settings.baseContext || ''}\n\nREGLAS DE EVALUACIÓN PARA EL PORTAFOLIO [${assignedPortfolio}]:\n${kpis.map((k: any) => `${k.id}. ${k.name}: ${k.description}`).join('\n')}\n\nINSTRUCCIÓN ADICIONAL: Identifica el nombre del asesor que realiza la llamada buscando en el saludo inicial. Retórnalo en el campo "nombre_agente_detectado".\n\nResponde estrictamente en formato JSON con llaves exactas para cada KPI (ej: 1_presentacion, etc.), resultado, porcentaje_cumplimiento, kpi, resumen_ejecutivo, observaciones y nombre_agente_detectado.`;

        // 4. Analyze
        const analysis = await analyzeTranscript(transcript, compiledPrompt, settings.openaiApiKey);

        // 4. Final Save (Calculate Score based on Equal Weight)
        const finalData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const finalIdx = finalData.audios.findIndex((a: any) => a.id === audioId);
        if (finalIdx !== -1) {
            const results = analysis.kpi || {};
            const totalItems = Object.keys(results).length || kpis.length || 20;
            const passedItems = Object.values(results).filter(v => v === true).length;
            const calculatedScore = Math.round((passedItems / totalItems) * 100);

            finalData.audios[finalIdx] = {
                ...finalData.audios[finalIdx],
                status: 'PROCESSED',
                transcript,
                iaSummary: analysis.resumen_ejecutivo,
                score: calculatedScore,
                resultStatus: calculatedScore >= 80 ? 'APROBADO' : 'NO APROBADO',
                kpiResults: results,
                observations: analysis.observaciones,
                executive: audio.executive || analysis.nombre_agente_detectado || 'No identificado'
            };
            fs.writeFileSync(dbPath, JSON.stringify(finalData, null, 2));
        }

        console.log(`[Queue] Successfully processed Audio ID: ${audioId}`);
    } catch (error: any) {
        console.error(`[Queue] Error processing Audio ID ${audioId}:`, error);
        
        // Update to ERROR with details
        try {
            const dbPath = path.join(process.cwd(), 'data', 'db.json');
            const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            const idx = data.audios.findIndex((a: any) => a.id === audioId);
            if (idx !== -1) {
                data.audios[idx].status = 'ERROR';
                data.audios[idx].errorInfo = error.message || 'Error desconocido';
                fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.error('[Queue] Failed to update ERROR status:', e);
        }
    } finally {
        isProcessing = false;
        processNext(); // Move to next
    }
};

/**
 * Startup helper to reset any audios that were left in PROCESSING state (stalled).
 */
export const resetStalledAudios = async () => {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    if (!fs.existsSync(dbPath)) return;
    try {
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        let changed = false;
        data.audios = data.audios.map((a: any) => {
            if (a.status === 'PROCESSING') {
                a.status = 'PENDING';
                changed = true;
            }
            return a;
        });
        if (changed) {
            fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
            console.log('[Queue] Reset stalled audios to PENDING.');
        }
    } catch (e) {
        console.error('[Queue] Failed to reset stalled audios:', e);
    }
};

/**
 * Legacy compatible function to trigger mass processing of PENDING items.
 */
export const processQueue = async () => {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    if (!fs.existsSync(dbPath)) return;
    
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    // Pick up PENDING, ERROR, and even PROCESSING (stalled from previous runs)
    const toProcess = data.audios.filter((a: any) => a.status === 'PENDING' || a.status === 'ERROR' || a.status === 'PROCESSING');
    
    console.log(`[Queue] Adding ${toProcess.length} items to processing queue.`);
    toProcess.forEach((a: any) => addToQueue(a.id));
};
