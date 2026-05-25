import React from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  Zap,
  Globe,
  HelpCircle,
  Command
} from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';

const Header: React.FC = () => {
  const [processing, setProcessing] = React.useState(false);

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await axios.post('http://localhost:5000/api/audios/process');
      
      // Start polling for completion
      const poll = setInterval(async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/audios');
          const audios = res.data.audios || res.data;
          const stillProcessing = audios.some((a: any) => a.status === 'PROCESSING' || a.status === 'PENDING');
          
          if (!stillProcessing) {
            clearInterval(poll);
            setProcessing(false);
            alert('¡Procesamiento completado! Todos los audios han sido analizados y los archivos están listos.');
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 3000);

    } catch (error) {
      console.error('Error starting process:', error);
      alert('Error al iniciar el procesamiento de audios.');
      setProcessing(false);
    }
  };

  return (
    <header className="h-20 glass-panel border-b border-slate-200/60 flex items-center justify-between px-8 z-20 sticky top-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-8 flex-1">
        <button className="md:hidden text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition-all">
          <Menu size={22} />
        </button>
        
        <div className="relative hidden lg:flex items-center w-full max-w-xl group">
          <Search className="absolute left-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Comando rápido (K)..." 
            className="w-full pl-12 pr-12 py-2.5 bg-slate-100/80 border-transparent rounded-2xl text-sm 
                     focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all duration-300"
          />
          <div className="absolute right-4 flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400">
            <Command size={10} /> K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="relative">
            <Globe size={14} className="text-blue-500" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
          </div>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Servidor en Línea</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button className="p-2.5 text-slate-400 hover:text-emerald-500 rounded-xl hover:bg-emerald-50 transition-all duration-300">
            <Zap size={20} />
          </button>
          <button className="p-2.5 text-slate-400 hover:text-emerald-500 rounded-xl hover:bg-emerald-50 transition-all duration-300 relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>
          <button className="p-2.5 text-slate-400 hover:text-emerald-500 rounded-xl hover:bg-emerald-50 transition-all duration-300">
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <button 
          onClick={handleProcess}
          disabled={processing}
          className="btn-premium btn-premium-emerald text-sm py-2 px-5 disabled:opacity-50"
        >
          <Zap size={16} className={cn("fill-current", processing && "animate-pulse")} />
          {processing ? 'Procesando...' : 'Procesar Ahora'}
        </button>
      </div>
    </header>
  );
};

export default Header;
