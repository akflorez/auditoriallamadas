import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  RefreshCw, 
  Download,
  Database,
  Zap,
  Calendar,
  Briefcase,
  User,
  Filter,
  MessageSquare,
  Plus,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

const AUDIT_TYPES = [
  'DIAGNÓSTICO',
  'MONITOREO 1',
  'MONITOREO 2',
  'MONITOREO 3',
  'MONITOREO 4',
  'FOCALIZADO',
  'IN SITU',
  'POSITIVOS'
];

const PORTAFOLIOS = [
  'EMPRESARIAL',
  'EFIGAS',
  'MIXTO',
  'PROPIEDAD HORIZONTAL',
  'FONDO NACIONAL DEL AHORRO'
];

const AudiosList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('agent') || '');
  const [syncing, setSyncing] = useState(false);
  const [audios, setAudios] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  
  // Upload States
  const [selectedAuditType, setSelectedAuditType] = useState('MONITOREO 1');
  const [selectedPortfolio, setSelectedPortfolio] = useState('EMPRESARIAL');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Manual WhatsApp States
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsappAgent, setWhatsappAgent] = useState('');
  const [whatsappPortfolio, setWhatsappPortfolio] = useState('EMPRESARIAL');
  const [whatsappAuditType, setWhatsappAuditType] = useState('MONITOREO 1');
  const [whatsappDate, setWhatsappDate] = useState(new Date().toISOString().split('T')[0]);
  const [whatsappTranscript, setWhatsappTranscript] = useState('');
  const [whatsappFile, setWhatsappFile] = useState<File | null>(null);
  const [whatsappRunAI, setWhatsappRunAI] = useState(false);
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);

  const handleCreateWhatsAppAudit = async () => {
    if (!whatsappRunAI && !whatsappAgent) {
      return alert('Por favor, selecciona un asesor.');
    }
    setSavingWhatsApp(true);
    try {
      const formData = new FormData();
      if (whatsappFile) {
        formData.append('file', whatsappFile);
      }
      formData.append('executive', whatsappAgent);
      formData.append('portfolio', whatsappPortfolio);
      formData.append('auditType', whatsappAuditType);
      formData.append('date', whatsappDate);
      formData.append('transcript', whatsappTranscript);
      formData.append('channel', 'WHATSAPP');
      formData.append('runAI', String(whatsappRunAI));

      await axios.post('http://localhost:5000/api/audios/create-manual', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Auditoría de WhatsApp registrada exitosamente.');
      setIsWhatsAppModalOpen(false);
      setWhatsappTranscript('');
      setWhatsappFile(null);
      setWhatsappRunAI(false);
      fetchData();
    } catch (e) {
      alert('Error al registrar la auditoría.');
    } finally {
      setSavingWhatsApp(false);
    }
  };

  const fetchData = async () => {
    try {
      const [auditsRes, settingsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/audios'),
        axios.get('http://localhost:5000/api/settings')
      ]);
      setAudios(auditsRes.data.audios || (Array.isArray(auditsRes.data) ? auditsRes.data : []));
      setAgents(settingsRes.data.agentes || []);
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const agent = searchParams.get('agent');
    if (agent) {
      setSearchTerm(agent);
    }
  }, [searchParams]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setSyncing(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('audio', files[i]);
        formData.append('auditType', selectedAuditType);
        formData.append('portfolio', selectedPortfolio);
        formData.append('agentId', selectedAgentId);
        formData.append('date', selectedDate);
        
        await axios.post('http://localhost:5000/api/audios/upload', formData);
      }
      alert(`${files.length} audio(s) cargado(s) exitosamente como [${selectedPortfolio}].`);
      fetchData();
    } catch (error) {
      alert('Error en la carga masiva.');
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkUpdate = async (field: string, value: string) => {
    if (selectedIds.length === 0) return alert('Selecciona llamadas primero.');
    setSyncing(true);
    try {
      await Promise.all(selectedIds.map(id => 
        axios.post(`http://localhost:5000/api/audios/update-metadata/${id}`, { [field]: value })
      ));
      alert('Actualización masiva completada.');
      setSelectedIds([]);
      fetchData();
    } catch (e) {
      alert('Error al actualizar en bloque.');
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkExport = async () => {
    if (selectedIds.length === 0) return alert('Selecciona llamadas primero.');
    try {
      setSyncing(true);
      const response = await axios.post(`http://localhost:5000/api/audios/bulk-export`, { ids: selectedIds }, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Auditoria_Masiva_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Error al exportar.');
    } finally {
      setSyncing(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setSyncing(true);
      const response = await axios.get(`http://localhost:5000/api/audios/export-all`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Consolidado_General_${new Date().toLocaleDateString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Error al exportar la base de datos.');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (audio: any) => {
    switch(audio.status) {
      case 'PROCESSED': 
        return audio.resultStatus === 'APROBADO' 
          ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-black rounded uppercase">Aprobado</span>
          : <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[9px] font-black rounded uppercase">No Aprobado</span>;
      case 'PROCESSING': return <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[9px] font-black rounded uppercase animate-pulse">Auditando...</span>;
      case 'ERROR': return <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded uppercase">Error</span>;
      default: return <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-black rounded uppercase">Pendiente</span>;
    }
  };

  const filteredAudios = audios.filter(a => 
    a.filename.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.executive || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.portfolio || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-slide-up pb-24">
      {/* Dynamic Sub-Header for Massive Upload Configuration */}
      <div className="premium-card p-8 border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-white">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
               <Calendar size={24} />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-900 font-outfit uppercase">Configuración de Carga Masiva</h2>
               <p className="text-xs text-slate-500 font-medium tracking-tight">Define los parámetros antes de subir tu bloque de audios.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Briefcase size={10}/> Portafolio Destino</label>
               <select 
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
               >
                 {PORTAFOLIOS.map(p => <option key={p} value={p}>{p}</option>)}
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Filter size={10}/> Tipo Auditoría</label>
               <select 
                value={selectedAuditType}
                onChange={(e) => setSelectedAuditType(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
               >
                 {AUDIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={10}/> Asignar Asesor</label>
               <select 
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
               >
                 <option value="">-- DETECCIÓN POR IA --</option>
                 {agents.map((a: any) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={10}/> Fecha Gestión</label>
               <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
               />
            </div>
         </div>

         <div className="mt-8 flex justify-end gap-4">
            <a 
              href="/plantilla_calidad.xlsx"
              download="Plantilla_Calidad_Base.xlsx"
              className="px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase tracking-[0.1em] text-xs hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-3"
            >
              <Download size={18} />
              Plantilla Base
            </a>
            <button 
              onClick={handleExportAll}
              className="px-6 py-4 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-[0.1em] text-xs shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-3"
            >
              <Database size={18} />
              Base de Datos
            </button>
            <button 
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-6 py-4 bg-emerald-100 text-emerald-700 font-black rounded-2xl uppercase tracking-[0.1em] text-xs hover:bg-emerald-200 active:scale-95 transition-all flex items-center gap-3"
            >
              <MessageSquare size={18} />
              Auditar WhatsApp
            </button>
            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleUpload} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={syncing}
              className="px-10 py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase tracking-[0.1em] text-xs shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-3"
            >
              <RefreshCw className={syncing ? "animate-spin" : ""} size={18} />
              {syncing ? 'Procesando Bloque...' : 'Iniciar Carga Masiva'}
            </button>
         </div>
      </div>

      <div className="premium-card overflow-hidden shadow-2xl">
        {/* Table Header / Bulk Toolbar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-6 justify-between items-center">
           <div className="flex items-center gap-6">
              {selectedIds.length > 0 ? (
                <div className="flex items-center gap-4 animate-in slide-in-from-left-4">
                   <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">{selectedIds.length} MARCADOS</span>
                   
                   <div className="h-8 w-px bg-slate-200"></div>
                   
                   <div className="flex items-center gap-2">
                      <Database size={14} className="text-slate-400" />
                      <button onClick={handleBulkExport} className="text-[10px] font-black text-emerald-600 hover:underline underline-offset-4">BASE DE DATOS</button>
                   </div>

                   <select 
                    onChange={(e) => handleBulkUpdate('portfolio', e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg text-[10px] font-bold px-2 py-1 outline-none"
                   >
                     <option value="">MOVER PORTAFOLIO...</option>
                     {PORTAFOLIOS.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>

                   <select 
                    onChange={(e) => handleBulkUpdate('auditType', e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg text-[10px] font-bold px-2 py-1 outline-none"
                   >
                     <option value="">MARCAR TIPO...</option>
                     {AUDIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                   </select>

                   <input 
                    type="date"
                    className="bg-white border border-slate-200 rounded-lg text-[10px] font-bold px-2 py-1 outline-none"
                    onChange={(e) => handleBulkUpdate('date', e.target.value)}
                   />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bandeja de Inteligencia Operativa</span>
                </div>
              )}
           </div>

           <div className="relative w-full lg:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar por nombre o portafolio..." 
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-400 font-bold border-b border-slate-100 uppercase tracking-widest text-[9px]">
              <tr>
                <th className="px-8 py-5">
                   <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-emerald-500" 
                    checked={selectedIds.length === filteredAudios.length && filteredAudios.length > 0}
                    onChange={() => selectedIds.length === filteredAudios.length ? setSelectedIds([]) : setSelectedIds(filteredAudios.map(a => a.id))}
                   />
                </th>
                <th className="px-6 py-5">Fecha</th>
                <th className="px-6 py-5">Portafolio</th>
                <th className="px-6 py-5">Asesor</th>
                <th className="px-6 py-5">Estado</th>
                <th className="px-6 py-5">Score</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAudios.map((audio) => (
                <tr key={audio.id} className={cn("group transition-all duration-300", selectedIds.includes(audio.id) ? "bg-emerald-50/30" : "hover:bg-slate-50/50")}>
                  <td className="px-8 py-6">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-emerald-500"
                      checked={selectedIds.includes(audio.id)}
                      onChange={() => setSelectedIds(prev => prev.includes(audio.id) ? prev.filter(i => i !== audio.id) : [...prev, audio.id])}
                    />
                  </td>
                  <td className="px-6 py-6 font-bold text-slate-500 tabular-nums">
                    {audio.date ? new Date(audio.date).toLocaleDateString('es-CO') : 'Manual'}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-tighter">
                        {audio.portfolio || 'PENDIENTE'}
                      </span>
                      {audio.channel === 'WHATSAPP' && (
                        <span className="px-2 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-lg uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                          <MessageSquare size={10} strokeWidth={2.5} /> WhatsApp
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
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
                       <span className="font-bold text-slate-700 text-xs">{audio.executive || 'Identificando...'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    {getStatusBadge(audio)}
                  </td>
                  <td className="px-6 py-6 font-black font-outfit text-lg">
                    {audio.score !== null ? `${audio.score}%` : '--'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => window.open(`http://localhost:5000/api/audios/download-template/${audio.id}`, '_blank')}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        title="Descargar Formato QA"
                      >
                        <Database size={16} />
                      </button>
                      <button 
                        onClick={() => navigate(`/audios/${audio.id}`)} 
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        title="Ver Detalle"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Auditoría WhatsApp */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
           {/* Backdrop con click para cerrar */}
           <div 
             className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
             onClick={() => setIsWhatsAppModalOpen(false)}
           ></div>
           
           {/* Modal Content */}
           <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] p-10 border border-slate-200 relative z-10 max-h-[90vh] overflow-y-auto animate-scale-up">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                    <MessageSquare size={24} />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 font-outfit uppercase">Auditoría WhatsApp</h2>
                    <p className="text-xs text-slate-500 font-medium">Registra y califica manualmente una interacción de chat de WhatsApp</p>
                 </div>
              </div>
              
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asesor Evaluado</label>
                      <select 
                        value={whatsappAgent}
                        onChange={(e) => setWhatsappAgent(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all font-bold text-xs"
                      >
                        <option value="">-- SELECCIONAR ASESOR --</option>
                        {agents.map((a: any) => <option key={a.id} value={a.nombre}>{a.nombre}</option>)}
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portafolio</label>
                      <select 
                        value={whatsappPortfolio}
                        onChange={(e) => setWhatsappPortfolio(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all font-bold text-xs"
                      >
                        {PORTAFOLIOS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Auditoría</label>
                      <select 
                        value={whatsappAuditType}
                        onChange={(e) => setWhatsappAuditType(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all font-bold text-xs"
                      >
                        {AUDIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Gestión</label>
                      <input 
                        type="date" 
                        value={whatsappDate}
                        onChange={(e) => setWhatsappDate(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all font-bold text-xs"
                      />
                   </div>
                 </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transcripción / Historial del Chat (Texto Manual)</label>
                     <textarea 
                       rows={3}
                       className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all text-xs font-semibold"
                       placeholder="Pega el contenido de la conversación de WhatsApp aquí si no subes un archivo..."
                       value={whatsappTranscript}
                       onChange={(e) => setWhatsappTranscript(e.target.value)}
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                       <span>Cargar Archivo de Chat (Imagen, Excel, TXT - Opcional)</span>
                       {whatsappFile && <span className="text-emerald-600 font-bold">Seleccionado: {whatsappFile.name} ✓</span>}
                     </label>
                     <input 
                       type="file" 
                       accept=".txt,.xlsx,.xls,.png,.jpg,.jpeg"
                       onChange={(e) => setWhatsappFile(e.target.files?.[0] || null)}
                       className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-xs"
                     />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-500/20">
                     <input 
                       type="checkbox" 
                       id="whatsappRunAI"
                       checked={whatsappRunAI}
                       onChange={(e) => setWhatsappRunAI(e.target.checked)}
                       className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                     />
                     <label htmlFor="whatsappRunAI" className="flex flex-col cursor-pointer select-none">
                       <span className="text-xs font-black text-emerald-900 uppercase">Calificar con Inteligencia Artificial (IA)</span>
                       <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Usa GPT-4o para extraer y auditar la conversación automáticamente</span>
                     </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button 
                       onClick={() => setIsWhatsAppModalOpen(false)}
                       className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                     >
                       Cancelar
                     </button>
                     <button 
                       onClick={handleCreateWhatsAppAudit}
                       disabled={savingWhatsApp}
                       className="flex-1 px-6 py-4 bg-emerald-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
                     >
                       {savingWhatsApp ? 'Registrando...' : 'Crear Auditoría'}
                     </button>
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const ExternalLink = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);

export default AudiosList;
