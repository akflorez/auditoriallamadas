import React from 'react';
import { 
  Trophy, 
  Star,
  Search,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

const mockExecutives = [
  { id: 1, name: 'Julio Martínez', calls: 145, score: 95.8, trend: '+2.5', status: 'optimal' },
  { id: 2, name: 'Ana Pérez', calls: 132, score: 88.2, trend: '+1.0', status: 'optimal' },
  { id: 3, name: 'Laura Gómez', calls: 98, score: 81.5, trend: '-3.2', status: 'regular' },
  { id: 4, name: 'Carlos Ruiz', calls: 115, score: 68.4, trend: '-0.5', status: 'critical' },
];

const Performance: React.FC = () => {
  return (
    <div className="space-y-10 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-500">
             <Trophy size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ranking de Excelencia Operativa</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit uppercase">Gestión de <span className="text-emerald-500">Performance</span></h1>
          <p className="text-slate-500 mt-2 font-medium max-w-lg">Analiza el rendimiento comparativo de tu equipo de cobranzas y detecta oportunidades de capacitación.</p>
        </div>
        
        <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
           <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-900/10 transition-all">Semanal</button>
           <button className="px-6 py-2 text-slate-400 hover:text-slate-600 text-xs font-bold transition-all">Mensual</button>
        </div>
      </div>

      {/* Top 3 Visual Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Silver */}
        <div className="order-2 md:order-1 pt-8">
          <div className="premium-card p-8 flex flex-col items-center text-center relative mt-8 group overflow-hidden border-slate-100">
             <div className="absolute top-0 inset-x-0 h-1 bg-slate-300"></div>
             <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 -mt-16 border-4 border-white shadow-xl relative z-10 transition-transform group-hover:scale-110">
                <img src="https://ui-avatars.com/api/?name=AP&background=f1f5f9&color=64748b" className="rounded-xl" alt="Avatar" />
                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-slate-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white">2</div>
             </div>
             <h3 className="mt-4 font-bold text-slate-900 text-lg">{mockExecutives[1].name}</h3>
             <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">92.4% Score</p>
             <div className="mt-6 w-full flex justify-between px-4 text-xs font-bold text-slate-400 border-t border-slate-50 pt-4 uppercase tracking-[0.1em]">
                <div>Calls: 132</div>
                <div className="text-emerald-500">+1.2%</div>
             </div>
          </div>
        </div>

        {/* Gold */}
        <div className="order-1 md:order-2">
          <div className="premium-card p-10 flex flex-col items-center text-center relative group overflow-hidden border-emerald-100 shadow-emerald-200/40 shadow-2xl">
             <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
             <div className="w-24 h-24 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-white -mt-20 border-[6px] border-white shadow-2xl relative z-10 transition-all duration-500 group-hover:rotate-6 group-hover:scale-105">
                <img src="https://ui-avatars.com/api/?name=JM&background=10b981&color=fff" className="rounded-[1.4rem]" alt="Avatar" />
                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-sm font-black text-white shadow-lg">1</div>
             </div>
             <div className="mt-8">
               <Star className="text-emerald-400 fill-current inline mx-0.5" size={16} />
               <Star className="text-emerald-400 fill-current inline mx-0.5" size={16} />
               <Star className="text-emerald-400 fill-current inline mx-0.5" size={16} />
             </div>
             <h3 className="mt-4 font-black text-slate-900 text-2xl font-outfit">{mockExecutives[0].name}</h3>
             <p className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] mt-2">Máxima Eficiencia</p>
             <div className="mt-10 py-6 px-10 bg-emerald-50 rounded-3xl w-full border border-emerald-100/50">
                <div className="text-4xl font-black text-emerald-600 tabular-nums">95.8%</div>
                <div className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase mt-1">Score Global Histórico</div>
             </div>
          </div>
        </div>

        {/* Bronze */}
        <div className="order-3 md:order-3 pt-8">
          <div className="premium-card p-8 flex flex-col items-center text-center relative mt-8 group overflow-hidden border-slate-100">
             <div className="absolute top-0 inset-x-0 h-1 bg-amber-600/30"></div>
             <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-slate-400 -mt-16 border-4 border-white shadow-xl relative z-10 transition-transform group-hover:scale-110">
                <img src="https://ui-avatars.com/api/?name=LG&background=fef3c7&color=b45309" className="rounded-xl" alt="Avatar" />
                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-amber-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white">3</div>
             </div>
             <h3 className="mt-4 font-bold text-slate-900 text-lg">{mockExecutives[2].name}</h3>
             <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-1">81.5% Score</p>
             <div className="mt-6 w-full flex justify-between px-4 text-xs font-bold text-slate-400 border-t border-slate-50 pt-4 uppercase tracking-[0.1em]">
                <div>Calls: 98</div>
                <div className="text-rose-500">-3.2%</div>
             </div>
          </div>
        </div>

      </div>

      {/* Full List Table */}
      <div className="premium-card overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Desglose Detallado</h3>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" placeholder="Filtrar ejecutivo..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 outline-none w-64 transition-all" />
             </div>
             <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all font-bold">
               <Activity size={16} />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Nivel</th>
                <th className="px-6 py-5">Ejecutivo de Cobranzas</th>
                <th className="px-6 py-5 text-center">Audios Eval.</th>
                <th className="px-6 py-5 text-center">Score Promedio</th>
                <th className="px-6 py-5">Tendencia</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockExecutives.map((exec, index) => (
                <tr key={exec.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                      index === 0 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                       <span className="font-bold text-slate-800">{exec.name}</span>
                       <div className={cn(
                         "w-2 h-2 rounded-full",
                         exec.status === 'optimal' ? "bg-emerald-500" : exec.status === 'regular' ? "bg-amber-500" : "bg-rose-500"
                       )}></div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center font-bold tabular-nums text-slate-600">{exec.calls}</td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center">
                       <span className={cn(
                         "text-lg font-black font-outfit",
                         exec.score >= 85 ? "text-emerald-500" : exec.score >= 70 ? "text-blue-500" : "text-rose-500"
                       )}>{exec.score}%</span>
                       <div className="w-20 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div className={cn(
                            "h-full rounded-full",
                            exec.score >= 85 ? "bg-emerald-500" : exec.score >= 70 ? "bg-blue-500" : "bg-rose-500"
                          )} style={{ width: `${exec.score}%` }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={cn(
                      "font-black text-xs px-2 py-1 rounded-lg tabular-nums",
                      exec.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {exec.trend}%
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="btn-premium py-1.5 px-4 text-[10px] font-black uppercase tracking-widest bg-slate-900 group-hover:bg-emerald-600 transition-colors">
                      Ficha Analítica
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Performance;
