import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutGrid, Users, Briefcase, RefreshCw, 
  LogOut, Power, UserPlus, Activity, 
  Terminal, ShieldCheck, Cpu, Network,
  Search, Radio, Target, Lock, Scan, Server, Wifi 
} from "lucide-react";
import { useAuth } from "../context/authContext";
import api from "../api/axios";

export default function CommandDeck() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [agents, setAgents] = useState([]);
  const [sysStats, setSysStats] = useState({ ping: 12, mem: 40 });
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  // 🎨 THEME ENGINE
  const theme = {
    border: isAdmin ? "border-rose-500/20" : "border-cyan-500/20",
    shadow: isAdmin ? "shadow-[0_0_60px_-15px_rgba(225,29,72,0.3)]" : "shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)]",
    icon: isAdmin ? "text-rose-500" : "text-cyan-500",
    caret: isAdmin ? "caret-rose-500" : "caret-cyan-500",
    
    sysActive: isAdmin ? "bg-rose-500/10 text-rose-100 border-l-rose-500" : "bg-cyan-500/10 text-cyan-100 border-l-cyan-500",
    spyActive: "bg-amber-500/10 text-amber-100 border-l-amber-500",
    critActive: "bg-red-900/20 text-red-100 border-l-red-500"
  };

  // 🕵️‍♂️ FETCH AGENTS
  useEffect(() => {
    if (isAdmin && open) {
        const fetchAgents = async () => {
            try {
                const res = await api.get("/auth/users");
                setAgents(res.data.filter(u => u.role !== 'admin'));
            } catch (error) { console.error("Failed to load agents"); }
        };
        fetchAgents();
    }
  }, [isAdmin, open]);

  // 🛠️ COMMANDS GENERATION
  const allCommands = useMemo(() => {
    const sys = [
      isAdmin 
      ? { id: "dash", label: "Dashboard", icon: <LayoutGrid size={16} />, action: () => navigate("/dashboard"), meta: { type: "View" }, cat: "sys" }
      : { id: "home", label: "Home Base", icon: <LayoutGrid size={16} />, action: () => navigate("/home"), meta: { type: "View" }, cat: "sys" },
      { id: "pipe", label: "Pipeline", icon: <Briefcase size={16} />, action: () => navigate("/pipeline"), meta: { type: "Kanban" }, cat: "sys" },
      { id: "cont", label: "Contacts", icon: <Users size={16} />, action: () => navigate("/contacts"), meta: { type: "Database" }, cat: "sys" },
      isAdmin 
      ? { id: "team", label: "Team Mgmt", icon: <UserPlus size={16} />, action: () => navigate("/settings", { state: { activeTab: "team" } }), meta: { type: "Config" }, cat: "sys" }
      : { id: "stats", label: "My Stats", icon: <Activity size={16} />, action: () => navigate("/settings", { state: { activeTab: "achievements" } }), meta: { type: "Stats" }, cat: "sys" },
      { id: "refresh", label: "Reboot", icon: <RefreshCw size={16} />, action: () => window.location.reload(), meta: { type: "Func" }, cat: "sys" },
      { id: "logout", label: "Disconnect", icon: <Power size={16} />, action: () => logout(), meta: { type: "Kill" }, cat: "crit" }
    ];

    const spies = isAdmin ? agents.map(a => ({
        id: `spy-${a._id}`,
        label: a.name,
        sub: a.email, // 🔥 ADDED EMAIL HERE
        icon: <Radio size={16} />,
        action: () => navigate("/home", { state: { viewAs: a._id, agentName: a.name } }),
        meta: { path: `/terminal/${a.name.toLowerCase().replace(/\s/g, '_')}`, access: "Override", type: "Monitor" },
        cat: "spy"
    })) : [];

    return { sys, spies, flat: [...sys, ...spies] };
  }, [isAdmin, navigate, logout, agents]);

  // 🔍 FILTERING
  const filtered = useMemo(() => {
    if (!query) return allCommands;
    const lowerQ = query.toLowerCase();
    const filterFn = c => c.label.toLowerCase().includes(lowerQ) || (c.sub && c.sub.toLowerCase().includes(lowerQ));
    return {
        sys: allCommands.sys.filter(filterFn),
        spies: allCommands.spies.filter(filterFn),
        flat: allCommands.flat.filter(filterFn)
    };
  }, [query, allCommands]);

  // ⌨️ CONTROLS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") setOpen(false);
      if (open) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex(i => (i + 1) % filtered.flat.length);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex(i => (i - 1 + filtered.flat.length) % filtered.flat.length);
        }
        if (e.key === "Enter") {
          e.preventDefault();
          const item = filtered.flat[selectedIndex];
          if (item) { item.action(); setOpen(false); }
        }
      }
    };
    
    const interval = setInterval(() => {
        setSysStats({ ping: Math.floor(Math.random() * 20) + 10, mem: Math.floor(Math.random() * 15) + 30 });
    }, 2000);

    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); clearInterval(interval); };
  }, [open, filtered, selectedIndex]);

  if (!open) return null;

  const activeItem = filtered.flat[selectedIndex];
  const isSpyActive = activeItem?.cat === "spy";
  const isCritActive = activeItem?.cat === "crit";

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setOpen(false)}>
      
      {/* 🔮 MAIN HUD CONTAINER (Dynamic Width based on Role) */}
      <div 
        className={`w-full bg-[#08080a] border rounded-3xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200 shadow-2xl ${theme.border} ${theme.shadow} ${isAdmin ? 'max-w-5xl' : 'max-w-2xl'}`} // 🔥 User view is now thinner (max-w-2xl)
        onClick={e => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="flex items-center px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <Search size={20} className={`mr-4 ${theme.icon} opacity-80`} />
            <input 
                autoFocus
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                placeholder={isAdmin ? "System control or neural link..." : "Enter command..."}
                className={`flex-1 bg-transparent text-xl text-white outline-none font-sans placeholder:text-slate-700 tracking-wide ${theme.caret}`}
            />
            <div className="flex gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">
               <span className="flex items-center gap-1"><Cpu size={12}/> {sysStats.mem}%</span>
               <span className="flex items-center gap-1"><Network size={12}/> {sysStats.ping}ms</span>
            </div>
        </div>

        {/* 🪟 LAYOUT GRID */}
        <div className="flex h-[450px]">
            
            {/* COL 1: SYSTEM CORE */}
            <div className={`${isAdmin ? 'w-[25%]' : 'w-[40%]'} border-r border-white/5 bg-[#0A0A0C] flex flex-col`}>
                <div className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5">
                    <Server size={12}/> System Core
                </div>
                <div className="p-2 overflow-y-auto custom-scrollbar flex-1 space-y-1">
                    {filtered.sys.map((item) => {
                        const globalIndex = filtered.flat.indexOf(item);
                        const isActive = globalIndex === selectedIndex;
                        const isCrit = item.cat === "crit";

                        return (
                            <div 
                                key={item.id}
                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                onClick={() => { item.action(); setOpen(false); }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border-l-2 ${
                                    isActive 
                                    ? (isCrit ? theme.critActive : theme.sysActive) 
                                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                }`}
                            >
                                {item.icon}
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* COL 2: SURVEILLANCE GRID (Admin Only) */}
            {isAdmin && (
                <div className="w-[35%] border-r border-white/5 bg-[#050505] flex flex-col relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                    
                    <div className="px-4 py-3 text-[10px] font-bold text-amber-500/80 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 relative z-10">
                        <Scan size={12}/> Active Agents
                    </div>
                    
                    <div className="p-2 overflow-y-auto custom-scrollbar flex-1 space-y-1 relative z-10">
                        {filtered.spies.length > 0 ? filtered.spies.map((item) => {
                            const globalIndex = filtered.flat.indexOf(item);
                            const isActive = globalIndex === selectedIndex;

                            return (
                                <div 
                                    key={item.id}
                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                    onClick={() => { item.action(); setOpen(false); }}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all border-l-2 ${
                                        isActive 
                                        ? theme.spyActive 
                                        : "border-transparent text-slate-500 hover:text-amber-500 hover:bg-amber-500/5"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="shrink-0">{item.icon}</div>
                                        <div className="min-w-0">
                                            <span className="text-sm font-medium block truncate">{item.label}</span>
                                            {/* 🔥 SHOWING EMAIL HERE */}
                                            <span className="text-[10px] text-slate-500 font-mono block truncate opacity-70 group-hover:opacity-100">{item.sub}</span>
                                        </div>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></div>}
                                </div>
                            );
                        }) : (
                            <div className="text-center py-10 text-slate-600 text-xs">No active agents found.</div>
                        )}
                    </div>
                </div>
            )}

            {/* COL 3: DETAILS & PREVIEW */}
            <div className={`flex-1 relative flex flex-col p-8 transition-colors duration-500 overflow-hidden ${isAdmin ? 'bg-[#020202]' : 'bg-[#050505]'}`}>
                
                {/* Visual Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none"></div>
                {isSpyActive && <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none"></div>}
                {isCritActive && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>}

                {activeItem ? (
                    <div className="relative z-10 h-full flex flex-col justify-between animate-in slide-in-from-right-4 duration-300">
                        <div>
                            <div className={`mb-6 p-4 rounded-2xl w-fit border bg-white/5 ${
                                isSpyActive ? "text-amber-400 border-amber-500/30" : isCritActive ? "text-red-500 border-red-500/30" : `${theme.icon} ${theme.border}`
                            } drop-shadow-[0_0_15px_currentColor]`}>
                                {isSpyActive ? <Target size={32} className="animate-pulse"/> : activeItem.icon}
                            </div>
                            
                            <h3 className={`text-2xl font-bold mb-1 tracking-tight text-white`}>{activeItem.label}</h3>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                {activeItem.meta?.path || "System Action"}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 border-t border-white/5 pt-6">
                            {isSpyActive && (
                                <div className="flex items-center gap-2 text-[10px] text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20 mb-2 font-mono">
                                    <Wifi size={12} className="animate-pulse"/> ESTABLISHING REMOTE LINK...
                                </div>
                            )}
                            <DetailRow label="TYPE" value={activeItem.meta?.type} />
                            <DetailRow label="ACCESS" value={activeItem.meta?.access || "Restricted"} />
                        </div>

                        <div className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-colors mt-auto ${
                            isCritActive ? 'border-red-500/50 bg-red-950/30 text-red-400' :
                            isSpyActive ? 'border-amber-500/50 bg-amber-950/30 text-amber-400' :
                            'border-white/10 text-slate-400 bg-white/5'
                        }`}>
                            <span className="opacity-70">{isSpyActive ? "INTERCEPT" : "EXECUTE"}</span>
                            <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-sans">↵</kbd>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-700 text-xs font-bold uppercase tracking-widest">
                        <Terminal size={16} className="mr-2"/> Awaiting Input
                    </div>
                )}
            </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-2.5 bg-[#030303] border-t border-white/5 flex justify-between items-center text-[9px] font-medium text-slate-600 font-mono">
            <span className="flex items-center gap-2 uppercase tracking-wide"><ShieldCheck size={10} className={theme.icon}/> Encrypted Connection</span>
            <span className="uppercase tracking-wide opacity-50">UID: {user?._id?.slice(-6).toUpperCase()}</span>
        </div>

      </div>
    </div>
  );
}

// Detail Row Component
const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-mono text-slate-300 opacity-90">{value}</span>
    </div>
);