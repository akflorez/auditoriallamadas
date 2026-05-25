import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Download, 
  ShieldCheck, 
  ShieldAlert, 
  MicVocal,
  FastForward,
  Rewind,
  Calendar,
  User,
  Clock,
  Bot,
  Save,
  CheckSquare,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

const EXTRA_KPI_NAMES = [
  'Tipificación',
  'Observación',
  'Registro De Datos Actualizados',
  'Agendamiento',
  'Cumplimiento En Seguimiento',
  'Realiza Devolución De Llamada',
  'Uso De Medios',
  'Protocolo De Gestión',
  'Protocolo De Gestión Final'
];

const AudioDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extraKpis, setExtraKpis] = useState<Record<string, 'SI' | 'NO' | 'NA'>>({});
  const [mainKpis, setMainKpis] = useState<Record<string, boolean>>({});

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/audios`);
      const allAudios = res.data.audios || (Array.isArray(res.data) ? res.data : []);
      const current = allAudios.find((a: any) => a.id === id);
      setAudio(current);
      if (current?.kpiResults) {
        setMainKpis(current.kpiResults);
      } else {
        setMainKpis({});
      }
      if (current?.extraKpiResults) {
        // Migration: if it was boolean, map to SI/NO
        const migrated: any = {};
        Object.entries(current.extraKpiResults).forEach(([k, v]) => {
          if (typeof v === 'boolean') migrated[k] = v ? 'SI' : 'NO';
          else migrated[k] = v;
        });
        setExtraKpis(migrated);
      } else {
        // Initialize as NA by default
        const init: any = {};
        EXTRA_KPI_NAMES.forEach(name => init[name] = 'NA');
        setExtraKpis(init);
      }
    } catch (e) {
      console.error('Error fetching audio detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleSaveExtra = async () => {
    setSaving(true);
    try {
      // Calculate new score: (IA_Passed + Manual_Passed) / (20 + Manual_Not_NA)
      const iaKpisPassed = Object.values(mainKpis).filter(v => v === true).length;
      const iaKpisTotal = Object.keys(mainKpis).length || 20;

      const manualKpisPassed = Object.values(extraKpis).filter(v => v === 'SI').length;
      const manualKpisTotal = Object.values(extraKpis).filter(v => v !== 'NA').length;
      
      const totalPassed = iaKpisPassed + manualKpisPassed;
      const totalPossible = iaKpisTotal + manualKpisTotal;
      
      const newScore = totalPossible > 0 ? Math.round((totalPassed / totalPossible) * 100) : 0;

      await axios.post(`http://localhost:5000/api/audios/update-metadata/${id}`, {
        kpiResults: mainKpis,
        extraKpiResults: extraKpis,
        score: newScore,
        resultStatus: newScore >= 80 ? 'APROBADO' : 'NO APROBADO'
      });
      
      alert('Auditoría guardada y Score actualizado.');
      fetchDetail();
    } catch (e) {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest text-2xl">Cargando Análisis...</div>;
  if (!audio) return <div className="p-20 text-center font-black text-rose-500 uppercase tracking-widest text-2xl">Audio no encontrado</div>;

  const kpis = audio.kpiResults || {};
  const score = audio.score || 0;
  const resultStatus = audio.resultStatus || 'PENDIENTE';

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header Info */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/audios')}
            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm text-slate-500 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit uppercase">Audit <span className="text-emerald-500">#{id?.slice(0,8)}</span></h1>
              <span className={cn(
                "badge-premium", 
                resultStatus === 'APROBADO' ? "badge-premium-success" : 
                resultStatus === 'NO APROBADO' ? "bg-rose-100 text-rose-600 border-rose-200" :
                "badge-premium-amber"
              )}>
                {resultStatus}
              </span>
            </div>
            <div className="flex items-center gap-5 mt-2 overflow-x-auto whitespace-nowrap pb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200">
                  <img 
                    src={`/agents/${(audio.executive && audio.executive !== 'Manual Upload' && audio.executive !== 'Identificando...') 
                      ? audio.executive 
                      : audio.filename.replace(/\.(mp3|wav|m4a)$/i, '').split(/\d{4}-\d{2}-\d{2}/)[0].trim()}.png`}
                    alt={audio.executive}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${audio.executive}`;
                    }}
                  />
                </div>
                {audio.executive || 'Identificando...'}
              </div>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest"><Calendar size={14} /> {audio.date || 'Sin fecha'}</div>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest"><ShieldCheck size={14} /> {audio.portfolio || 'Empresarial'}</div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleSaveExtra}
            disabled={saving}
            className="btn-premium bg-slate-900 text-white shadow-xl shadow-slate-900/20"
          >
            <Save size={18} /> {saving ? 'Sincronizando...' : 'Guardar Cambios QA'}
          </button>
          <button 
            onClick={() => window.open(`http://localhost:5000/api/audios/download-template/${id}`, '_blank')}
            className="btn-premium bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
          >
            <Database size={18} /> Plantilla Llena
          </button>
          <button 
            onClick={() => window.open(`http://localhost:5000/api/audios/export/${id}`, '_blank')}
            className="btn-premium bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200/50"
          >
            <Download size={18} /> Base de Datos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="xl:col-span-4 space-y-8">
          
          <div className="premium-card p-8 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><MicVocal size={120} strokeWidth={1} /></div>
            <div className="relative z-10 text-center py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-6">Reproductor de Auditoría</p>
              <div className="flex items-center justify-center gap-8 mb-4">
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center transition-all shadow-xl shadow-emerald-500/30 active:scale-95">
                  {isPlaying ? <Pause fill="white" size={32} /> : <Play fill="white" size={32} className="ml-1" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase truncate px-4">{audio.filename}</p>
            </div>
          </div>

          <div className="premium-card p-0 overflow-hidden group">
            <div className={cn("p-8 text-white relative", score >= 80 ? "bg-emerald-500" : "bg-rose-500")}>
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Score Final Dinámico</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black font-outfit">{score}</span>
                    <span className="text-xl font-bold opacity-60">/ 100</span>
                 </div>
               </div>
               <Bot className="absolute bottom-4 right-4 opacity-10" size={100} />
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] mb-3 flex items-center gap-2">
                  <Bot size={14} className="text-emerald-500" /> Resumen Ejecutivo IA
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {audio.iaSummary}
                </p>
              </div>

              {/* MANUAL ITEMS SECTION 9 admin points */}
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <CheckSquare size={14} className="text-blue-500" /> Items Administrativos (Manual)
                  </h3>
                  <div className="flex gap-1">
                    {(['SI', 'NO', 'NA'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          const updated = { ...extraKpis };
                          EXTRA_KPI_NAMES.forEach(name => updated[name] = opt);
                          setExtraKpis(updated);
                        }}
                        className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 transition-colors"
                      >
                        All {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {EXTRA_KPI_NAMES.map(name => {
                    const currentVal = extraKpis[name] || 'NA';
                    return (
                      <div key={name} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight truncate">{name}</span>
                        <div className="flex gap-1">
                          {(['SI', 'NO', 'NA'] as const).map(option => (
                            <button
                              key={option}
                              onClick={() => setExtraKpis({...extraKpis, [name]: option})}
                              className={cn(
                                "flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all border",
                                currentVal === option 
                                  ? (option === 'SI' ? "bg-emerald-500 text-white border-emerald-600 shadow-sm" : 
                                     option === 'NO' ? "bg-rose-500 text-white border-rose-600 shadow-sm" : 
                                     "bg-slate-400 text-white border-slate-500 shadow-sm")
                                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-slate-400 mt-4 leading-relaxed italic">
                  * El Score se recalcula dinámicamente. Los ítems en <span className="font-bold text-slate-600 text-[10px]">NA</span> no afectan el porcentaje final.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-8 space-y-8">
          <div className="premium-card p-0">
             <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                <h3 className="font-bold text-slate-900 text-lg font-outfit">
                  {audio.channel === 'WHATSAPP' ? 'Matriz de Cumplimiento Manual (WhatsApp)' : 'Matriz de Cumplimiento IA (20 Puntos)'}
                </h3>
                <p className="text-xs text-slate-500 font-medium tracking-tight">
                  {audio.channel === 'WHATSAPP' ? 'Calificación manual de los KPIs del chat' : 'Evaluación automática realizada por el motor GPT-4o (Editable)'}
                </p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-slate-100 bg-white">
                {Object.entries(mainKpis).map(([kpiName, passed]: [string, boolean], idx: number) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{kpiName.replace(/^\d+[_\.]/, '').replace(/_/g, ' ')}</span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setMainKpis({ ...mainKpis, [kpiName]: true })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black transition-all border",
                          passed === true 
                            ? "bg-emerald-500 text-white border-emerald-600 shadow-sm"
                            : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        SI
                      </button>
                      <button
                        onClick={() => setMainKpis({ ...mainKpis, [kpiName]: false })}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black transition-all border",
                          passed === false 
                            ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                            : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                        )}
                      >
                        NO
                      </button>
                    </div>
                  </div>
                ))}
             </div>

             <div className="p-8 bg-rose-50/30 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hallazgos y Observaciones</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-bold italic">{audio.observations}</p>
             </div>

             <div className="p-8 bg-slate-50 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Transcripción de la Llamada</h4>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 text-sm text-slate-600 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-medium">
                  {audio.transcript}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioDetail;
