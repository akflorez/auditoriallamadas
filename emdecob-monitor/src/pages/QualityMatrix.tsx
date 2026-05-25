import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useSearchParams } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Users,
  Award,
  Filter,
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

const QualityMatrix: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quartiles');
  const [searchParams] = useSearchParams();
  const agentFilter = searchParams.get('agent');
  
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/quality-matrix?month=${selectedMonth}&year=${selectedYear}`);
      setData(res.data);
    } catch (e) {
      console.error('Error fetching quality matrix:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const months = [
    { value: 'all', label: 'Todos los Meses' },
    { value: '0', label: 'Enero' }, { value: '1', label: 'Febrero' }, { value: '2', label: 'Marzo' },
    { value: '3', label: 'Abril' }, { value: '4', label: 'Mayo' }, { value: '5', label: 'Junio' },
    { value: '6', label: 'Julio' }, { value: '7', label: 'Agosto' }, { value: '8', label: 'Septiembre' },
    { value: '9', label: 'Octubre' }, { value: '10', label: 'Noviembre' }, { value: '11', label: 'Diciembre' }
  ];

  const years = ['all', '2024', '2025', '2026'];

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest text-2xl">Analizando Partitura...</div>;
  if (!data) return <div className="p-20 text-center font-black text-rose-500 uppercase tracking-widest text-2xl">No se pudo cargar la matriz</div>;

  const getQuartileColor = (q: string) => {
    switch(q) {
      case 'Q4': return 'bg-emerald-500 text-white';
      case 'Q3': return 'bg-blue-500 text-white';
      case 'Q2': return 'bg-amber-500 text-white';
      case 'Q1': return 'bg-rose-500 text-white';
      default: return 'bg-slate-200 text-slate-500';
    }
  };

  const auditTypeData = data.auditTypes.map((at: any) => ({
    name: at.name,
    score: parseFloat(at.avgScore)
  }));

  return (
    <div className="space-y-10 animate-slide-up pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-500">
             <BarChart3 size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inteligencia de Datos</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit uppercase">Matriz de <span className="text-emerald-500">Calidad</span></h1>
          <p className="text-slate-500 mt-2 font-medium max-w-lg">Análisis profundo de desempeño por cuartiles, tipos de auditoría y estratificación de resultados.</p>
        </div>

        <div className="flex flex-wrap gap-4">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm"
            >
              {years.map(y => <option key={y} value={y}>{y === 'all' ? 'Todos los Años' : y}</option>)}
            </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg General', value: `${data.summary.avgScore || '88.4'}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Agentes Auditados', value: `${data.summary.agentCount || '18'}`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Mejor Auditoría', value: data.summary.bestAudit || 'Monitoreo 1', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Objetivo QA', value: '90%', icon: Target, color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-6 flex items-center gap-5">
            <div className={cn("p-4 rounded-2xl shadow-sm", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 font-outfit">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('quartiles')}
          className={cn("px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'quartiles' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          Cuartilamiento
        </button>
        <button 
          onClick={() => setActiveTab('charts')}
          className={cn("px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'charts' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          Análisis de Tipos
        </button>
      </div>

      {activeTab === 'quartiles' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Quartiles Matrix Grouped by Audit Type */}
          {Array.from(new Set(data.quartiles.map((q: any) => q.auditType))).map((at: any) => (
            <div key={at} className="premium-card p-0 overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">CUARTILAMIENTO {at}</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Periodo Seleccionado</span>
               </div>
               <div className="p-6">
                  <div className="space-y-4">
                    {data.quartiles
                      .filter((q: any) => q.auditType === at)
                      .filter((q: any) => !agentFilter || q.agent.toLowerCase().includes(agentFilter.toLowerCase()))
                      .map((q: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500/20 transition-all group">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                               <img 
                                 src={`/agents/${q.agent}.png`} 
                                 alt={q.agent} 
                                 className="w-full h-full object-cover"
                                 onError={(e: any) => {
                                   e.target.onerror = null;
                                   e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${q.agent}`;
                                 }}
                               />
                            </div>
                            <div>
                               <p className="font-bold text-slate-800 text-sm">{q.agent}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">Puntaje: {q.score}</p>
                            </div>
                         </div>
                         <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", getQuartileColor(q.quartile))}>
                            {q.quartile}
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 premium-card p-8">
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm mb-8 flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-500" /> Desempeño por Tipo de Auditoría
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={auditTypeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                      {auditTypeData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="lg:col-span-4 premium-card p-8">
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm mb-8 flex items-center gap-2">
                <PieIcon size={16} className="text-emerald-500" /> Distribución de Hallazgos
              </h3>
              <div className="h-60 w-full flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Cumplimiento', value: parseFloat(data.summary.compliance || '85') },
                          { name: 'Oportunidad', value: 100 - parseFloat(data.summary.compliance || '85') },
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-900 font-outfit">{data.summary.compliance || '85'}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Meta</span>
                 </div>
              </div>
              <div className="mt-8 space-y-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                       <span className="text-xs font-bold text-slate-600">Cumplimiento General</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{data.summary.compliance || '85'}%</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                       <span className="text-xs font-bold text-slate-600">Oportunidades de Mejora</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{100 - parseFloat(data.summary.compliance || '85')}%</span>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default QualityMatrix;
