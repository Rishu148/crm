import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/authContext.jsx";
import PieChart from "recharts/es6/polar/PieChart";
import Pie from "recharts/es6/polar/Pie";
import Cell from "recharts/es6/component/Cell";
import Legend from "recharts/es6/component/Legend";
import BarChart from "recharts/es6/cartesian/BarChart";
import Bar from "recharts/es6/cartesian/Bar";
import XAxis from "recharts/es6/cartesian/XAxis";
import YAxis from "recharts/es6/cartesian/YAxis";
import Tooltip from "recharts/es6/component/Tooltip";
import ResponsiveContainer from "recharts/es6/component/ResponsiveContainer";
import CartesianGrid from "recharts/es6/cartesian/CartesianGrid";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Activity,
  Bell,
  Clock,
  AlertCircle,
  BarChart3,
  Calendar,
  LayoutGrid,
  ArrowUpRight,
  Search,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- SAME LOGIC (Functionality Intact) ---
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    closed: 0,
    unassigned: 0,
  });
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
        const closedCount = allLeads.filter(
          (l) => l.status === "Closed",
        ).length;
        const activeCount = allLeads.filter((l) =>
          ["New", "Contacted", "Interested"].includes(l.status),
        ).length;
        const unassignedCount = allLeads.filter((l) => !l.assignedTo).length;

        setStats({
          total: allLeads.length,
          active: activeCount,
          closed: closedCount,
          unassigned: unassignedCount,
        });

        // Pipeline (Using Gradients IDs defined in render)
        const stages = [
          { name: "New", color: "#38bdf8" }, // Sky
          { name: "Contacted", color: "#818cf8" }, // Indigo
          { name: "Interested", color: "#c084fc" }, // Purple
          { name: "Closed", color: "#34d399" }, // Emerald
        ];

        const pipeline = stages.map((stage) => ({
          name: stage.name,
          count: allLeads.filter((l) => l.status === stage.name).length,
          fill: stage.color,
        }));
        setPipelineData(pipeline);

        // Sources
        const sources = allLeads.reduce((acc, lead) => {
          acc[lead.source] = (acc[lead.source] || 0) + 1;
          return acc;
        }, {});
        setSourceData(
          Object.keys(sources).map((key) => ({
            name: key,
            value: sources[key],
          })),
        );

        // Activity
        const activity = [...allLeads]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 5);
        setRecentActivity(activity);

        // Workload
        const workloadMap = {};
        allLeads.forEach((lead) => {
          if (
            lead.assignedTo &&
            ["New", "Contacted", "Interested"].includes(lead.status)
          ) {
            const name = lead.assignedTo.name;
            workloadMap[name] = (workloadMap[name] || 0) + 1;
          }
        });
        const workload = Object.keys(workloadMap)
          .map((name) => ({ name, count: workloadMap[name] }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setAgentWorkload(workload);

        setLoading(false);
      } catch (error) {
        console.error("Load Failed");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const PIE_COLORS = ["#38bdf8", "#818cf8", "#c084fc", "#34d399"];

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
              {greeting},{" "}
              <span className="text-slate-400 font-medium">
                {user?.name?.split(" ")[0]}
              </span>
            </h1>
            <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <Sparkles size={10} /> Overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stats.unassigned > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-rose-950/30 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.1)]">
              <AlertCircle size={14} />
              <span className="text-xs font-bold">
                {stats.unassigned} Action Required
              </span>
            </div>
          )}
          <div className="hidden md:flex items-center gap-2 bg-[#0F0F12] px-4 py-2 rounded-lg border border-white/5 text-slate-400 hover:text-white transition-colors hover:border-white/10 cursor-default">
            <Calendar size={14} className="text-slate-500" />
            <span className="text-xs font-semibold">
              {new Date().toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-[1600px] mx-auto px-8 pt-8 space-y-8 relative z-10">
        {/* 1. KEY STATS (Interactive Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Leads"
            value={stats.total}
            icon={<Users size={18} />}
            trend="+4.5%"
            color="indigo"
          />
          <StatCard
            title="Active Pipeline"
            value={stats.active}
            icon={<Briefcase size={18} />}
            trend="High"
            color="sky"
          />
          <StatCard
            title="Closed Deals"
            value={stats.closed}
            icon={<CheckCircle2 size={18} />}
            trend="Revenue"
            color="emerald"
          />
          <StatCard
            title="Unassigned"
            value={stats.unassigned}
            icon={<AlertCircle size={18} />}
            trend="Urgent"
            color={stats.unassigned > 0 ? "rose" : "slate"}
          />
        </div>

        {/* 2. CHARTS (With Gradients) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pipeline */}
          <div className="lg:col-span-2 bg-[#0A0A0C]/80 backdrop-blur-md border border-white/5 rounded-2xl p-7 relative group transition-all duration-300 hover:border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity size={16} className="text-indigo-400" /> Pipeline
                Volume
              </h3>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pipelineData}
                  margin={{ top: 10, right: 0, left: -25, bottom: 20 }}
                >
                  <defs>
                    {pipelineData.map((entry, index) => (
                      <linearGradient
                        key={index}
                        id={`gradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={entry.fill}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor={entry.fill}
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                    vertical={false}
                    opacity={0.4}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={15}
                    fontWeight={600}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                    contentStyle={{
                      backgroundColor: "#0A0A0C",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                    {pipelineData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#gradient-${index})`}
                        stroke={entry.fill}
                        strokeWidth={1}
                      />
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
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="rgba(0,0,0,0)"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.02)" }} // Bar ke piche ka hover effect
                    contentStyle={{
                      backgroundColor: "rgba(15, 15, 18, 0.95)",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
                      color: "#fff",
                    }}
                    itemStyle={{
                      color: "#e2e8f0",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  />{" "}
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      paddingTop: "15px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8">
                <span className="text-3xl font-bold text-white tracking-tight">
                  {stats.total}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">
                  Total
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. LISTS (Refined Typography) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {/* Recent Activity Section */}
          <div className="bg-[#0A0A0C]/80 backdrop-blur-md border border-white/5 rounded-2xl p-7 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell size={16} className="text-sky-400" /> Latest Updates
              </h3>
            </div>

            <div className="space-y-4">
              {recentActivity.map((lead, index) => (
                <div
                  key={lead._id}
                  className="group flex gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.02] items-start"
                >
                  {/* Status Dot Indicator */}
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-slate-700 group-hover:bg-indigo-400 transition-colors shadow-[0_0_8px_rgba(0,0,0,0)] group-hover:shadow-[0_0_8px_rgba(99,102,241,0.5)] shrink-0"></div>

                  <div className="flex-1">
                    {/* TOP ROW: Name, Status, Time */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                          {lead.name}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wide ${
                            lead.status === "Closed"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : lead.status === "New"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : lead.status === "Interested"
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-600 font-mono font-medium whitespace-nowrap ml-2">
                        {new Date(lead.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* BOTTOM ROW: Agent Info (Updated By) */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {/* Small Avatar for Agent */}
                      <div className="w-4 h-4 rounded-md bg-[#1A1A1E] border border-white/10 flex items-center justify-center text-[8px] font-bold text-slate-400">
                        {lead.assignedTo?.name?.charAt(0) || "S"}
                      </div>

                      <p className="text-[10px] text-slate-500">
                        updated by{" "}
                        <span className="text-slate-300 font-medium">
                          {lead.assignedTo?.name || "System"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {recentActivity.length === 0 && (
                <div className="text-center py-8 text-slate-600 text-xs">
                  No recent activity found.
                </div>
              )}
            </div>
          </div>

          {/* Team Load */}
          {/* Team Workload Section (Distribution View) */}
          <div className="bg-[#0A0A0C]/80 backdrop-blur-md border border-white/5 rounded-2xl p-7 shadow-2xl flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LayoutGrid size={16} className="text-indigo-400" /> Lead
                Distribution
              </h3>
              <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-1 rounded border border-white/5 uppercase tracking-wider">
                Current Load
              </span>
            </div>

            <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {agentWorkload.map((agent, index) => {
                // Calculate Load Percentage based on max load in the team
                const maxCount = Math.max(
                  ...agentWorkload.map((a) => a.count),
                  1,
                );
                const percent = (agent.count / maxCount) * 100;

                // Load Logic: If load > 75% relative to max, color it Amber (Heavy), else Blue (Normal)
                const isHeavy = percent > 80;
                const barColor = isHeavy
                  ? "from-amber-500 to-orange-500"
                  : "from-indigo-500 to-cyan-500";
                const badgeStyle = isHeavy
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";

                return (
                  <div key={index} className="group">
                    <div className="flex justify-between items-center mb-2.5">
                      {/* Left: Avatar & Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-white/5 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:text-white group-hover:border-white/10 transition-all shadow-inner">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-300 block group-hover:text-white transition-colors">
                            {agent.name}
                          </span>
                        </div>
                      </div>

                      {/* Right: Count Badge */}
                      <div
                        className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badgeStyle} shadow-sm`}
                      >
                        {agent.count}
                      </div>
                    </div>

                    {/* Load Bar Container */}
                    <div className="w-full h-1.5 bg-[#1A1A1E] rounded-full overflow-hidden relative">
                      {/* Load Bar */}
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} opacity-80 group-hover:opacity-100 transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {agentWorkload.length === 0 && (
                <div className="text-center py-10 opacity-40 text-sm flex flex-col items-center gap-2">
                  <LayoutGrid size={24} />
                  <span>No leads assigned yet.</span>
                </div>
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
    indigo:
      "from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400 group-hover:border-indigo-500/40",
    sky: "from-sky-500/10 to-transparent border-sky-500/20 text-sky-400 group-hover:border-sky-500/40",
    emerald:
      "from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40",
    rose: "from-rose-500/10 to-transparent border-rose-500/20 text-rose-400 group-hover:border-rose-500/40",
    slate:
      "from-slate-800/10 to-transparent border-white/10 text-slate-400 group-hover:border-white/20",
  };

  const activeStyle = styles[color] || styles.slate;

  return (
    <div
      className={`relative bg-gradient-to-br ${activeStyle} bg-[#0A0A0C] border p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group overflow-hidden`}
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 shadow-inner">
          {icon}
        </div>
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={12} />
          <span className="text-[10px] font-bold uppercase tracking-wide">
            {trend}
          </span>
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-3xl font-bold text-white tracking-tight">
          {value}
        </h3>
        <p className="text-[11px] font-bold opacity-50 mt-1 uppercase tracking-widest">
          {title}
        </p>
      </div>
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#020202] p-8 space-y-8 relative overflow-hidden font-mono">
    {/* 🟢 MATRIX GRID BACKGROUND */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

    {/* ⚡ ACTIVE SCANNER LINE (Upar se niche scan karega) */}
    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-[scanline_2s_linear_infinite] z-50"></div>
    <style>{`@keyframes scanline { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>

    {/* Header Area */}
    <div className="flex justify-between items-center pb-6 border-b border-cyan-900/30 relative z-10">
      <div className="flex items-center gap-4">
        {/* Hexagon Profile Placeholder */}
        <div className="h-12 w-12 bg-cyan-950/20 border border-cyan-500/30 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-48 bg-cyan-900/20 rounded border-l-2 border-cyan-500"></div>
          <div className="h-2 w-24 bg-cyan-900/20 rounded"></div>
        </div>
      </div>
      <div className="h-10 w-32 bg-cyan-950/30 border border-cyan-500/20 rounded flex items-center justify-center">
        <div className="h-1 w-16 bg-cyan-500/30 rounded-full animate-pulse"></div>
      </div>
    </div>

    {/* Stats Grid (Neon Boxes) */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-32 bg-[#050505] border border-cyan-800/30 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.05)]"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

          <div className="flex justify-between items-start">
            <div className="h-8 w-8 bg-cyan-900/20 rounded border border-cyan-500/20"></div>
            <div className="h-3 w-10 bg-cyan-900/30 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-6 w-20 bg-cyan-900/20 rounded border-l-4 border-cyan-500/50"></div>
            <div className="h-2 w-24 bg-cyan-900/10 rounded"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Charts Area */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px] relative z-10">
      {/* Big Graph Chart */}
      <div className="lg:col-span-2 bg-[#050505] border border-cyan-800/30 rounded-xl p-6 relative flex flex-col">
        <div className="flex justify-between mb-8">
          <div className="h-4 w-32 bg-cyan-900/20 rounded border-l-2 border-cyan-500"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map((d) => (
              <div
                key={d}
                className="h-2 w-2 bg-cyan-500/20 rounded-full animate-pulse"
              ></div>
            ))}
          </div>
        </div>
        <div className="flex items-end justify-between flex-1 gap-4 px-2 border-b border-l border-cyan-900/30 pb-2 pl-2">
          {[40, 70, 50, 90, 30, 60, 80].map((h, i) => (
            <div
              key={i}
              className="w-full bg-cyan-500/10 border-t border-cyan-500/30 relative overflow-hidden"
              style={{ height: `${h}%` }}
            >
              <div className="absolute inset-0 bg-cyan-400/5 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Circle Chart */}
      <div className="bg-[#050505] border border-cyan-800/30 rounded-xl p-6 relative flex flex-col items-center justify-center">
        <div className="h-4 w-24 bg-cyan-900/20 rounded absolute top-6 left-6 border-l-2 border-cyan-500"></div>

        <div className="relative">
          <div className="h-48 w-48 rounded-full border-2 border-dashed border-cyan-900/50 flex items-center justify-center animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-0 h-48 w-48 rounded-full border-t-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-[spin_3s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 bg-cyan-900/10 rounded-full blur-md"></div>
        </div>

        <div className="mt-8 flex gap-4">
          <div className="h-2 w-10 bg-cyan-500/30 rounded-full shadow-[0_0_5px_cyan]"></div>
          {/* <div className="h-2 w-10 bg-purple-500/30 rounded-full"></div> */}
        </div>
      </div>
    </div>
  </div>
);
