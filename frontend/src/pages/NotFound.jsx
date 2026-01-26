import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Home, 
  LogIn, 
  Ghost, 
  Search, 
  Zap,
  Power
} from "lucide-react";

function NotFound() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLoggedIn = user && user.email;

  const handleRedirect = () => {
    if (isLoggedIn) {
      navigate(user.role === "admin" ? "/dashboard" : "/home");
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030303] text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* --- CSS FOR GLITCH & RADAR ANIMATIONS --- */}
      <style>{`
        @keyframes radar-ping {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .animate-radar { animation: radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-glitch { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; animation-play-state: paused; }
        .group:hover .animate-glitch { animation-play-state: running; }
        @keyframes scanline { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
      `}</style>

      {/* 🌌 Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#030303] to-[#030303]"></div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.5)] animate-[scanline_3s_linear_infinite] z-20 pointer-events-none"></div>

      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl px-6 text-center">
        
        {/* 📡 THE RADAR SCANNER VISUAL */}
        <div className="relative mb-12 group cursor-default">
            {/* Ping Rings */}
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-radar"></div>
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-radar" style={{ animationDelay: "0.5s" }}></div>
            
            {/* Center Core */}
            <div className="relative w-40 h-40 bg-[#0A0A0C] border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.2)] z-10 group-hover:border-indigo-500/50 transition-colors duration-500">
                <div className="absolute inset-0 rounded-full border border-indigo-500/30 border-dashed animate-[spin_10s_linear_infinite]"></div>
                
                {/* The Ghost Icon */}
                <Ghost size={64} className="text-slate-400 group-hover:text-indigo-400 transition-colors duration-300 animate-bounce" />
                
                {/* Searching Badge */}
                <div className="absolute -bottom-4 bg-[#030303] border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 shadow-xl">
                    <Search size={12} className="text-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Searching...</span>
                </div>
            </div>
        </div>

        {/* 👾 404 GLITCH TEXT */}
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-800 mb-2 group relative inline-block">
            <span className="absolute inset-0 text-indigo-500 opacity-20 blur-[2px] animate-glitch" aria-hidden="true">404</span>
            <span className="relative">404</span>
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Signal Lost in Space
        </h2>
        
        <p className="text-slate-400 text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed">
            The page you are looking for has drifted into a black hole. We can't connect to this frequency.
        </p>

        {/* 🚀 ACTION CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            
            <button 
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0A0A0C] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/5 font-medium transition-all flex items-center justify-center gap-2 active:scale-95 group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>Go Back</span>
            </button>

            <button 
                onClick={handleRedirect}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                {!isLoggedIn ? <LogIn size={18} /> : user.role === "admin" ? <LayoutDashboard size={18} /> : <Home size={18} />}
                <span>
                    {!isLoggedIn ? "Initialize Login" : "Return to Base"}
                </span>
            </button>

        </div>

        {/* 🛑 EMERGENCY LOGOUT (Only if Logged In) */}
        {isLoggedIn && (
            <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                 <div className="flex items-center gap-4 px-5 py-3 rounded-full bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <p className="text-xs text-slate-500 font-mono">
                        User: <span className="text-slate-300">{user.email}</span>
                    </p>
                    <div className="w-[1px] h-4 bg-white/10 mx-2"></div>
                    <button 
                        onClick={() => { logout(); navigate("/login"); }}
                        className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <Power size={12} />
                        Reset
                    </button>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
}

export default NotFound;