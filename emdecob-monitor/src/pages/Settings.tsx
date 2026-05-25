import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, 
  Plus, 
  Trash2, 
  Settings as SettingsIcon,
  Layout,
  Key,
  MessageSquare,
  Cpu,
  Type
} from 'lucide-react';
import { cn } from '../lib/utils';

const PORTAFOLIOS = [
  'EMPRESARIAL',
  'EFIGAS',
  'MIXTO',
  'PROPIEDAD HORIZONTAL',
  'FONDO NACIONAL DEL AHORRO'
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('EMPRESARIAL');
  const [config, setConfig] = useState<any>({
    openaiApiKey: '',
    openaiModel: 'gpt-4o',
    baseContext: '',
    observationPrompt: 'Genera un resumen de fallos encontrados.',
    transcriptPrompt: 'Transcribe el audio de forma literal.',
    portafolios: {}
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/settings');
      setConfig(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('http://localhost:5000/api/settings', config);
      alert('Configuración maestra sincronizada.');
    } catch (e) {
      alert('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const currentKpis = config.portafolios?.[activeTab]?.kpis || [];

  const updateKpi = (idx: number, field: string, value: string) => {
    const newKpis = [...currentKpis];
    newKpis[idx] = { ...newKpis[idx], [field]: value };
    setConfig({
      ...config,
      portafolios: {
        ...config.portafolios,
        [activeTab]: { kpis: newKpis }
      }
    });
  };

  return (
    <div className="space-y-10 animate-slide-up pb-32">
      <div className="flex items-center justify-between">
         <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit uppercase">Control <span className="text-emerald-500">Maestro IA</span></h1>
         <button 
           onClick={handleSave}
           disabled={saving}
           className="btn-premium bg-slate-900 text-white shadow-xl shadow-slate-900/20"
         >
           <Save size={18} /> {saving ? 'Sincronizando...' : 'Guardar Todo'}
         </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         {/* Left: General IA Config */}
         <div className="xl:col-span-4 space-y-8">
            <div className="premium-card p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2 text-emerald-400">
                  <Key size={14} /> Credenciales & Modelo
               </h3>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OpenAI API Key</label>
                     <input 
                       type="password"
                       value={config.openaiApiKey}
                       onChange={(e) => setConfig({...config, openaiApiKey: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                       placeholder="sk-..."
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Cpu size={12}/> Versión GPT</label>
                     <select 
                       value={config.openaiModel}
                       onChange={(e) => setConfig({...config, openaiModel: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                     >
                       <option value="gpt-4o" className="bg-slate-900">GPT-4o (Recomendado)</option>
                       <option value="gpt-4-turbo" className="bg-slate-900">GPT-4 Turbo</option>
                       <option value="gpt-3.5-turbo" className="bg-slate-900">GPT-3.5 (Económico)</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="premium-card p-8 space-y-8">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-400">
                  <MessageSquare size={14} /> Ingeniería de Prompts
               </h3>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Type size={12}/> Prompt Transcripción</label>
                     <textarea 
                       value={config.transcriptPrompt}
                       onChange={(e) => setConfig({...config, transcriptPrompt: e.target.value})}
                       className="w-full border border-slate-100 rounded-xl p-3 text-xs min-h-[80px]"
                       placeholder="Instrucciones para Whisper..."
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><MessageSquare size={12}/> Prompt de Hallazgos</label>
                     <textarea 
                       value={config.observationPrompt}
                       onChange={(e) => setConfig({...config, observationPrompt: e.target.value})}
                       className="w-full border border-slate-100 rounded-xl p-3 text-xs min-h-[100px]"
                       placeholder="Instrucciones para detectar errores..."
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contexto Base</label>
                     <textarea 
                       value={config.baseContext}
                       onChange={(e) => setConfig({...config, baseContext: e.target.value})}
                       className="w-full border border-slate-100 rounded-xl p-3 text-xs min-h-[100px]"
                       placeholder="Explicación del negocio a la IA..."
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Right: Matrices Per Portfolio */}
         <div className="xl:col-span-8">
            <div className="premium-card p-0 overflow-hidden shadow-2xl">
               <div className="flex bg-slate-50 border-b border-slate-100 overflow-x-auto scrollbar-hide">
                  {PORTAFOLIOS.map(p => (
                    <button
                      key={p}
                      onClick={() => setActiveTab(p)}
                      className={cn(
                        "px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                        activeTab === p ? "bg-white border-emerald-500 text-emerald-600" : "text-slate-400 border-transparent hover:text-slate-600"
                      )}
                    >
                      {p}
                    </button>
                  ))}
               </div>

               <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                          <Layout size={20} />
                        </div>
                        <div>
                           <h2 className="text-xl font-black text-slate-900 font-outfit uppercase">Matriz IA: {activeTab}</h2>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Configura los 20 criterios autocalificables</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     {currentKpis.map((kpi: any, idx: number) => (
                       <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-emerald-200 transition-all">
                          <span className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white text-[10px] font-black rounded-lg">{idx + 1}</span>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input 
                               type="text" 
                               value={kpi.name}
                               onChange={(e) => updateKpi(idx, 'name', e.target.value)}
                               className="bg-transparent border-none focus:ring-0 font-bold text-slate-800 text-sm"
                               placeholder="KPI Name"
                             />
                             <input 
                               type="text" 
                               value={kpi.description}
                               onChange={(e) => updateKpi(idx, 'description', e.target.value)}
                               className="bg-transparent border-none focus:ring-0 text-slate-500 text-xs italic"
                               placeholder="Instrucción IA..."
                             />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;
