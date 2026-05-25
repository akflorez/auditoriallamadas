import fs from 'fs';
import path from 'path';

const settingsPath = 'c:/Users/ANA KARINA/Desktop/automatización llamadas/emdecob-backend/data/settings.json';
const photosPath = 'c:/Users/ANA KARINA/Desktop/automatización llamadas/COLABORADORES SIN MARCO';

try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    const files = fs.readdirSync(photosPath);
    
    const existingNames = new Set(settings.agentes.map((a: any) => a.nombre.toUpperCase()));
    
    files.forEach(file => {
        if (file.toLowerCase().endsWith('.png')) {
            const name = file.replace('.png', '').toUpperCase();
            if (!existingNames.has(name) && name !== 'THUMBS.DB') {
                settings.agentes.push({
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    nombre: name,
                    foto: '', // We'll use the /agents/name.png logic in frontend
                    cargo: 'Asesor de Cobranzas'
                });
                console.log(`Added agent: ${name}`);
            }
        }
    });
    
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    console.log('Successfully updated agents in settings.json');
} catch (e) {
    console.error(e);
}
