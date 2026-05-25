import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });

/**
 * Clones a spreadsheet template
 */
export const cloneTemplate = async (templateId: string, destinationFolderId: string, newTitle: string): Promise<string> => {
  try {
    const response = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: newTitle,
        parents: [destinationFolderId]
      }
    });
    return response.data.id || '';
  } catch (error) {
    console.error('Error cloning template sheet:', error);
    throw error;
  }
};

/**
 * Append data to the cloned spreadsheet
 */
export const fillSpreadsheet = async (spreadsheetId: string, kpiResults: any[]) => {
  // Format data into rows depending on template mapping
  const values = [
    // Header Example mapping
    // ['KPI Nombre', 'Cumple', 'Observación', 'Score'],
    ...kpiResults.map(kpi => [kpi.name, kpi.passed ? 'SI' : 'NO', kpi.observation])
  ];

  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Resultados!A2', // Ensure range aligns with template sheet name
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error filling spreadsheet ${spreadsheetId}:`, error);
    throw error;
  }
};
