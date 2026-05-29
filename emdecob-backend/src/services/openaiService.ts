import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Client instantiation helper to prevent startup crash when OPENAI_API_KEY is missing
const getClient = (apiKey?: string) => {
  return new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY || 'no-key-provided',
  });
};

/**
 * 1. Convert Audio to text using Whisper
 */
export const transcribeAudio = async (filePath: string, apiKey?: string): Promise<string> => {
  const client = getClient(apiKey);
  try {
    const response = await client.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
      language: "es"
    }, { timeout: 90000 }); // 90 second timeout
    return response.text;
  } catch (error) {
    console.error('Whisper Transcription Error:', error);
    throw error;
  }
};

/**
 * 2. Analyze the context of the transcript against the KPI configuration
 */
export const analyzeTranscript = async (transcript: string, promptBase: string, apiKey?: string): Promise<any> => {
  const client = getClient(apiKey);
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: promptBase
        },
        {
          role: "user",
          content: `Transcript for Audit: "${transcript}"`
        }
      ]
    }, { timeout: 90000 }); // 90 second timeout
    
    const resultContent = response.choices[0].message.content;
    if (!resultContent) {
        throw new Error('No content returned from OpenAI');
    }
    
    return JSON.parse(resultContent);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw error;
  }
};

/**
 * 3. Analyze image screenshots (OCR + Quality Audit) using GPT-4o vision
 */
export const analyzeImage = async (imagePath: string, promptBase: string, apiKey?: string): Promise<any> => {
  const client = getClient(apiKey);
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const base64Image = fileBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: promptBase
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Evalúa esta captura de pantalla de conversación de WhatsApp contra las reglas definidas."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ]
    }, { timeout: 90000 });

    const resultContent = response.choices[0].message.content;
    if (!resultContent) {
        throw new Error('No content returned from OpenAI');
    }
    
    return JSON.parse(resultContent);
  } catch (error) {
    console.error('AI Image Analysis Error:', error);
    throw error;
  }
};
