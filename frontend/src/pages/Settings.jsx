import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/authContext.jsx";
import { useLocation } from "react-router-dom";
import { 
  User, Shield, Trophy, Users, Save, LogOut, 
  LayoutGrid, CheckCircle, Lock, Plus, Trash2,
  Briefcase, Star, Medal, Crown, Zap, Loader2, AlertCircle, 
  Target, Award, TrendingUp, AlertTriangle, X
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (location.state && location.state.activeTab) {
        setActiveTab(location.state.activeTab);
    }
  }, [location]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    // ✨ 1. PAGE ANIMATION: Smooth Zoom-In Effect
    <div className="min-h-screen bg-[#030303] text-slate-300 font-sans selection:bg-indigo-500/30 relative animate-in fade-in zoom-in-95 duration-500">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 border backdrop-blur-md ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-[#0A0A0C]/90 border-emerald-500/50 text-emerald-400'}`}>
          {toast.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
          <span className="text-sm font-bold">{toast.msg}</span>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0F0F12] border border-white/10 flex items-center justify-center shadow-inner">
                    <LayoutGrid size={20} className="text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">Settings</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Workspace Control</p>
                </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F0F12] hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/30 transition-all text-xs font-bold uppercase tracking-wide active:scale-95 cursor-pointer">
                <LogOut size={14} /> Sign Out
            </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        
        {/* TABS */}
        <div className="flex flex-wrap gap-1 mb-10 border-b border-white/5 pb-1">
            <TabButton active={activeTab} name="profile" label="Profile" icon={<User size={16}/>} setTab={setActiveTab} />
            <TabButton 
                active={activeTab} 
                name="achievements" 
                label={isAdmin ? "Sales Arena" : "My Rank"} 
                icon={isAdmin ? <Trophy size={16}/> : <Medal size={16}/>} 
                setTab={setActiveTab} 
            />
            <TabButton active={activeTab} name="security" label="Security" icon={<Shield size={16}/>} setTab={setActiveTab} />
            {isAdmin && <TabButton active={activeTab} name="team" label="Team" icon={<Users size={16}/>} setTab={setActiveTab} />}
        </div>

        {/* CONTENT AREA (Tab Switch Animation) */}
        <div key={activeTab} className="animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
            {activeTab === 'profile' && <ProfileSettings user={user} showToast={showToast} />}
            
            {activeTab === 'achievements' && (
                isAdmin ? <AdminLeaderboard /> : <UserGamification user={user} />
            )}

            {activeTab === 'security' && <SecuritySettings showToast={showToast} />}
            {activeTab === 'team' && isAdmin && <TeamSettings showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

// ================= 1. ADMIN LEADERBOARD (Animated Podium) =================
function AdminLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [stats, setStats] = useState({ totalDeals: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, leadsRes] = await Promise.all([
                    api.get("/auth/users"),
                    api.get("/leads")
                ]);
                
                const allUsers = usersRes.data.filter(u => u.role !== 'admin');
                const allLeads = leadsRes.data;

                const rankedUsers = allUsers.map(user => {
                    const userId = user._id || user.id;
                    const wins = allLeads.filter(l => {
                        const leadAgentId = l.assignedTo?._id || l.assignedTo?.id || l.assignedTo;
                        return leadAgentId === userId && l.status === 'Closed';
                    }).length;
                    return { ...user, wins };
                }).sort((a, b) => b.wins - a.wins);
                
                setLeaderboard(rankedUsers);
                setStats({
                    totalDeals: allLeads.filter(l => l.status === 'Closed').length,
                    activeAgents: allUsers.length
                });
            } catch (error) { console.error(error); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    // ✨ 2. CYBER LOADING STATE (Admin View)
    if(loading) return (
        <div className="flex flex-col h-[calc(100vh-240px)] relative overflow-hidden font-mono">
             {/* Matrix Background */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
             {/* Scanner Light */}
             <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-[scanline_2.5s_linear_infinite] z-50"></div>
             <style>{`@keyframes scanline { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>

             <div className="grid grid-cols-3 gap-4 mb-4 shrink-0 relative z-10">
                 {[1,2,3].map(i => <div key={i} className="h-24 bg-[#0A0A0C] border border-cyan-900/30 rounded-2xl animate-pulse"></div>)}
             </div>

             <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 relative z-10">
                 {/* Podium Skeleton */}
                 <div className="col-span-8 bg-[#0A0A0C] border border-cyan-900/30 rounded-3xl relative flex items-end justify-center pb-8 gap-6 overflow-hidden shadow-2xl">
                     <div className="w-20 h-32 bg-cyan-900/10 rounded-t-lg animate-pulse delay-100"></div>
                     <div className="w-24 h-48 bg-cyan-900/20 rounded-t-lg animate-pulse border-t-4 border-cyan-500/50"></div>
                     <div className="w-20 h-24 bg-cyan-900/10 rounded-t-lg animate-pulse delay-200"></div>
                 </div>
                 {/* List Skeleton */}
                 <div className="col-span-4 bg-[#0A0A0C] border border-cyan-900/30 rounded-3xl p-5 space-y-3">
                     {[1,2,3,4,5,6].map(i => (
                         <div key={i} className="h-12 w-full bg-cyan-900/10 rounded-xl animate-pulse border border-cyan-500/10"></div>
                     ))}
                 </div>
             </div>
        </div>
    );

    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <div className="flex flex-col h-[calc(100vh-240px)]"> 
            {/* 1. Top Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 shrink-0">
                <StatCard icon={<Briefcase size={18}/>} label="Total Wins" value={stats.totalDeals} color="emerald" />
                <StatCard icon={<Users size={18}/>} label="Active Agents" value={stats.activeAgents} color="blue" />
                <StatCard icon={<Target size={18}/>} label="Top Performance" value={leaderboard[0]?.wins || 0} color="yellow" />
            </div>

            {/* 2. Main Split View */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                
                {/* 🏆 LEFT: Podium */}
                <div className="col-span-8 bg-[#0A0A0C] border border-white/5 rounded-3xl relative flex flex-col justify-end pb-8 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
                    
                    <div className="absolute top-6 left-0 right-0 text-center">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center justify-center gap-2">
                            <Crown size={18} className="text-yellow-400"/> Top Performers
                        </h3>
                    </div>

                    {leaderboard.length > 0 ? (
                        <div className="flex flex-wrap justify-center items-end gap-8 px-6 mb-4">
                            {/* 🥈 Rank 2 */}
                            {top3[1] && (
                                <div className="flex flex-col items-center animate-in slide-in-from-bottom-12 duration-700 delay-100">
                                    <div className="w-16 h-16 rounded-full border-4 border-slate-400 bg-[#0F0F12] flex items-center justify-center text-xl font-bold text-white mb-3 relative shadow-[0_0_20px_rgba(148,163,184,0.3)]">
                                        {top3[1].name.charAt(0)}
                                        <div className="absolute -bottom-2.5 bg-slate-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#0A0A0C]">#2</div>
                                    </div>
                                    <div className="h-24 w-20 bg-gradient-to-t from-slate-400/20 to-transparent border-t-2 border-slate-400 rounded-t-lg flex flex-col items-center justify-start pt-3">
                                        <span className="font-bold text-white text-xs">{top3[1].name}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{top3[1].wins} Wins</span>
                                    </div>
                                </div>
                            )}

                            {/* 🥇 Rank 1 */}
                            {top3[0] && (
                                <div className="flex flex-col items-center z-10 animate-in slide-in-from-bottom-12 duration-700">
                                    <Crown size={32} className="text-yellow-400 mb-2 fill-yellow-400 animate-bounce" />
                                    <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-[#0F0F12] flex items-center justify-center text-3xl font-bold text-white mb-3 relative shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                                        {top3[0].name.charAt(0)}
                                        <div className="absolute -bottom-3 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#0A0A0C]">#1</div>
                                    </div>
                                    <div className="h-36 w-28 bg-gradient-to-t from-yellow-400/20 to-transparent border-t-2 border-yellow-400 rounded-t-lg flex flex-col items-center justify-start pt-5 shadow-[0_0_20px_rgba(250,204,21,0.1)]">
                                        <span className="font-bold text-white text-sm">{top3[0].name}</span>
                                        <span className="text-xs text-yellow-200 font-mono font-bold">{top3[0].wins} Wins</span>
                                    </div>
                                </div>
                            )}

                            {/* 🥉 Rank 3 */}
                            {top3[2] && (
                                <div className="flex flex-col items-center animate-in slide-in-from-bottom-12 duration-700 delay-200">
                                    <div className="w-16 h-16 rounded-full border-4 border-amber-600 bg-[#0F0F12] flex items-center justify-center text-xl font-bold text-white mb-3 relative shadow-[0_0_20px_rgba(217,119,6,0.3)]">
                                        {top3[2].name.charAt(0)}
                                        <div className="absolute -bottom-2.5 bg-amber-600 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#0A0A0C]">#3</div>
                                    </div>
                                    <div className="h-16 w-20 bg-gradient-to-t from-amber-600/20 to-transparent border-t-2 border-amber-600 rounded-t-lg flex flex-col items-center justify-start pt-3">
                                        <span className="font-bold text-white text-xs">{top3[2].name}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{top3[2].wins} Wins</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 text-sm">Waiting for champions...</div>
                    )}
                </div>

                {/* 📜 RIGHT: Scrollable List */}
                <div className="col-span-4 bg-[#0A0A0C] border border-white/5 rounded-3xl p-5 flex flex-col overflow-hidden">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-2 shrink-0">
                        <Users size={14}/> Leaderboard
                    </h3>
                    
                    <div className="overflow-y-auto pr-1 space-y-2 custom-scrollbar flex-1">
                        {leaderboard.map((agent, index) => (
                            <div key={agent._id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${index < 3 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-[#0F0F12] border-white/5'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold text-xs w-4 ${index < 3 ? 'text-indigo-400' : 'text-slate-600'}`}>#{index + 1}</span>
                                    <span className="text-slate-200 text-xs font-medium truncate max-w-[80px]">{agent.name}</span>
                                </div>
                                <span className="font-mono text-[10px] font-bold bg-[#0A0A0C] px-2 py-0.5 rounded border border-white/5 text-slate-300">{agent.wins} Wins</span>
                            </div>
                        ))}
                        {leaderboard.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No data yet.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}

// ================= 2. USER GAMIFICATION (XP & Badges) =================
function UserGamification({ user }) {
    const [stats, setStats] = useState({ won: 0, level: 1, xp: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateLevel = async () => {
            const userId = user?._id || user?.id;
            if (!userId) { setLoading(false); return; }

            try {
                const res = await api.get("/leads");
                const allLeads = res.data;
                const myWonDeals = allLeads.filter(l => {
                    const leadAgentId = l.assignedTo?._id || l.assignedTo?.id || l.assignedTo;
                    return leadAgentId === userId && l.status === 'Closed';
                }).length;

                const xp = myWonDeals * 100;
                const level = Math.floor(xp / 500) + 1;
                setStats({ won: myWonDeals, xp, level });
            } catch (error) { 
                console.error("Gamification Error:", error); 
            } finally { 
                setLoading(false); 
            }
        };
        if (user) calculateLevel();
    }, [user]);

    // ✨ 3. CYBER LOADING STATE (User View)
    if (loading) return (
        <div className="space-y-8 relative overflow-hidden min-h-[500px] font-mono">
             {/* Matrix Background */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
             {/* Scanner Light */}
             <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-[scanline_2.5s_linear_infinite] z-50"></div>
             <style>{`@keyframes scanline { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>

             {/* Level Card Skeleton */}
             <div className="h-64 w-full bg-[#0A0A0C] border border-cyan-900/30 rounded-3xl p-8 flex items-center gap-10 relative z-10 shadow-lg">
                 <div className="w-28 h-28 rounded-full bg-cyan-900/10 border border-cyan-500/20 animate-pulse shrink-0"></div>
                 <div className="flex-1 space-y-4">
                     <div className="h-8 w-48 bg-cyan-900/20 rounded animate-pulse"></div>
                     <div className="h-4 w-full bg-cyan-900/10 rounded animate-pulse"></div>
                 </div>
             </div>

             {/* Badges Skeleton */}
             <div className="bg-[#0A0A0C] border border-cyan-900/30 rounded-3xl p-8 relative z-10 shadow-lg">
                 <div className="h-6 w-32 bg-cyan-900/20 rounded mb-6 animate-pulse"></div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[1,2,3,4].map(i => <div key={i} className="h-40 bg-cyan-900/5 border border-cyan-500/10 rounded-2xl animate-pulse"></div>)}
                 </div>
             </div>
        </div>
    );

    const xpForNextLevel = 500; 
    const currentLevelBaseXp = (stats.level - 1) * 500;
    const xpInCurrentLevel = stats.xp - currentLevelBaseXp;
    const progressPercent = Math.min((xpInCurrentLevel / xpForNextLevel) * 100, 100);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Level Card */}
            <div className="bg-gradient-to-r from-[#0F0F12] to-[#0A0A0C] border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl group">
                <div className="absolute top-0 right-0 p-32 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full bg-[#050505] border-4 border-indigo-500 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-in zoom-in duration-500">
                            {stats.level >= 10 ? '👑' : stats.level >= 5 ? '⭐' : '🚀'}
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-[#0A0A0C]">
                            Lvl {stats.level}
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Sales {stats.level >= 5 ? "Veteran" : "Rookie"}</h2>
                                <p className="text-slate-400 text-xs mt-1">Keep closing deals to rank up!</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-indigo-400">{stats.xp}</span>
                                <span className="text-xs text-slate-500 font-bold uppercase ml-1">Total XP</span>
                            </div>
                        </div>
                        
                        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 relative">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                        
                        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mt-2">
                            <span>Level {stats.level} ({currentLevelBaseXp} XP)</span>
                            <span>Level {stats.level + 1} ({currentLevelBaseXp + 500} XP)</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Badges Grid */}
            <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-6 flex items-center gap-2"><Medal size={16} className="text-yellow-500"/> Achievement Badges</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <BadgeCard title="First Blood" desc="Close 1st deal" icon={<Zap size={24}/>} unlocked={stats.won >= 1} color="text-blue-400" border="border-blue-500/30" />
                    <BadgeCard title="Closer" desc="Close 5 deals" icon={<Briefcase size={24}/>} unlocked={stats.won >= 5} color="text-purple-400" border="border-purple-500/30" />
                    <BadgeCard title="Expert" desc="Close 10 deals" icon={<Star size={24}/>} unlocked={stats.won >= 10} color="text-emerald-400" border="border-emerald-500/30" />
                    <BadgeCard title="Legend" desc="Close 25 deals" icon={<Crown size={24}/>} unlocked={stats.won >= 25} color="text-yellow-400" border="border-yellow-500/30" />
                </div>
            </div>
        </div>
    );
}

// ================= 3. PROFILE SETTINGS =================
function ProfileSettings({ user, showToast }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: user?.name || "", email: user?.email || "" });

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/auth/updatedetails', formData);
            showToast("Profile updated successfully!");
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) { showToast("Update failed", "error"); } 
        finally { setLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-8 text-center shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                    <div className="w-28 h-28 mx-auto rounded-full bg-[#0F0F12] flex items-center justify-center text-4xl font-bold text-white mb-4 border-2 border-white/10 shadow-2xl relative z-10">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold text-white relative z-10">{user?.name}</h3>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-[10px] font-bold uppercase border border-white/10 mt-3 inline-block relative z-10">
                        {user?.role}
                    </span>
                </div>
            </div>
            <div className="md:col-span-2 bg-[#0A0A0C] border border-white/5 rounded-3xl p-8 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><User size={20} className="text-indigo-500"/> Personal Details</h2>
                <form onSubmit={handleSave} className="space-y-6">
                    <InputGroup label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <InputGroup label="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <div className="pt-2 flex justify-end"><SaveButton loading={loading} /></div>
                </form>
            </div>
        </div>
    );
}

// ================= 4. SECURITY SETTINGS =================
function SecuritySettings({ showToast }) {
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirm) return showToast("New passwords do not match", "error");
        setLoading(true);
        try {
            await api.put('/auth/updatepassword', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
            showToast("Password updated!");
            setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
        } catch (error) { showToast("Incorrect current password", "error"); } 
        finally { setLoading(false); }
    };

    return (
        <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-8 shadow-xl max-w-2xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Lock size={20} className="text-indigo-500"/> Change Password</h2>
            <form onSubmit={handleUpdate} className="space-y-6">
                <InputGroup label="Current Password" type="password" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} />
                <div className="grid grid-cols-2 gap-6">
                    <InputGroup label="New Password" type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
                    <InputGroup label="Confirm New" type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                </div>
                <div className="pt-2 flex justify-start"><SaveButton label="Update Password" loading={loading} /></div>
            </form>
        </div>
    );
}


// ================= 5. TEAM SETTINGS (With Custom Delete Modal) =================
function TeamSettings({ showToast }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user" });
    
    // 👇 Nayi State Modal ke liye
    const [deleteId, setDeleteId] = useState(null);

    const fetchUsers = async () => {
        try { const res = await api.get("/auth/users"); setUsers(res.data); } catch (error) {}
    };
    useEffect(() => { fetchUsers(); }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/auth/register", newUser);
            showToast("User added!");
            setNewUser({ name: "", email: "", password: "", role: "user" });
            fetchUsers();
        } catch (error) { showToast("Failed to add", "error"); }
        finally { setLoading(false); }
    };

    // 👇 Delete Logic Update (API call ab direct nahi hogi)
    const confirmDelete = async () => {
        if(!deleteId) return;
        try { 
            await api.delete(`/auth/users/${deleteId}`); 
            setUsers(users.filter(u => u._id !== deleteId)); 
            showToast("User removed successfully"); 
            setDeleteId(null); // Modal close
        } 
        catch (error) { showToast("Failed to remove user", "error"); }
    };

    return (
        <div className="space-y-8 relative">
            {/* Invite Form */}
            <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-8 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Plus size={20} className="text-indigo-500"/> Invite Member</h2>
                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <InputGroup label="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                    <InputGroup label="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                    <InputGroup label="Password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer h-[50px]">
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <><Plus size={18}/> Add User</>}
                    </button>
                </form>
            </div>
            
            {/* Team Directory */}
            <div className="bg-[#0A0A0C] border border-white/5 rounded-3xl p-8 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Users size={20} className="text-indigo-500"/> Team Directory</h2>
                <div className="space-y-3">
                    {users.map((u, i) => (
                        <div key={u._id} className="flex items-center justify-between p-4 bg-[#0F0F12] border border-white/5 rounded-2xl hover:border-white/10 transition-all hover:-translate-y-1 duration-300 group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#0A0A0C] flex items-center justify-center font-bold text-white border border-white/10 group-hover:border-indigo-500/50 transition-colors">{u.name.charAt(0).toUpperCase()}</div>
                                <div><p className="font-bold text-white text-sm">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{u.role}</span>
                                {u.role !== 'admin' && (
                                    // 👇 Button ab state set karega
                                    <button onClick={() => setDeleteId(u._id)} className="p-2 text-slate-500 hover:text-rose-400 cursor-pointer bg-white/5 rounded-lg hover:bg-rose-500/10 transition-colors">
                                        <Trash2 size={16}/>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🛑 CUSTOM DELETE MODAL (Fixed Overlay) */}
            {deleteId && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setDeleteId(null)}>
                    <div className="bg-[#0A0A0C] border border-red-500/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setDeleteId(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"><X size={18} /></button>
                        
                        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/20 mx-auto">
                            <AlertTriangle className="text-red-500" size={28}/>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2 text-center">Remove Team Member?</h3>
                        <p className="text-slate-500 text-xs mb-8 text-center px-4">
                            They will lose access immediately. This action cannot be undone.
                        </p>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-colors cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-600/20 transition-all cursor-pointer">
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- SUB-COMPONENTS (Premium UI) ---

const StatCard = ({ icon, label, value, color }) => {
    const bgColors = {
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    };
    return (
        <div className="bg-[#0A0A0C] border border-white/5 p-6 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all hover:-translate-y-1 shadow-lg">
            <div className={`p-3 rounded-xl border ${bgColors[color]}`}>{icon}</div>
            <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">{label}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
            </div>
        </div>
    );
};

const BadgeCard = ({ title, desc, icon, unlocked, color, border }) => (
    <div className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 hover:scale-105 ${unlocked ? `bg-[#0F0F12] ${border} ${color} shadow-lg` : 'bg-[#0F0F12]/50 border-white/5 text-slate-700 grayscale opacity-50'}`}>
        <div className={`p-4 rounded-full bg-[#0A0A0C] mb-4 ${unlocked ? 'shadow-inner' : ''}`}>{icon}</div>
        <h4 className="font-bold text-sm mb-1">{title}</h4>
        <p className="text-[10px] opacity-70">{desc}</p>
        {unlocked && <span className="mt-3 text-[9px] font-bold bg-white/5 px-2 py-0.5 rounded text-white animate-pulse border border-white/10">UNLOCKED</span>}
    </div>
);

const TabButton = ({ active, name, label, icon, setTab }) => (
    <button onClick={() => setTab(name)} className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-sm font-bold border-b-2 transition-all duration-300 cursor-pointer ${active === name ? "border-indigo-500 text-white bg-[#0A0A0C]" : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
        {icon} {label}
    </button>
);

const InputGroup = ({ label, value, onChange, type="text", placeholder }) => (
    <div className="w-full group">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 group-focus-within:text-indigo-400 transition-colors">{label}</label>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 font-medium" />
    </div>
);

const SaveButton = ({ label = "Save Changes", loading }) => (
    <button disabled={loading} className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-sm">
        {loading ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18} /> {label}</>}
    </button>
);