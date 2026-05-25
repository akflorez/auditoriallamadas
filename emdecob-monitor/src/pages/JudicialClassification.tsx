import React from 'react';
import { Gavel, Search, Filter, Calendar, ShieldCheck, Download } from 'lucide-react';

const JudicialClassification: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit">Clasificación Judicial</h1>
          <p className="text-slate-500 mt-1">Gestión inteligente de radicados y vinculación con tareas de ClickUp</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200">
            <ShieldCheck size={18} />
            Validar Radicados
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pendientes por Vincular', value: '124', color: 'bg-amber-500', icon: Gavel },
          { label: 'Radicados Validados', value: '852', color: 'bg-emerald-500', icon: ShieldCheck },
          { label: 'Alertas de Plazo', value: '12', color: 'bg-rose-500', icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 ${stat.color}/10 rounded-xl flex items-center justify-center text-${stat.color.split('-')[1]}-600`}>
                <stat.icon size={24} />
              </div>
              <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-4">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area Placeholder */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
          <Gavel size={40} />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">Módulo de Clasificación Judicial</h3>
        <p className="text-slate-500 max-w-md mt-2">
          Estamos preparando la interfaz de gestión de radicados. Aquí podrás vincular tareas de ClickUp con procesos judiciales y automatizar el seguimiento.
        </p>
        <div className="flex gap-4 mt-8">
          <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-400 text-xs font-mono">judicial-engine-v1.0</div>
          <div className="px-4 py-2 bg-emerald-50 rounded-lg text-emerald-600 text-xs font-mono font-bold">READY TO DEPLOY</div>
        </div>
      </div>
    </div>
  );
};

export default JudicialClassification;
