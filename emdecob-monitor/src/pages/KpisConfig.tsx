import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  BarChart3, 
  Lightbulb, 
  Info,
  ChevronRight,
  Sparkles,
  Target,
  Layers,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';

const KpisConfig: React.FC = () => {
  const [kpis, setKpis] = useState([
    { id: 1, name: 'Saludo e Identificación', weight: 10, category: 'Protocolo', desc: 'El ejecutivo debe mencionar su nombre y la empresa.' },
    { id: 2, name: 'Verificación de Identidad', weight: 15, category: 'Seguridad', desc: 'Validar que habla con el titular de la deuda.' },
    { id: 3, name: 'Manejo de Objeciones', weight: 30, category: 'Cobranza', desc: 'Capacidad para rebatir negativas con argumentos.' },
    { id: 4, name: 'Cierre con Compromiso', weight: 45, category: 'Efectividad', desc: 'Establecer fecha y monto de pago claro.' },
  ]);

  return (
    <div className="space-y-10 animate-slide-up max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-500">
             <Target size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Criterios de Evaluación Corporativa</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit uppercase">Matriz de <span className="text-emerald-500">Inteligencia</span></h1>
          <p className="text-slate-500 mt-2 font-medium max-w-lg">Configura los KPIs y ponderaciones que la IA utilizará para auditar cada llamada de forma objetiva.</p>
        </div>
        
        <button className="btn-premium btn-premium-emerald shadow-xl shadow-emerald-500/20">
          <Plus size={18} /> Nuevo Criterio KPI
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Side: Stats/Rules */}
        <div className="space-y-8">
           
           <div className="premium-card p-8 bg-slate-900 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                 <BarChart3 size={100} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-6">Ponderación Total</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-6xl font-black font-outfit tabular-nums">100</span>
                   <span className="text-emerald-400 font-bold">%</span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-4 leading-relaxed">
                  Asegúrate de que la suma de todos los pesos sea exactamente 100% para un cálculo correcto del score global.
                </p>
              </div>
           </div>

           <div className="premium-card p-8 space-y-6 border-slate-100">
              <div className="flex items-center gap-3">
                 <Lightbulb className="text-amber-500" size={20} />
                 <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Tip de Auditoría</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Prioriza el <strong>Cierre con Compromiso</strong> con un peso mayor al 40% para incentivar la efectividad comercial en tus ejecutivos.
              </p>
           </div>

           <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
              <Layers className="text-slate-400" size={24} strokeWidth={1.5} />
              <div className="space-y-1">
                 <p className="text-xs font-bold text-slate-700">Versión de Matriz</p>
                 <p className="text-[10px] text-slate-400 font-medium">Activa desde: 01/01/2024</p>
              </div>
              <button className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4">
                 Ver Historial <ArrowUpRight size={14} />
              </button>
           </div>
        </div>

        {/* Right Side: KPI List */}
        <div className="xl:col-span-3 space-y-4">
           {kpis.map((kpi, index) => (
             <div key={kpi.id} className="premium-card p-6 flex items-center gap-6 group hover:translate-x-1 transition-all duration-300">
                <div className="cursor-grab text-slate-200 group-hover:text-slate-400 transition-colors">
                   <GripVertical size={20} />
                </div>
                
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-100/50 transition-colors">
                   <span className="text-lg font-black text-slate-300 group-hover:text-emerald-500 transition-colors font-outfit">{index + 1}</span>
                </div>

                <div className="flex-1 space-y-1">
                   <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">{kpi.name}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                        {kpi.category}
                      </span>
                   </div>
                   <p className="text-sm text-slate-500 font-medium">{kpi.desc}</p>
                </div>

                <div className="flex items-center gap-8">
                   <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso IA</p>
                      <div className="flex items-center gap-1">
                         <span className="text-2xl font-black text-slate-900 tabular-nums font-outfit">{kpi.weight}</span>
                         <span className="text-sm font-bold text-slate-400">%</span>
                      </div>
                   </div>

                   <div className="flex items-center gap-2">
                      <button className="p-3 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                         <ChevronRight size={20} />
                      </button>
                      <button className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                         <Trash2 size={20} />
                      </button>
                   </div>
                </div>
             </div>
           ))}

           <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-50/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-inner">
                 <Plus size={24} />
              </div>
              <div className="text-center">
                 <p className="text-sm font-bold text-slate-700">Agregar nuevo criterio de evaluación</p>
                 <p className="text-xs text-slate-500 font-medium mt-0.5">La IA comenzará a monitorear este KPI en la siguiente tanda de audios.</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default KpisConfig;
