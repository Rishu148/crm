import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/authContext";
import {
  PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  Users, Briefcase, CheckCircle2,
  Activity, Bell, Clock, AlertCircle, BarChart3, Calendar, LayoutGrid, ArrowUpRight, Search, Sparkles
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // --- SAME LOGIC (Functionality Intact) ---
  const [stats, setStats] = useState({ total: 0, active: 0, closed: 0, unassigned: 0 });
  const [pipelineData, setPipelineData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [agentWorkload, setAgentWorkload] = useState([]);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/leads");
        const allLeads = res.data;

        // Stats
        const closedCount = allLeads.filter(l => l.status === 'Closed').length;
        const activeCount = allLeads.filter(l => ['New', 'Contacted', 'Interested'].includes(l.status)).length;
        const unassignedCount = allLeads.filter(l => !l.assignedTo).length;
        
        setStats({
            total: allLeads.length,
            active: activeCount,
            closed: closedCount,
            unassigned: unassignedCount
        });

        // Pipeline (Using Gradients IDs defined in render)
        const stages = [
            { name: 'New', color: '#38bdf8' },       // Sky
            { name: 'Contacted', color: '#818cf8' }, // Indigo
            { name: 'Interested', color: '#c084fc' },// Purple
            { name: 'Closed', color: '#34d399' }     // Emerald
        ];
        
        const pipeline = stages.map(stage => ({
            name: stage.name,
            count: allLeads.filter(l => l.status === stage.name).length,
            fill: stage.color
        }));
        setPipelineData(pipeline);

        // Sources
        const sources = allLeads.reduce((acc, lead) => {
            acc[lead.source] = (acc[lead.source] || 0) + 1;
            return acc;
        }, {});
        setSourceData(Object.keys(sources).map(key => ({ name: key, value: sources[key] })));

        // Activity
        const activity = [...allLeads].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
        setRecentActivity(activity);

        // Workload
        const workloadMap = {};
        allLeads.forEach(lead => {
            if (lead.assignedTo && ['New', 'Contacted', 'Interested'].includes(lead.status)) {
                const name = lead.assignedTo.name;
                workloadMap[name] = (workloadMap[name] || 0) + 1;
            }
        });
        const workload = Object.keys(workloadMap)
            .map(name => ({ name, count: workloadMap[name] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        setAgentWorkload(workload);

        setLoading(false);
      } catch (error) { console.error("Load Failed"); setLoading(false); }
    };
    fetchData();
  }, []);

  const PIE_COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#34d399'];

  if (loading) return <DashboardSkeleton />;

  return (
    // Base: Deepest Black with a top Spotlight
    <div className="min-h-screen bg-[#030303] text-slate-300 font-sans selection:bg-indigo-500/30 pb-12 relative ">
      
      {/* 🔦 AMBIENT SPOTLIGHT (Top Center) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-900/10 rounded-[100%] blur-[100px] pointer-events-none"></div>
      
      {/* 🕸️ SUBTLE GRID PATTERN */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center supports-[backdrop-filter]:bg-[#030303]/60">
        
        <div 
            onClick={() => navigate("/settings")} 
            className="flex items-center gap-4 cursor-pointer group"
        >
            <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-[#0F0F12] border border-white/10 flex items-center justify-center text-lg font-bold text-white group-hover:border-indigo-500/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-4 border-[#030303] rounded-full"></div>
            </div>
            
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                    {greeting}, <span className="text-slate-400 font-medium">{user?.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                    <Sparkles size={10} /> Overview
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
             {stats.unassigned > 0 && (
                <div className="hidden md:flex items-center gap-2 bg-rose-950/30 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                    <AlertCircle size={14}/>
                    <span className="text-xs font-bold">{stats.unassigned} Action Required</span>
                </div>
            )}
            <div className="hidden md:flex items-center gap-2 bg-[#0F0F12] px-4 py-2 rounded-lg border border-white/5 text-slate-400 hover:text-white transition-colors hover:border-white/10 cursor-default">
                <Calendar size={14} className="text-slate-500"/>
                <span className="text-xs font-semibold">
                    {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                </span>
            </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-[1600px] mx-auto px-8 pt-8 space-y-8 relative z-10">
        
        {/* 1. KEY STATS (Interactive Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Leads" value={stats.total} icon={<Users size={18}/>} trend="+4.5%" color="indigo" />
            <StatCard title="Active Pipeline" value={stats.active} icon={<Briefcase size={18}/>} trend="High" color="sky" />
            <StatCard title="Closed Deals" value={stats.closed} icon={<CheckCircle2 size={18}/>} trend="Revenue" color="emerald" />
            <StatCard title="Unassigned" value={stats.unassigned} icon={<AlertCircle size={18}/>} trend="Urgent" color={stats.unassigned > 0 ? "rose" : "slate"} />
        </div>

        {/* 2. CHARTS (With Gradients) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Pipeline */}
            <div className="lg:col-span-2 bg-[#0A0A0C]/80 backdrop-blur-md border border-white/5 rounded-2xl p-7 relative group transition-all duration-300 hover:border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Activity size={16} className="text-indigo-400"/> Pipeline Volume
                    </h3>
                </div>
                
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pipelineData} margin={{ top: 10, right: 0, left: -25, bottom: 20 }}>
                            <defs>
                                {pipelineData.map((entry, index) => (
                                    <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={entry.fill} stopOpacity={0.8}/>
                                        <stop offset="100%" stopColor={entry.fill} stopOpacity={0.2}/>
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.4} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={15} fontWeight={600} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                contentStyle={{ backgroundColor: '#0A0A0C', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                 
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                                {pipelineData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} stroke={entry.fill} strokeWidth={1} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Right: Sources */}
            <div className="bg-[#0A0A0C]/80 backdrop-blur-md border border-white/5 rounded-2xl p-7 flex flex-col relative group transition-all duration-300 hover:border-white/10 shadow-2xl">
                <h3 className="text-base font-bold text-white mb-2">Sources</h3>
                <p className="text-xs text-slate-500 mb-6">Where leads come from</p>
                
                <div className="flex-1 relative min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={sourceData} cx="50%" cy="50%" 
                                innerRadius={70} outerRadius={90} 
                                paddingAngle={4} dataKey="value" stroke="none"
                            >
                                {sourceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0A0A0C', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '11px', color: '#94a3b8', paddingTop: '15px'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8">
                        <span className="text-3xl font-bold text-white tracking-tight">{stats.total}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Total</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. LISTS (Refined Typography) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            
            {/* Recent Activity */}
            <div className="bg-[#0A0A0C]/80 backdrop-blur-md border border-white/5 rounded-2xl p-7 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Bell size={16} className="text-sky-400"/> Latest Updates
                    </h3>
                </div>
                <div className="space-y-1">
                    {recentActivity.map((lead, index) => (
                        <div key={lead._id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.02]">
                            <div className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-indigo-400 transition-colors shadow-[0_0_8px_rgba(0,0,0,0)] group-hover:shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                            
                            <div className="flex-1 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-slate-300 font-medium">
                                        <span className="text-white group-hover:text-indigo-300 transition-colors">{lead.name}</span>
                                        <span className="mx-2 text-slate-600 text-[10px] uppercase font-bold tracking-wider">to</span>
                                        <span className={`text-xs font-bold ${
                                            lead.status === 'Closed' ? 'text-emerald-400' : 
                                            lead.status === 'New' ? 'text-sky-400' : 'text-slate-400'
                                        }`}>{lead.status}</span>
                                    </p>
                                </div>
                                <span className="text-[10px] text-slate-600 font-mono font-medium">
                                    {new Date(lead.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Load */}
            <div className="bg-[#0A0A0C]/80 backdrop-blur-md border border-white/5 rounded-2xl p-7 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <BarChart3 size={16} className="text-emerald-400"/> Workload
                    </h3>
                </div>

                <div className="space-y-5">
                    {agentWorkload.map((agent, index) => (
                        <div key={index}>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="font-bold text-slate-300 flex items-center gap-2">
                                    {agent.name}
                                </span>
                                <span className="text-slate-500 font-mono">{agent.count} Leads</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#18181b] rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        index === 0 ? 'bg-gradient-to-r from-indigo-500 to-sky-500' : 
                                        index === 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-600'
                                    }`} 
                                    style={{ width: `${Math.min(agent.count * 8, 100)}%` }} 
                                ></div>
                            </div>
                        </div>
                    ))}
                    {agentWorkload.length === 0 && (
                        <div className="text-center py-10 opacity-40 text-sm">All clear, no active workload.</div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// --- COMPONENTS ---

const StatCard = ({ title, value, icon, trend, color }) => {
    const styles = {
        indigo: "from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400 group-hover:border-indigo-500/40",
        sky: "from-sky-500/10 to-transparent border-sky-500/20 text-sky-400 group-hover:border-sky-500/40",
        emerald: "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40",
        rose: "from-rose-500/10 to-transparent border-rose-500/20 text-rose-400 group-hover:border-rose-500/40",
        slate: "from-slate-800/10 to-transparent border-white/10 text-slate-400 group-hover:border-white/20"
    };

    const activeStyle = styles[color] || styles.slate;

    return (
        <div className={`relative bg-gradient-to-br ${activeStyle} bg-[#0A0A0C] border p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group overflow-hidden`}>
            
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                    {icon}
                </div>
                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={12}/>
                    <span className="text-[10px] font-bold uppercase tracking-wide">{trend}</span>
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                <p className="text-[11px] font-bold opacity-50 mt-1 uppercase tracking-widest">
                    {title}
                </p>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div className="min-h-screen bg-[#030303] p-8 space-y-8">
        <div className="h-12 w-64 bg-white/5 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>)}
        </div>
        <div className="h-[400px] bg-white/5 rounded-2xl animate-pulse"></div>
    </div>
);