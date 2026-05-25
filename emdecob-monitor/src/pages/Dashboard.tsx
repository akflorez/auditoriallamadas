import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Activity,
  Microscope,
  ArrowUpRight,
  MoreVertical,
  Trophy,
  Crown,
  X,
  ExternalLink,
  Medal
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const mockChartData = [
  { name: 'Lun', evaluados: 45, score: 82 },
  { name: 'Mar', evaluados: 52, score: 85 },
  { name: 'Mie', evaluados: 38, score: 81 },
  { name: 'Jue', evaluados: 65, score: 89 },
  { name: 'Vie', evaluados: 48, score: 84 },
  { name: 'Sab', evaluados: 32, score: 88 },
  { name: 'Dom', evaluados: 25, score: 92 },
];

const mockBarData = [
  { name: 'Precisi.', val: 94 },
  { name: 'Manejo', val: 78 },
  { name: 'Fluidez', val: 88 },
  { name: 'Cierre', val: 72 },
  { name: 'Objec.', val: 65 },
];

const StatCard = ({ title, value, icon: Icon, trend, color, subtitle }: any) => (
  <div className="premium-card p-6 flex flex-col group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-[0.03] -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
    
    <div className="flex items-center justify-between mb-6">
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} bg-opacity-10 shadow-sm border border-white/50`}>
        <Icon size={24} className="text-current" />
      </div>
      <button className="text-slate-300 hover:text-slate-600 transition-colors">
        <MoreVertical size={18} />
      </button>
    </div>
    
    <div className="flex flex-col">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
      <div className="flex items-baseline gap-3">
        <h2 className="text-3xl font-extrabold text-slate-800 font-outfit">{value}</h2>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${trend > 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
            <ArrowUpRight size={12} strokeWidth={3} className={trend < 0 ? "rotate-90" : ""} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-500 mt-2 font-medium">{subtitle}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isRankingsOpen, setIsRankingsOpen] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [audios, setAudios] = useState<any[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);

  const fetchRankingsData = async () => {
    try {
      setLoadingRankings(true);
      const [settingsRes, audiosRes] = await Promise.all([
        axios.get('http://localhost:5000/api/settings'),
        axios.get('http://localhost:5000/api/audios')
      ]);
      setAgents(settingsRes.data.agentes || []);
      setAudios(audiosRes.data.audios || (Array.isArray(audiosRes.data) ? audiosRes.data : []));
    } catch (e) {
      console.error('Error fetching rankings data:', e);
    } finally {
      setLoadingRankings(false);
    }
  };

  useEffect(() => {
    fetchRankingsData();
  }, []);

  const getAgentAverageScore = (name: string) => {
    const agentAudios = audios.filter(a => a.executive === name && a.score !== null && a.score !== undefined);
    if (agentAudios.length === 0) return null;
    const sum = agentAudios.reduce((acc, curr) => acc + Number(curr.score), 0);
    return sum / agentAudios.length;
  };

  const rankedAgents = agents
    .map(agent => {
      const avg = getAgentAverageScore(agent.nombre);
      return {
        ...agent,
        avgScore: avg,
        displayScore: avg !== null ? `${avg.toFixed(1)}%` : '--'
      };
    })
    .sort((a, b) => {
      if (a.avgScore === null && b.avgScore === null) return 0;
      if (a.avgScore === null) return 1;
      if (b.avgScore === null) return -1;
      return b.avgScore - a.avgScore;
    });

  const top1 = rankedAgents[0] || null;
  const top2 = rankedAgents[1] || null;
  const top3 = rankedAgents[2] || null;
  const remainingAgents = rankedAgents.slice(3);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-emerald-500/20">Plataforma Auditiva</span>
            <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v2.4.0 Premium</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit">Control de Calidad <span className="text-emerald-500">IA</span></h1>
          <p className="text-slate-500 mt-2 font-medium max-w-lg">Bienvenido al centro de inteligencia operativa de EMDECOB. Monitorea el desempeño de tus ejecutivos en tiempo real.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-premium bg-white text-slate-700 border border-slate-200">
             Exportar Reporte
          </button>
          <button 
            onClick={() => setIsRankingsOpen(true)}
            className="btn-premium btn-premium-emerald shadow-lg shadow-emerald-500/10"
          >
             Ver Rankings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Procesados" value="2,842" icon={CheckCircle2} trend={14.2} color="from-emerald-600 to-emerald-400 text-emerald-600" subtitle="↑ 12% vs mes anterior" />
        <StatCard title="Pendientes" value="48" icon={Clock} color="from-amber-600 to-amber-400 text-amber-600" subtitle="Tiempo medio: 12m" />
        <StatCard title="Promedio Score" value="88.4%" icon={Activity} trend={2.1} color="from-blue-600 to-blue-400 text-blue-600" subtitle="Meta corporativa: 85%" />
        <StatCard title="Alertas Críticas" value="03" icon={AlertCircle} trend={-15} color="from-rose-600 to-rose-400 text-rose-600" subtitle="↓ Mejora en cierre" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Chart */}
        <div className="premium-card p-8 xl:col-span-2">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-bold text-slate-900 text-lg font-outfit">Historial de Calidad</h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Volumen de llamadas vs efectividad semanal</p>
            </div>
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-white shadow-sm rounded-lg">7 Días</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">30 Días</button>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvaluados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="evaluados" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorEvaluados)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="premium-card p-8 flex flex-col">
          <h3 className="font-bold text-slate-900 text-lg font-outfit mb-2">KPIs por Capacidad</h3>
          <p className="text-sm text-slate-500 font-medium mb-10">Debilidades detectadas por la IA</p>
          
          <div className="flex-1 w-full flex flex-col justify-between">
            {mockBarData.map((item, idx) => (
               <div key={idx} className="space-y-2">
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{item.name}</span>
                    <span className="text-sm font-black text-slate-900">{item.val}%</span>
                 </div>
                 <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${item.val > 80 ? 'from-emerald-500 to-emerald-400' : item.val > 70 ? 'from-blue-500 to-blue-400' : 'from-amber-500 to-amber-400'}`} 
                      style={{ width: `${item.val}%` }}
                    ></div>
                 </div>
               </div>
            ))}
            
            <div className="mt-10 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
               <div className="flex items-center gap-3">
                  <Microscope className="text-emerald-600" size={20} />
                  <div>
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Hallazgo Principal</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-medium">Se detecta una caída en el <strong>Manejo de Objeciones</strong> en el segmento de Mora Temprana.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Modal */}
      {isRankingsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          {/* Backdrop con click para cerrar */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsRankingsOpen(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 w-full max-w-4xl rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.15)] p-6 md:p-10 relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="text-amber-400 animate-pulse" size={18} />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Cuadro de Honor</span>
                </div>
                <h2 className="text-3xl font-black text-white font-outfit uppercase font-semibold">Ranking de Asesores</h2>
                <p className="text-xs text-slate-400 font-medium">Los mejores puntajes de calidad y desempeño en llamadas</p>
              </div>
              <button 
                onClick={() => setIsRankingsOpen(false)}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all duration-300 shadow-md"
              >
                <X size={20} />
              </button>
            </div>

            {loadingRankings ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <span className="text-slate-400 text-sm font-semibold">Cargando clasificaciones...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-8 pr-2">
                {/* Podium */}
                {rankedAgents.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-stretch md:items-end justify-center gap-6 py-6 border-b border-slate-800/40">
                    {/* 2nd Place */}
                    {top2 && (
                      <div className="order-2 md:order-1 flex-1 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 hover:border-slate-400/40 group">
                        <div className="absolute top-0 inset-x-0 h-1 bg-slate-400"></div>
                        <div className="w-16 h-16 rounded-[1.2rem] bg-slate-800 border-2 border-slate-400 shadow-lg overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={top2.foto || `/agents/${top2.nombre}.png`} 
                            alt={top2.nombre}
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${top2.nombre}`;
                            }}
                          />
                        </div>
                        <div className="absolute top-4 right-4 bg-slate-400/25 text-slate-300 rounded-xl p-1.5 flex items-center justify-center">
                          <Medal size={16} className="text-slate-300" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">#2 Asesor</span>
                        <h3 className="font-bold text-white text-base truncate w-full px-2 uppercase font-outfit">{top2.nombre}</h3>
                        <p className="text-[9px] text-slate-500 font-semibold mb-4 uppercase">{top2.cargo}</p>
                        <div className="w-full bg-slate-800/40 py-2.5 rounded-2xl border border-slate-800/60">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Score Avg</span>
                          <span className="text-lg font-black text-slate-300 font-outfit">{top2.displayScore}</span>
                        </div>
                      </div>
                    )}

                    {/* 1st Place */}
                    {top1 && (
                      <div className="order-1 md:order-2 flex-grow-[1.2] bg-gradient-to-b from-amber-500/10 to-slate-900/80 border-2 border-amber-500/30 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 hover:border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.12)] group transform md:-translate-y-4">
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-600 to-amber-400"></div>
                        <div className="w-20 h-20 rounded-[1.5rem] bg-slate-800 border-4 border-amber-500/40 shadow-2xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={top1.foto || `/agents/${top1.nombre}.png`} 
                            alt={top1.nombre}
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${top1.nombre}`;
                            }}
                          />
                        </div>
                        <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-400 rounded-xl p-2 flex items-center justify-center animate-bounce">
                          <Crown size={20} className="text-amber-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">#1 Líder de Calidad</span>
                        <h3 className="font-black text-white text-lg truncate w-full px-2 uppercase font-outfit">{top1.nombre}</h3>
                        <p className="text-[9px] text-amber-500/70 font-semibold mb-4 uppercase">{top1.cargo}</p>
                        <div className="w-full bg-amber-500/10 py-3 rounded-2xl border border-amber-500/20">
                          <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block">Score Avg</span>
                          <span className="text-2xl font-black text-amber-400 font-outfit">{top1.displayScore}</span>
                        </div>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {top3 && (
                      <div className="order-3 md:order-3 flex-1 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 hover:border-amber-700/40 group">
                        <div className="absolute top-0 inset-x-0 h-1 bg-amber-700"></div>
                        <div className="w-16 h-16 rounded-[1.2rem] bg-slate-800 border-2 border-amber-700 shadow-lg overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={top3.foto || `/agents/${top3.nombre}.png`} 
                            alt={top3.nombre}
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${top3.nombre}`;
                            }}
                          />
                        </div>
                        <div className="absolute top-4 right-4 bg-amber-700/20 text-amber-600 rounded-xl p-1.5 flex items-center justify-center">
                          <Trophy size={16} className="text-amber-600" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">#3 Asesor</span>
                        <h3 className="font-bold text-white text-base truncate w-full px-2 uppercase font-outfit">{top3.nombre}</h3>
                        <p className="text-[9px] text-slate-500 font-semibold mb-4 uppercase">{top3.cargo}</p>
                        <div className="w-full bg-slate-800/40 py-2.5 rounded-2xl border border-slate-800/60">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Score Avg</span>
                          <span className="text-lg font-black text-amber-600 font-outfit">{top3.displayScore}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-slate-800/60">
                    <span className="text-slate-500 font-semibold">No hay datos de asesores registrados.</span>
                  </div>
                )}

                {/* Remaining List */}
                {remainingAgents.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Resto de Asesores</h3>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {remainingAgents.map((agent, index) => (
                        <div 
                          key={agent.id}
                          className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800/40 rounded-2xl hover:border-slate-700/80 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <span className="w-6 text-center text-xs font-black text-slate-500">#{index + 4}</span>
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60">
                              <img 
                                src={agent.foto || `/agents/${agent.nombre}.png`} 
                                alt={agent.nombre}
                                className="w-full h-full object-cover"
                                onError={(e: any) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.nombre}`;
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm uppercase font-outfit">{agent.nombre}</h4>
                              <p className="text-[9px] text-slate-500 font-semibold uppercase">{agent.cargo}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Score Avg</span>
                              <span className={`text-sm font-black font-outfit ${agent.avgScore !== null ? (agent.avgScore >= 85 ? 'text-emerald-400' : agent.avgScore >= 75 ? 'text-blue-400' : 'text-amber-500') : 'text-slate-400'}`}>
                                {agent.displayScore}
                              </span>
                            </div>
                            <button 
                              onClick={() => {
                                setIsRankingsOpen(false);
                                navigate(`/quality-matrix?agent=${encodeURIComponent(agent.nombre)}`);
                              }}
                              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-all"
                            >
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
