import express from 'express';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { getAudios } from '../lib/db';

const router = express.Router();
const partituraPath = path.join(process.cwd(), '..', 'PARTITURA AGOSTO EMPRESARIAL.xlsx');

router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // If we have filters, we calculate from database (Dynamic)
    if (month && year && month !== 'all' && year !== 'all') {
      const targetMonth = parseInt(month as string);
      const targetYear = parseInt(year as string);

      const allAudios = getAudios();
      const audios = allAudios.filter((a: any) => {
        if (a.score === null || a.score === undefined) return false;
        if (!a.date) return false;
        const d = new Date(a.date);
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
      });

      const matrixData: any = {
        quartiles: [],
        auditTypes: [],
        summary: {
          avgScore: 0,
          agentCount: 0,
          compliance: 0,
          bestAudit: 'N/A'
        }
      };

      if (audios.length > 0) {
        // Group by Agent and Audit Type for Quartiles
        audios.forEach(a => {
          let q = 'Q1';
          if (a.score! >= 90) q = 'Q4';
          else if (a.score! >= 80) q = 'Q3';
          else if (a.score! >= 70) q = 'Q2';

          matrixData.quartiles.push({
            auditType: a.auditType || 'General',
            agent: a.executive || 'Desconocido',
            score: a.score,
            quartile: q
          });
        });

        // Calculate Audit Type Averages
        const types: any = {};
        audios.forEach(a => {
          const t = a.auditType || 'General';
          if (!types[t]) types[t] = { count: 0, total: 0 };
          types[t].count++;
          types[t].total += a.score!;
        });

        matrixData.auditTypes = Object.keys(types).map(k => ({
          name: k,
          avgScore: (types[k].total / types[k].count).toFixed(2)
        }));

        // Summary
        const totalAvg = audios.reduce((acc, curr) => acc + curr.score!, 0) / audios.length;
        const agents = new Set(audios.map(a => a.executive));
        
        matrixData.summary = {
          avgScore: totalAvg.toFixed(1),
          agentCount: agents.size,
          compliance: totalAvg.toFixed(1),
          bestAudit: matrixData.auditTypes.sort((a: any, b: any) => b.avgScore - a.avgScore)[0]?.name || 'N/A'
        };
      }

      return res.json(matrixData);
    }

    // Fallback to Excel logic (Historical or Static)
    if (!fs.existsSync(partituraPath)) {
      return res.status(404).json({ message: 'Partitura file not found' });
    }

    const workbook = XLSX.readFile(partituraPath);
    const snCuartil = 'CUARTILAMIENTO';
    const snPartitura = 'PARTITURA';

    const matrixData: any = {
      quartiles: [],
      auditTypes: [],
      summary: {
        avgScore: '88.4',
        agentCount: '18',
        compliance: '85',
        bestAudit: 'MONITOREO 1'
      }
    };

    if (workbook.Sheets[snCuartil]) {
      const sheet = workbook.Sheets[snCuartil];
      const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      let currentAuditType = '';
      data.forEach((row: any[]) => {
        if (row && row[4] && typeof row[4] === 'string' && row[4].includes('CUARTILAMIENTO')) {
          currentAuditType = row[4].replace('CUARTILAMIENTO ', '').trim();
        } else if (currentAuditType && row && row[4] && row[7] && row[4] !== 'RAC') {
          const agentName = String(row[4]).trim().toUpperCase();
          if (agentName !== 'YISETH CIFUENTES') {
            matrixData.quartiles.push({
              auditType: currentAuditType,
              agent: agentName,
              score: row[6],
              quartile: row[7]
            });
          }
        }
      });
    }

    if (workbook.Sheets[snPartitura]) {
        const sheet = workbook.Sheets[snPartitura];
        const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const types: any = {};
        data.slice(1).forEach(row => {
            if (row && row[3]) {
                const type = row[3];
                if (!types[type]) types[type] = { count: 0, totalScore: 0 };
                types[type].count++;
                if (row[8]) types[type].totalScore += row[8];
            }
        });

        matrixData.auditTypes = Object.keys(types).map(k => ({
            name: k,
            avgScore: (types[k].totalScore / types[k].count).toFixed(2)
        }));
    }

    res.json(matrixData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing quality matrix', error });
  }
});

export default router;
