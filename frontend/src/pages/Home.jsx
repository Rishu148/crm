import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/authContext";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  PieChart, Pie, Legend
} from "recharts";
import { 
  LayoutGrid, Phone, MessageCircle, Mail,
  CheckCircle, Clock, Briefcase, TrendingUp, Filter,
  Calendar, X, ChevronRight, Globe, Hash, Zap, Trophy, Loader2, ArrowRight, ArrowUpRight, Eye
} from "lucide-react";



function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [greeting, setGreeting] = useState("Welcome");
  
  // 🕵️‍♂️ SPY LOGIC VARIABLES
  const viewAsId = location.state?.viewAs; 
  const viewAsName = location.state?.agentName;
  const isSpying = !!viewAsId; // Boolean flag

  // Data States
  const [activeLeads, setActiveLeads] = useState([]);
  const [recentWins, setRecentWins] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, won: 0, conversion: 0 });
  const [chartData, setChartData] = useState([]); 
  const [sourceData, setSourceData] = useState([]); 
  
  // UI States
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redirect Admin if no ID provided
  useEffect(() => {
    if (user?.role === 'admin' && !viewAsId) {
        navigate("/dashboard", { replace: true });
    }
  }, [user, viewAsId, navigate]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const fetchData = useCallback(async () => {
    // 🔥 TARGET ID LOGIC: Either ViewAs (Spy) or Self
    const targetId = viewAsId || user?._id || user?.id;
    
    if (!targetId) {
       if (user === null) setLoading(false); 
       return;
    }

    try {
      setLoading(true); // Ensure loading state while switching views
      const res = await api.get("/leads");
      const allLeads = res.data;

      const userLeads = allLeads.filter(lead => {
          const leadAgentId = lead.assignedTo?._id || lead.assignedTo?.id;
          return leadAgentId === targetId; // Filter by Target ID
      });
      
      const active = userLeads.filter(l => ['New', 'Contacted', 'Interested'].includes(l.status));
      const closed = userLeads.filter(l => l.status === 'Closed');
      
      const sortedActive = active.sort((a, b) => {
          const priority = { 'New': 3, 'Interested': 2, 'Contacted': 1 };
          return priority[b.status] - priority[a.status] || new Date(b.updatedAt) - new Date(a.updatedAt);
      });

      setActiveLeads(sortedActive);
      setRecentWins(closed);
      
      const total = userLeads.length;
      const winRate = total > 0 ? Math.round((closed.length / total) * 100) : 0;
      
      setStats({ total, active: active.length, won: closed.length, conversion: winRate });

      const stages = ['New', 'Contacted', 'Interested', 'Closed'];
      setChartData(stages.map(stage => ({ 
          name: stage, 
          count: userLeads.filter(l => l.status === stage).length,
          fill: stage === 'Closed' ? '#10b981' : '#6366f1'
      })));

      const sources = userLeads.reduce((acc, lead) => { 
          acc[lead.source] = (acc[lead.source] || 0) + 1; 
          return acc; 
      }, {});
      setSourceData(Object.keys(sources).map(key => ({ name: key, value: sources[key] })));

    } catch (error) {
        console.error("Home Data Error:", error);
    } finally {
        setLoading(false);
    }
  }, [user, viewAsId]); // Depend on viewAsId

  useEffect(() => { 
      fetchData(); 
  }, [fetchData]);

  const handleBackdropClick = (e) => {
      if (e.target.id === "modal-backdrop") setSelectedLead(null);
  };

  const handleStatusUpdate = async (newStatus) => {
      if(!selectedLead) return;
      try {
          const updatedLead = { ...selectedLead, status: newStatus };
          setSelectedLead(updatedLead); 
          setActiveLeads(prev => prev.map(l => (l._id || l.id) === (selectedLead._id || selectedLead.id) ? updatedLead : l));
          
          const leadId = selectedLead._id || selectedLead.id;
          await api.put(`/leads/${leadId}`, { status: newStatus });
          fetchData(); 
      } catch (error) { console.error("Update failed"); }
  };

  const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  if (loading) return <HomeSkeleton />;

  return (
    <div className="min-h-screen bg-[#030303] text-slate-300 font-sans selection:bg-indigo-500/30 pb-12 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#0F0F12] border border-white/10 flex items-center justify-center shadow-inner">
                <LayoutGrid size={20} className="text-indigo-500" />
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">Sales<span className="text-indigo-500">CRM</span></h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">Agent Workspace</p>
            </div>
        </div>
        
        <div onClick={() => navigate("/settings")} className="flex items-center gap-4 cursor-pointer group hover:bg-white/5 p-2 pr-4 rounded-xl transition-all border border-transparent hover:border-white/5">
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{user?.name}</p>
                <div className="flex items-center justify-end gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Online</span>
                </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#0F0F12] border border-white/10 group-hover:border-indigo-500/50 flex items-center justify-center text-sm font-bold text-white shadow-inner transition-all">
                {user?.name?.charAt(0).toUpperCase()}
            </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="max-w-[1600px] mx-auto px-8 pt-10 space-y-8 relative z-10 animate-in fade-in duration-500">
        
        {/* 🕵️‍♂️ SPY BANNER (Only shows when Admin monitors someone) */}
        {isSpying && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 shadow-lg shadow-amber-900/20">
                <div className="flex items-center gap-4 text-amber-400">
                    <div className="p-2.5 bg-amber-500/20 rounded-xl animate-pulse border border-amber-500/20">
                        <Eye size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide text-amber-300">SURVEILLANCE MODE ACTIVE</h3>
                        <p className="text-xs text-amber-500/80 mt-0.5">You are viewing the terminal of agent: <span className="font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded ml-1">{viewAsName}</span></p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate("/dashboard")}
                    className="px-5 py-2.5 bg-amber-500 text-black text-xs font-bold rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                    EXIT MONITORING
                </button>
            </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                    {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        {isSpying ? viewAsName?.split(" ")[0] : user?.name?.split(" ")[0]}
                    </span>.
                </h1>
                <p className="text-slate-400 text-sm">
                    {isSpying ? "They" : "You"} have <span className="text-white font-bold">{stats.active} opportunities</span> requiring action today.
                </p>
            </div>
            {!isSpying && (
                <button onClick={() => navigate('/pipeline')} className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0C] hover:bg-[#0F0F12] border border-white/10 rounded-xl text-sm font-bold text-white transition-all hover:border-indigo-500/30 cursor-pointer group">
                    Go to Pipeline <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                <StatCard label="Assigned Leads" value={stats.total} icon={<Briefcase size={18}/>} color="blue" />
                <StatCard label="Deals Won" value={stats.won} icon={<CheckCircle size={18}/>} color="emerald" />
                <StatCard label="In Pipeline" value={stats.active} icon={<Clock size={18}/>} color="amber" />
                <StatCard label="Win Rate" value={`${stats.conversion}%`} icon={<TrendingUp size={18}/>} color="purple" />
            </div>

            <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-6 lg:col-span-1 shadow-xl flex flex-col relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Filter size={14} className="text-indigo-400"/> Pipeline Flow
                </h3>
                <div className="flex-1 w-full min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <defs>
                                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#0F0F12', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40} fill="url(#colorBar)">
                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.name === 'Closed' ? '#10b981' : '#6366f1'} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-6 lg:col-span-1 shadow-xl flex flex-col relative group">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Globe size={14} className="text-emerald-400"/> Traffic Sources
                </h3>
                <div className="flex-1 w-full relative min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                                {sourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0F0F12', border: '1px solid #1e293b', borderRadius: '8px' }} itemStyle={{color: '#fff'}} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px', color: '#94a3b8'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8">
                        <span className="text-2xl font-bold text-white tracking-tight">{stats.total}</span>
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Leads</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0A0A0C] border border-white/5 rounded-3xl p-6 shadow-xl min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Zap size={18} className="text-amber-400 fill-amber-400/20"/> Action Required
                    </h3>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                        {activeLeads.length} Pending
                    </span>
                </div>

                <div className="space-y-3">
                    {activeLeads.length > 0 ? (
                        activeLeads.slice(0, 5).map((lead) => (
                            <div 
                                key={lead._id || lead.id} 
                                onClick={() => setSelectedLead(lead)} 
                                className="group flex items-center justify-between p-4 rounded-2xl bg-[#0F0F12] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer hover:translate-x-1"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-inner transition-transform group-hover:scale-105 ${
                                        lead.status === 'New' ? 'bg-indigo-600' : 'bg-[#1A1A1E] border border-white/10'
                                    }`}>
                                        {(lead.name || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-sm group-hover:text-white transition-colors">{lead.name || "Unknown Lead"}</h4>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><Clock size={10}/> {new Date(lead.updatedAt).toLocaleDateString()}</span>
                                            {lead.source && <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{lead.source}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                        lead.status === 'New' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        lead.status === 'Interested' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                        'bg-slate-800 text-slate-400 border-slate-700'
                                    }`}>
                                        {lead.status}
                                    </span>
                                    <ArrowUpRight size={16} className="text-slate-600 group-hover:text-white transition-colors"/>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                            <CheckCircle size={32} className="mx-auto text-slate-700 mb-3"/>
                            <p className="text-slate-500 text-sm font-medium">All caught up!</p>
                            <p className="text-xs text-slate-600">No pending leads right now.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Trophy size={18} className="text-emerald-400"/> Recent Wins
                    </h3>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                    {recentWins.length > 0 ? recentWins.map(lead => (
                        <div key={lead._id || lead.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-900/10 to-transparent border border-emerald-500/10 rounded-2xl hover:border-emerald-500/30 transition-all cursor-default">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <CheckCircle size={16}/>
                            </div>
                            <div>
                                <p className="font-bold text-slate-200 text-sm">{lead.name}</p>
                                <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-wide mt-0.5">Closed Deal</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 opacity-50">
                            <Trophy size={24} className="mx-auto text-slate-700 mb-2"/>
                            <p className="text-xs text-slate-600">No wins yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* --- QUICK UPDATE MODAL (Inline - Same Logic as before) --- */}
      {selectedLead && (
        <div 
            id="modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-[#0A0A0C] border border-white/10 w-full max-w-md h-[500px] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 relative flex flex-col" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 bg-[#0F0F12] flex justify-between items-start shrink-0">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/30">
                            {(selectedLead.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{selectedLead.name || "Unknown"}</h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                                <Briefcase size={12}/> {selectedLead.company || "Individual Client"}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all cursor-pointer"><X size={18}/></button>
                </div>

                {/* Details */}
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                    
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-3 block flex items-center gap-2"><Zap size={12} className="text-yellow-400"/> Update Pipeline Stage</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['New', 'Contacted', 'Interested', 'Closed'].map((status) => (
                                <button 
                                    key={status}
                                    // 🚫 Disable status change if in Spy Mode
                                    disabled={isSpying}
                                    onClick={() => handleStatusUpdate(status)}
                                    className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${
                                        selectedLead.status === status 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                        : isSpying 
                                            ? 'bg-[#0F0F12] border-white/5 text-slate-600 cursor-not-allowed opacity-50'
                                            : 'bg-[#0F0F12] border-white/5 text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer'
                                    }`}
                                >
                                    {status === 'Interested' ? 'In Progress' : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <ActionButton icon={<Phone size={18}/>} label="Call" href={`tel:${selectedLead.phone || ''}`} color="blue" />
                        <ActionButton icon={<Mail size={18}/>} label="Email" href={`mailto:${selectedLead.email || ''}`} color="purple" />
                        <ActionButton icon={<MessageCircle size={18}/>} label="WhatsApp" href={`https://wa.me/${selectedLead.phone || ''}`} color="green" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-[#0F0F12] rounded-xl border border-white/5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Source</span>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 font-medium"><Globe size={12} className="text-indigo-400"/> {selectedLead.source || "Manual"}</div>
                        </div>
                        <div className="p-3 bg-[#0F0F12] rounded-xl border border-white/5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">System ID</span>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 font-mono"><Hash size={12} className="text-slate-600"/> {(selectedLead._id || selectedLead.id || "000000").toString().slice(-6)}</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      )}

    </div>
  );
}

const StatCard = ({ label, value, icon, color }) => {
    const theme = {
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
    return (
        <div className="bg-[#0A0A0C] border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all flex flex-col justify-between h-32 group hover:-translate-y-1 hover:shadow-lg">
            <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl border ${theme[color]} transition-transform group-hover:scale-110`}>{icon}</div>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{label}</p>
            </div>
        </div>
    );
};

const ActionButton = ({ icon, label, color, href }) => {
    const theme = {
        blue: "hover:bg-blue-600 hover:border-blue-600 text-blue-400 hover:text-white border-blue-500/20 bg-blue-500/5",
        purple: "hover:bg-purple-600 hover:border-purple-600 text-purple-400 hover:text-white border-purple-500/20 bg-purple-500/5",
        green: "hover:bg-emerald-600 hover:border-emerald-600 text-emerald-400 hover:text-white border-emerald-500/20 bg-emerald-500/5",
    };
    return (
        <a href={href} target="_blank" rel="noreferrer" className={`flex flex-col items-center justify-center gap-2 py-3.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${theme[color]}`}>
            {icon}
            <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
        </a>
    );
};

const HomeSkeleton = () => (
    <div className="min-h-screen bg-[#020202] p-8 space-y-8 relative overflow-hidden font-mono">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-[scanline_2.5s_linear_infinite] z-50"></div>
        <style>{`@keyframes scanline { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
        <div className="flex justify-between items-center pb-6 border-b border-cyan-900/30 relative z-10">
             <div className="flex items-center gap-4"><div className="h-10 w-10 bg-cyan-950/30 border border-cyan-500/20 rounded-xl"></div><div className="space-y-2"><div className="h-4 w-32 bg-cyan-900/20 rounded"></div><div className="h-2 w-20 bg-cyan-900/20 rounded"></div></div></div>
             <div className="h-10 w-40 bg-cyan-950/30 border border-cyan-500/20 rounded-xl hidden md:block"></div>
        </div>
        <div className="flex justify-between items-end relative z-10 pt-2">
             <div className="space-y-3 w-full max-w-lg"><div className="h-10 w-3/4 bg-cyan-950/20 border-l-4 border-cyan-500 rounded-r-lg relative overflow-hidden"><div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div></div><div className="h-3 w-1/2 bg-cyan-900/20 rounded"></div></div>
             <div className="h-10 w-32 bg-cyan-950/30 border border-cyan-500/20 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                {[1,2,3,4].map(i => (<div key={i} className="h-32 bg-[#050505] border border-cyan-800/30 rounded-3xl p-5 flex flex-col justify-between"><div className="h-8 w-8 bg-cyan-900/20 rounded-xl border border-cyan-500/20"></div><div className="space-y-2"><div className="h-6 w-16 bg-cyan-900/30 rounded"></div><div className="h-2 w-12 bg-cyan-900/20 rounded"></div></div></div>))}
            </div>
            <div className="lg:col-span-1 bg-[#050505] border border-cyan-800/30 rounded-3xl p-6 relative flex flex-col"><div className="h-4 w-32 bg-cyan-900/20 rounded mb-8 border-l-2 border-cyan-500"></div><div className="flex items-end justify-between flex-1 gap-2 px-2 border-b border-l border-cyan-900/30 pb-2 pl-2">{[40, 70, 50, 80, 60].map((h,i) => (<div key={i} className="w-full bg-cyan-500/10 border-t border-cyan-500/30 relative" style={{height: `${h}%`}}></div>))}</div></div>
            <div className="lg:col-span-1 bg-[#050505] border border-cyan-800/30 rounded-3xl p-6 flex flex-col items-center justify-center relative"><div className="absolute top-6 left-6 h-4 w-32 bg-cyan-900/20 rounded border-l-2 border-cyan-500"></div><div className="relative mt-4"><div className="h-40 w-40 rounded-full border-4 border-cyan-900/20 border-dashed animate-[spin_10s_linear_infinite]"></div><div className="absolute inset-0 h-40 w-40 rounded-full border-t-4 border-cyan-500 animate-spin"></div></div></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 h-[400px]">
            <div className="lg:col-span-2 bg-[#050505] border border-cyan-800/30 rounded-3xl p-6 flex flex-col"><div className="flex justify-between mb-6"><div className="h-5 w-40 bg-cyan-900/20 rounded border-l-2 border-amber-500"></div><div className="h-5 w-20 bg-amber-500/10 rounded border border-amber-500/20"></div></div><div className="space-y-3">{[1,2,3,4].map(i => (<div key={i} className="h-16 w-full bg-cyan-950/10 border border-cyan-900/20 rounded-2xl flex items-center px-4 gap-4 relative overflow-hidden"><div className="h-10 w-10 bg-cyan-900/20 rounded-xl"></div><div className="flex-1 space-y-2"><div className="h-3 w-32 bg-cyan-900/20 rounded"></div><div className="h-2 w-20 bg-cyan-900/10 rounded"></div></div><div className="h-6 w-20 bg-cyan-900/10 rounded"></div><div className="absolute inset-0 bg-cyan-500/5 -translate-x-full animate-[shimmer_2s_infinite]" style={{animationDelay: `${i * 0.2}s`}}></div></div>))}</div></div>
            <div className="lg:col-span-1 bg-[#050505] border border-cyan-800/30 rounded-3xl p-6"><div className="h-5 w-32 bg-cyan-900/20 rounded mb-6 border-l-2 border-emerald-500"></div><div className="space-y-3">{[1,2,3,4].map(i => (<div key={i} className="h-16 w-full bg-emerald-900/5 border border-emerald-500/10 rounded-2xl flex items-center px-4 gap-4"><div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20"></div><div className="flex-1 space-y-2"><div className="h-3 w-24 bg-emerald-900/20 rounded"></div><div className="h-2 w-16 bg-emerald-900/10 rounded"></div></div></div>))}</div></div>
        </div>
    </div>
);

export default Home;