import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

async function test() {
    console.log('--- OpenAI Diagnostic ---');
    const settingsPath = path.join(process.cwd(), 'data', 'settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    const apiKey = settings.openaiApiKey;
    
    console.log('API Key length:', apiKey?.length);
    
    const client = new OpenAI({ apiKey });
    
    try {
        console.log('Testing MINIMAL Chat Completion to check credits...');
        const chat = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "test" }],
            max_tokens: 5
        });
        console.log('SUCCESS! Chat response:', chat.choices[0].message.content);
    } catch (e: any) {
        console.error('--- DIAGNOSTIC ERROR ---');
        console.error('Message:', e.message);
        console.error('Status:', e.status);
        console.error('Code:', e.code);
    }
}

test();
