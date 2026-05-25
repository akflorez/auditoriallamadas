import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical,
  Activity,
  Award,
  Trash2,
  Camera,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const Agents: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [audios, setAudios] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [newAgent, setNewAgent] = useState({ nombre: '', foto: '', cargo: 'Asesor de Cobranzas' });

  const fetchData = async () => {
    try {
      const [settingsRes, audiosRes] = await Promise.all([
        axios.get('http://localhost:5000/api/settings'),
        axios.get('http://localhost:5000/api/audios')
      ]);
      setAgents(settingsRes.data.agentes || []);
      setAudios(audiosRes.data.audios || (Array.isArray(audiosRes.data) ? audiosRes.data : []));
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('name', newAgent.nombre || 'temp');
    
    try {
      setSaving(true);
      const res = await axios.post('http://localhost:5000/api/settings/upload-agent-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewAgent({ ...newAgent, foto: res.data.photoPath });
    } catch (e) {
      alert('Error al subir la imagen');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAgent = async () => {
    if (!newAgent.nombre) return alert('El nombre es obligatorio');
    setSaving(true);
    try {
      const res = await axios.get('http://localhost:5000/api/settings');
      const currentSettings = res.data;
      const updatedAgents = [
        ...(currentSettings.agentes || []),
        { ...newAgent, id: Date.now().toString() }
      ];
      await axios.post('http://localhost:5000/api/settings', {
        ...currentSettings,
        agentes: updatedAgents
      });
      setIsModalOpen(false);
      setNewAgent({ nombre: '', foto: '', cargo: 'Asesor de Cobranzas' });
      fetchData();
    } catch (e) {
      alert('Error al guardar asesor');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('¿Eliminar a este asesor de la base de datos?')) return;
    try {
      const res = await axios.get('http://localhost:5000/api/settings');
      const updatedAgents = (res.data.agentes || []).filter((a: any) => a.id !== id);
      await axios.post('http://localhost:5000/api/settings', {
        ...res.data,
        agentes: updatedAgents
      });
      fetchData();
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  const filteredAgents = agents.filter(a => 
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAgentScore = (name: string) => {
    const agentAudios = audios.filter(a => {
      if (a.executive !== name || a.score === null || !a.date) return false;
      const audioDate = new Date(a.date);
      const matchesMonth = selectedMonth === 'all' || audioDate.getMonth().toString() === selectedMonth;
      const matchesYear = selectedYear === 'all' || audioDate.getFullYear().toString() === selectedYear;
      return matchesMonth && matchesYear;
    });

    if (agentAudios.length === 0) return '--';
    const sum = agentAudios.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / agentAudios.length).toFixed(1);
  };

  const months = [
    { value: 'all', label: 'Todos los Meses' },
    { value: '0', label: 'Enero' }, { value: '1', label: 'Febrero' }, { value: '2', label: 'Marzo' },
    { value: '3', label: 'Abril' }, { value: '4', label: 'Mayo' }, { value: '5', label: 'Junio' },
    { value: '6', label: 'Julio' }, { value: '7', label: 'Agosto' }, { value: '8', label: 'Septiembre' },
    { value: '9', label: 'Octubre' }, { value: '10', label: 'Noviembre' }, { value: '11', label: 'Diciembre' }
  ];

  const years = ['all', '2024', '2025', '2026'];

  return (
    <>
      <div className="space-y-10 animate-slide-up pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-500">
             <Award size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Gestión de Capital Humano</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit uppercase">Directorio de <span className="text-emerald-500">Agentes</span></h1>
          <p className="text-slate-500 mt-2 font-medium max-w-lg">Base de datos centralizada de asesores para la identificación automática por IA y seguimiento de performance.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-premium btn-premium-emerald shadow-xl shadow-emerald-500/20"
        >
          <UserPlus size={18} /> Nuevo Asesor
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap gap-8">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Equipo</span>
              <span className="text-2xl font-black text-slate-800 font-outfit">{agents.length} Asesores</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Motor IA</span>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-sm font-bold text-emerald-600">Sincronizado</span>
              </div>
           </div>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
            >
              {years.map(y => <option key={y} value={y}>{y === 'all' ? 'Todos los Años' : y}</option>)}
            </select>

            <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Grid de Agentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="premium-card p-6 flex flex-col items-center text-center group hover:border-emerald-500/30 transition-all duration-500">
              <div className="relative mb-6">
                 <div className="w-24 h-24 rounded-[2rem] bg-slate-100 border-4 border-white shadow-2xl overflow-hidden group-hover:scale-110 transition-transform duration-500">
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
                <div className="absolute -bottom-2 right-0 w-8 h-8 rounded-full bg-slate-900 border-4 border-white text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                   <Activity size={14} />
                </div>
             </div>

             <div className="space-y-1">
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">{agent.nombre}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{agent.cargo}</p>
             </div>

             <div className="mt-8 w-full grid grid-cols-2 gap-px bg-slate-100 rounded-2xl border border-slate-100 overflow-hidden">
                <div className="bg-white p-3 flex flex-col items-center">
                   <span className="text-[9px] font-black text-slate-400 uppercase">Score Avg</span>
                   <span className="text-sm font-black text-emerald-600 font-outfit">{getAgentScore(agent.nombre)}%</span>
                </div>
                <div 
                  onClick={() => navigate(`/quality-matrix?agent=${encodeURIComponent(agent.nombre)}`)}
                  className="bg-white p-3 flex flex-col items-center text-slate-300 hover:text-emerald-500 cursor-pointer transition-colors"
                >
                   <ExternalLink size={18} />
                   <span className="text-[9px] font-black uppercase mt-1">Ver Perfil</span>
                </div>
             </div>

             <div className="mt-6 pt-4 border-t border-slate-50 w-full flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDeleteAgent(agent.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
                <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                  <Camera size={18} />
                </button>
             </div>
          </div>
        ))}
      </div>

      </div>

      {/* Modal Nueva Agente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
           {/* Backdrop con click para cerrar */}
           <div 
             className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
             onClick={() => setIsModalOpen(false)}
           ></div>
           
           {/* Modal Content */}
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] p-10 border border-slate-200 relative z-10">
              <h2 className="text-3xl font-black text-slate-900 font-outfit uppercase mb-8">Nuevo Asesor</h2>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo (Tal como se presenta en llamadas)</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all font-bold"
                      placeholder="Ej: ADRIANA JIMENEZ"
                      value={newAgent.nombre}
                      onChange={(e) => setNewAgent({ ...newAgent, nombre: e.target.value.toUpperCase() })}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                       <span>Cargar Foto de Perfil (Opcional)</span>
                       {newAgent.foto && <span className="text-emerald-500 font-bold">Imagen Lista ✓</span>}
                    </label>
                    <div className="flex items-center gap-4">
                       <input 
                         type="file" 
                         accept="image/*"
                         onChange={handleFileChange}
                         className="hidden"
                         id="agent-photo-upload"
                       />
                       <label 
                         htmlFor="agent-photo-upload"
                         className="flex-1 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-3 text-slate-400 hover:text-emerald-600"
                       >
                         <Camera size={20} />
                         <span className="text-xs font-black uppercase tracking-widest">{saving ? 'Subiendo...' : 'Seleccionar Imagen'}</span>
                       </label>
                    </div>
                    {newAgent.foto && (
                      <p className="text-[9px] text-slate-400 truncate italic">Ruta: {newAgent.foto}</p>
                    )}
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">O Pegar URL de Foto</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all font-bold text-xs"
                      placeholder="https://..."
                      value={newAgent.foto}
                      onChange={(e) => setNewAgent({ ...newAgent, foto: e.target.value })}
                    />
                 </div>

                 <div className="flex gap-4 pt-6">
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleAddAgent}
                      disabled={saving}
                      className="flex-1 px-6 py-4 bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Asesor'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Agents;
