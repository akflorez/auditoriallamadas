import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mic2, 
  BarChart3, 
  Users2, 
  Settings2, 
  Sparkles,
  ChevronRight,
  LogOut,
  Gavel
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/audios', icon: Mic2, label: 'Bandeja de Audios' },
  { path: '/quality-matrix', icon: BarChart3, label: 'Matriz de Calidad' },
  { path: '/executives', icon: Users2, label: 'CRM Agentes' },
  { path: '/settings', icon: Settings2, label: 'Configuración' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('emdecob_auth');
    navigate('/login');
  };

  return (
    <aside className="w-72 bg-[#0a0f1a] text-slate-400 flex flex-col h-full border-r border-white/5 shadow-2xl hidden md:flex z-30 transition-all duration-300">
      {/* Brand Section */}
      <div className="h-20 flex items-center px-8 border-b border-white/5 relative bg-[#0d121f]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sparkles size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl tracking-tight font-outfit">EMDECOB</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] leading-none">Intelligence QA</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-8 px-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4 px-4">Plataforma</p>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center justify-between group px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-950/20" 
                    : "hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={cn("transition-colors", "text-slate-500 group-hover:text-slate-200")} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <ChevronRight size={14} className={cn("opacity-0 group-hover:opacity-40 transition-opacity")} />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 bg-[#0d121f] border-t border-white/5">
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-2xl p-4 border border-white/5 mb-4 group cursor-pointer hover:border-emerald-500/30 transition-all duration-300">
           <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 border border-white/10 shadow-inner overflow-hidden">
                   <img src="https://ui-avatars.com/api/?name=Admin&background=1e293b&color=10b981" alt="Avatar" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d121f]"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Admin Emdecob</span>
                <span className="text-[11px] text-slate-500">Super Admin</span>
              </div>
           </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 rounded-xl transition-all duration-200 cursor-pointer"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
