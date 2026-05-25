import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  ChevronRight,
  Eye,
  EyeOff,
  Mail,
  Headphones,
  Shield,
  ShieldCheck
} from 'lucide-react';

// Custom SVG Icons matching EMDECOB QA design specifications exactly
const LogoHeadset: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Headband */}
    <path d="M 22 52 C 22 24, 78 24, 78 52" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
    {/* Earcups */}
    <rect x="13" y="44" width="10" height="22" rx="4.5" stroke="currentColor" strokeWidth="6" fill="currentColor" />
    <rect x="77" y="44" width="10" height="22" rx="4.5" stroke="currentColor" strokeWidth="6" fill="currentColor" />
    {/* Microphone */}
    <path d="M 18 62 C 18 78, 42 80, 48 74" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" fill="none" />
    <rect x="46" y="70" width="7" height="4" rx="2" fill="currentColor" />
    {/* Audio waves in center */}
    <line x1="38" y1="44" x2="38" y2="56" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
    <line x1="46" y1="36" x2="46" y2="64" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
    <line x1="54" y1="40" x2="54" y2="60" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
    <line x1="62" y1="45" x2="62" y2="55" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
  </svg>
);

const IconEvaluation: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Speech Bubble */}
    <path d="M 16 24 H 64 C 68.4 24, 72 27.6, 72 32 V 58 C 72 62.4, 68.4 66, 64 66 H 26 L 14 76 V 66 C 14 66, 12 66, 10 64 C 8 62, 8 60, 8 58 V 32 C 8 27.6, 11.6 24, 16 24 Z" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Message lines */}
    <line x1="20" y1="36" x2="48" y2="36" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" opacity="0.85" />
    <line x1="20" y1="48" x2="40" y2="48" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" opacity="0.85" />
    <line x1="20" y1="60" x2="32" y2="60" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" opacity="0.85" />
    
    {/* Magnifying Glass with Check mark inside */}
    <circle cx="68" cy="50" r="17" stroke="currentColor" strokeWidth="6.5" fill="white" />
    <line x1="80" y1="62" x2="92" y2="74" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    <path d="M 61 50 L 66 55 L 75 44" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const IconQuality: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Bars (rounded top corners) */}
    <rect x="14" y="58" width="10" height="18" rx="3.5" stroke="currentColor" strokeWidth="6.5" strokeLinejoin="round" />
    <rect x="28" y="44" width="10" height="32" rx="3.5" stroke="currentColor" strokeWidth="6.5" strokeLinejoin="round" />
    <rect x="42" y="30" width="10" height="46" rx="3.5" stroke="currentColor" strokeWidth="6.5" strokeLinejoin="round" />
    <rect x="56" y="16" width="10" height="60" rx="3.5" stroke="currentColor" strokeWidth="6.5" strokeLinejoin="round" />
    
    {/* Zigzag Arrow Line matching Image 2 */}
    <path d="M 12 52 L 35 34 L 54 36 L 80 18" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Arrow Head */}
    <path d="M 66 18 H 80 V 32" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const IconAI: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Left side: Organic Brain Folds */}
    <path d="M 50 18 C 36 18, 24 26, 24 40 C 24 45, 20 48, 18 52 C 15 58, 16 66, 22 71 C 26 74, 32 72, 36 76 C 40 80, 44 82, 50 82" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    
    <path d="M 50 32 C 40 32, 34 38, 34 44 C 34 48, 30 50, 30 54" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M 50 48 C 42 48, 38 52, 38 58 C 38 64, 44 68, 50 68" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M 28 42 C 28 50, 38 52, 40 60" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    
    {/* Right side: AI / Neural Network (Nodes & Circuits) */}
    <path d="M 50 18 C 64 18, 76 26, 76 40 C 76 45, 80 48, 82 52" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" fill="none" />
    <path d="M 50 82 C 58 82, 66 78, 70 72" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" fill="none" />

    {/* Circuit Lines */}
    <path d="M 50 32 L 68 26" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M 50 42 L 78 38" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M 50 52 L 82 56" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M 50 62 L 74 72" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M 50 72 L 62 78" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />

    {/* Secondary branching connections */}
    <path d="M 68 26 L 76 22" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M 78 38 L 86 46" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M 74 72 L 82 78" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />

    {/* Node Circles */}
    <circle cx="68" cy="26" r="4.5" fill="currentColor" />
    <circle cx="76" cy="22" r="4.5" fill="currentColor" />
    <circle cx="78" cy="38" r="4.5" fill="currentColor" />
    <circle cx="86" cy="46" r="4.5" fill="currentColor" />
    <circle cx="82" cy="56" r="4.5" fill="currentColor" />
    <circle cx="74" cy="72" r="4.5" fill="currentColor" />
    <circle cx="82" cy="78" r="4.5" fill="currentColor" />
    <circle cx="62" cy="78" r="4.5" fill="currentColor" />
  </svg>
);


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@emdecob.com' && password === 'admin123') {
      localStorage.setItem('emdecob_auth', 'true');
      navigate('/');
    } else {
      alert('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#ebf5fa] via-[#f3f9fc] to-[#f9fdfa] p-4 md:p-6 lg:p-8 select-none font-sans">
      
      {/* Central Login Container */}
      <div className="w-full max-w-[1100px] bg-white rounded-[2.5rem] shadow-[0_24px_60px_rgba(0,0,0,0.06)] border border-slate-100/80 flex flex-col lg:flex-row overflow-hidden min-h-[640px] lg:h-[700px] relative z-10">
        
        {/* Left Side: Brand & Visuals */}
        <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-[#ebfcf7] to-[#e7f5f9] p-10 lg:p-12 flex-col justify-between relative overflow-hidden">
          
          {/* SVG Background Patterns (Audio waves, charts, grids) */}
          <svg className="absolute inset-0 w-full h-full text-emerald-500/10 pointer-events-none" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16, 185, 129, 0.04)" strokeWidth="0.5" strokeDasharray="3 3"/>
              </pattern>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.12)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Waveform Bars on the left */}
            <line x1="10" y1="348" x2="10" y2="352" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="345" x2="20" y2="355" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="338" x2="30" y2="362" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3" strokeLinecap="round" />
            <line x1="40" y1="330" x2="40" y2="370" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="325" x2="50" y2="375" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="335" x2="60" y2="365" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3" strokeLinecap="round" />
            <line x1="70" y1="340" x2="70" y2="360" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3" strokeLinecap="round" />
            <line x1="80" y1="320" x2="80" y2="380" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="90" y1="290" x2="90" y2="410" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="100" y1="260" x2="100" y2="440" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="110" y1="300" x2="110" y2="400" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="120" y1="325" x2="120" y2="375" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="130" y1="335" x2="130" y2="365" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="140" y1="310" x2="140" y2="390" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="150" y1="270" x2="150" y2="430" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="160" y1="290" x2="160" y2="410" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="170" y1="330" x2="170" y2="370" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="180" y1="340" x2="180" y2="360" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="3" strokeLinecap="round" />
            <line x1="190" y1="325" x2="190" y2="375" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3" strokeLinecap="round" />
            <line x1="200" y1="315" x2="200" y2="385" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="3" strokeLinecap="round" />
            <line x1="210" y1="330" x2="210" y2="370" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="3" strokeLinecap="round" />
            <line x1="220" y1="342" x2="220" y2="358" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="3" strokeLinecap="round" />
            <line x1="230" y1="348" x2="230" y2="352" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="3" strokeLinecap="round" />

            {/* Connecting transition wave line */}
            <path d="M 230 350 Q 250 350 270 360 T 310 370 T 350 350" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Line chart transition with gradient fill */}
            <path d="M 350 350 C 365 350 375 365 380 370 C 400 390 430 430 450 410 C 470 390 500 330 520 350 C 540 370 570 410 590 390 C 610 370 640 280 660 300 C 680 320 710 350 730 330 C 750 310 780 260 800 240 L 800 500 L 350 500 Z" fill="url(#chartGradient)" />
            <path d="M 350 350 C 365 350 375 365 380 370 C 400 390 430 430 450 410 C 470 390 500 330 520 350 C 540 370 570 410 590 390 C 610 370 640 280 660 300 C 680 320 710 350 730 330 C 750 310 780 260 800 240" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            
            {/* Chart points */}
            <circle cx="450" cy="410" r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />
            <circle cx="520" cy="350" r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />
            <circle cx="590" cy="390" r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />
            <circle cx="660" cy="300" r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />
            <circle cx="730" cy="330" r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />
            <circle cx="800" cy="240" r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />
          </svg>

          {/* Decorative floating icons */}
          <div className="absolute right-[12%] top-[34%] text-[#a5e3d3]/30 pointer-events-none">
            <LogoHeadset className="w-48 h-48 opacity-25" />
          </div>
          <div className="absolute right-[18%] top-[54%] w-14 h-14 rounded-full border border-[#a5e3d3]/40 flex items-center justify-center text-[#a5e3d3]/50 pointer-events-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <rect x="9" y="3" width="6" height="12" rx="3" />
              <path d="M5 10c0 4.418 3.582 8 8 8s8-3.582 8-8" />
              <line x1="12" y1="18" x2="12" y2="21" />
            </svg>
          </div>

          {/* Top: Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#e6f7f0] flex items-center justify-center shadow-sm">
              <LogoHeadset className="w-8 h-8 text-[#0ea971] animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-outfit uppercase">
              EMDECOB <span className="text-[#0ea971] font-bold">CALL QA</span>
            </h2>
          </div>

          {/* Center: Hero Message */}
          <div className="relative z-10 my-auto py-8">
            <h1 className="text-4xl lg:text-[40px] font-extrabold text-[#1e293b] leading-[1.2] font-outfit tracking-tight mb-4 animate-slide-up">
              Centro Inteligente <br />
              de <span className="text-[#0ea971]">Calidad de Llamadas</span>
            </h1>
            <p className="text-slate-500 font-medium text-base max-w-sm leading-relaxed">
              Monitoreo, evaluación y análisis de interacciones para fortalecer la gestión operativa.
            </p>
          </div>

          {/* Bottom: Feature Cards */}
          <div className="relative z-10">
            <div className="grid grid-cols-3 gap-4 lg:gap-5 max-w-xl w-full">
              
              <div className="bg-white border border-slate-100 shadow-[0_10px_25px_rgba(0,0,0,0.02)] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2.5 transition-all hover:translate-y-[-4px] hover:shadow-[0_16px_35px_rgba(16,185,129,0.06)] group cursor-pointer w-full h-[124px] lg:h-[132px]">
                <div className="text-[#0ea971] transition-transform duration-300 group-hover:scale-110">
                  <IconEvaluation className="w-11 h-11 lg:w-12 lg:h-12" />
                </div>
                <p className="text-[13px] font-bold text-slate-700 leading-snug tracking-tight text-center">Evaluación <br />automática</p>
              </div>

              <div className="bg-white border border-slate-100 shadow-[0_10px_25px_rgba(0,0,0,0.02)] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2.5 transition-all hover:translate-y-[-4px] hover:shadow-[0_16px_35px_rgba(16,185,129,0.06)] group cursor-pointer w-full h-[124px] lg:h-[132px]">
                <div className="text-[#0ea971] transition-transform duration-300 group-hover:scale-110">
                  <IconQuality className="w-11 h-11 lg:w-12 lg:h-12" />
                </div>
                <p className="text-[13px] font-bold text-slate-700 leading-snug tracking-tight text-center">Indicadores <br />de calidad</p>
              </div>

              <div className="bg-white border border-slate-100 shadow-[0_10px_25px_rgba(0,0,0,0.02)] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2.5 transition-all hover:translate-y-[-4px] hover:shadow-[0_16px_35px_rgba(16,185,129,0.06)] group cursor-pointer w-full h-[124px] lg:h-[132px]">
                <div className="text-[#0ea971] transition-transform duration-300 group-hover:scale-110">
                  <IconAI className="w-11 h-11 lg:w-12 lg:h-12" />
                </div>
                <p className="text-[13px] font-bold text-slate-700 leading-snug tracking-tight text-center">Análisis <br />con IA</p>
              </div>

            </div>

            {/* Left Footer */}
            <div className="mt-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e6f7f0] flex items-center justify-center text-[#0ea971] shadow-sm">
                <ShieldCheck size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-500">
                  Desarrollado por <span className="text-[#0ea971] font-bold">EMDECOB</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                  Dirección de Analítica de Datos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-[48%] p-8 lg:p-12 flex flex-col justify-between bg-white overflow-y-auto">
          {/* Logo visible only on mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#e6f7f0] flex items-center justify-center text-[#0ea971] shadow-sm">
              <LogoHeadset className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight font-outfit uppercase">
              EMDECOB <span className="text-[#0ea971] font-bold">CALL QA</span>
            </h2>
          </div>

          <div className="my-auto max-w-[360px] mx-auto w-full space-y-8">
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight font-outfit">Bienvenido de nuevo</h3>
              <p className="text-slate-500 mt-2 font-medium text-sm">Ingresa a tu plataforma de monitoreo de calidad.</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Correo Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" strokeWidth={1.8} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#0ea971] focus:ring-2 focus:ring-[#0ea971]/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="usuario@emdecob.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-0.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contraseña</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" strokeWidth={1.8} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#0ea971] focus:ring-2 focus:ring-[#0ea971]/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                  </button>
                </div>
                <div className="flex justify-end pt-0.5">
                  <a href="#" className="text-[11px] font-bold text-[#0ea971] hover:text-emerald-700 transition-colors">¿Olvidaste tu clave?</a>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#0ea971] hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Lock size={15} strokeWidth={2} />
                  Ingresar al sistema
                  <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-3 text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full border border-slate-300"></span>
              </span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* SSO login */}
            <div>
              <button
                type="button"
                className="w-full py-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-blue-600 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm group"
              >
                <Shield size={16} className="text-blue-500" strokeWidth={2} />
                Acceder con SSO Corporativo
              </button>
            </div>
          </div>

          {/* TI Support footer */}
          <div className="mt-8 flex justify-center items-center gap-2 text-slate-400">
            <Headphones size={15} className="text-[#0ea971]" strokeWidth={2} />
            <p className="text-xs text-slate-500 font-medium">
              Soporte TI: <a href="mailto:sistemas@emdecob.com" className="text-blue-500 font-semibold hover:underline">sistemas@emdecob.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
