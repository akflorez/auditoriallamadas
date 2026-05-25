import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Auth Setup
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * List new audio files from a specific folder
 */
export const listNewAudios = async (folderId: string) => {
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and (mimeType='audio/mpeg' or mimeType='audio/wav' or mimeType='audio/x-m4a')`,
      fields: 'files(id, name, mimeType, createdTime)',
    });
    return res.data.files || [];
  } catch (error) {
    console.error('Error fetching audios from Drive:', error);
    throw error;
  }
};

/**
 * Download a file from drive to a temporary local path
 */
export const downloadFile = async (fileId: string, fileName: string): Promise<string> => {
  const destPath = path.join(__dirname, '../../temp', fileName);
  const dest = fs.createWriteStream(destPath);
  
  try {
    const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    
    return new Promise((resolve, reject) => {
      res.data
        .on('end', () => resolve(destPath))
        .on('error', (err: any) => reject(err))
        .pipe(dest);
    });
  } catch (error) {
    console.error(`Error downloading file ${fileId}`, error);
    throw error;
  }
};

/**
 * Move file to processed folder
 */
export const moveFile = async (fileId: string, newFolderId: string, currentParentId: string) => {
  try {
    await drive.files.update({
      fileId: fileId,
      addParents: newFolderId,
      removeParents: currentParentId,
      fields: 'id, parents'
    });
    console.log(`File ${fileId} moved to processed folder.`);
  } catch (error) {
    console.error(`Error moving file ${fileId}`, error);
    throw error;
  }
};
