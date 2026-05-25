import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Initial DB structure
const initialData = {
  audios: [],
  config: {
    driveInputFolderId: '',
    driveOutputFolderId: '',
    driveProcessedFolderId: '',
    googleSheetsTemplateId: '',
    openaiModel: 'gpt-4o',
    systemPrompt: 'Eres un auditor de EMDECOB.',
    openaiApiKey: ''
  }
};

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
}

export const getData = () => {
  const content = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(content);
};

export const saveData = (data: any) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

export const getAudios = () => getData().audios;
export const addAudio = (audio: any) => {
  const data = getData();
  data.audios.push(audio);
  saveData(data);
};

export const getConfig = () => getData().config;
export const updateConfig = (newConfig: any) => {
  const data = getData();
  data.config = { ...data.config, ...newConfig };
  saveData(data);
};
