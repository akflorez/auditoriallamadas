import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const router = express.Router();
const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

// Configure multer for agent photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save to the monitor's public folder so it can be served directly
    const agentsDir = path.join(process.cwd(), '..', 'emdecob-monitor', 'public', 'agents');
    if (!fs.existsSync(agentsDir)) {
      fs.mkdirSync(agentsDir, { recursive: true });
    }
    cb(null, agentsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = req.body.name ? req.body.name.replace(/\s+/g, '_').toLowerCase() : Date.now();
    cb(null, `${name}${ext}`);
  }
});

const upload = multer({ storage });

// Get current settings
router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(settingsPath)) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error reading settings', error });
  }
});

// Update settings
router.post('/', (req, res) => {
  try {
    const settings = req.body;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    
    // Also update environment variables in memory if they match
    if (settings.driveInputFolderId) process.env.DRIVE_INPUT_FOLDER_ID = settings.driveInputFolderId;
    if (settings.driveOutputFolderId) process.env.DRIVE_OUTPUT_FOLDER_ID = settings.driveOutputFolderId;
    if (settings.sheetTemplateId) process.env.SHEET_TEMPLATE_ID = settings.sheetTemplateId;
    if (settings.openaiApiKey) process.env.OPENAI_API_KEY = settings.openaiApiKey;
    if (settings.systemPrompt) process.env.SYSTEM_PROMPT = settings.systemPrompt;

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error saving settings', error });
  }
});

// Get Google Credentials Status
router.get('/credentials', (req, res) => {
  const credsPath = path.join(process.cwd(), 'credentials.json');
  if (fs.existsSync(credsPath)) {
    try {
      const creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
      res.json({ 
        exists: true, 
        clientEmail: creds.client_email,
        projectId: creds.project_id
      });
    } catch (e) {
      res.json({ exists: true, error: 'Invalid JSON' });
    }
  } else {
    res.json({ exists: false });
  }
});

// Update Google Credentials
router.post('/credentials', (req, res) => {
  try {
    const creds = req.body;
    const credsPath = path.join(process.cwd(), 'credentials.json');
    fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
    res.json({ message: 'Credentials updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving credentials', error });
  }
});

// Upload agent photo
router.post('/upload-agent-photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return the relative path from public folder
    const photoPath = `/agents/${req.file.filename}`;
    res.json({ photoPath });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading photo', error });
  }
});

export default router;
