import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
// import { processQueue } from './services/audioProcessor';
// import authRoutes from './routes/auth';
// import audiosRoutes from './routes/audios';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'EMDECOB Quality Monitor API' });
});

// Mock Route for Dashboard KPIs
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    audiosProcessed: 1248,
    inQueue: 34,
    errors: 2,
    newToday: 156
  });
});

// Cron Job for AI Flow simulation (Will listen to Google Drive)
// cron.schedule('*/5 * * * *', async () => {
//   console.log('[CRON] Running validation check on Google Drive for new Audios...');
//   await processQueue();
// });

// Dynamic Loader for Routes
const startServer = async () => {
  try {
    const authRoutes = (await import('./routes/auth')).default;
    const audiosRoutes = (await import('./routes/audios')).default;
    const settingsRoutes = (await import('./routes/settings')).default;
    const qualityMatrixRoutes = (await import('./routes/qualityMatrix')).default;
    const judicialRoutes = (await import('./routes/judicial')).default;
    const { resetStalledAudios } = await import('./services/audioProcessor');

    await resetStalledAudios();

    app.use('/api/auth', authRoutes);
    app.use('/api/audios', audiosRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/quality-matrix', qualityMatrixRoutes);
    app.use('/api/judicial', judicialRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running smoothly on port ${PORT}`);
      console.log(`EMDECOB Backend started.`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
