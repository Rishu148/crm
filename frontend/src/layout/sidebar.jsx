import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PieChart,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // 🔥 TRIGGER COMMAND DECK LOGIC
  const openCommandDeck = () => {
    // Ye line Ctrl+K press karne jaisa event dispatch karti hai
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true
    }));
  };

  const menu = [
    ...(user?.role === "user" ? [{ name: "Home", icon: LayoutDashboard, path: "/home" }] : []),
    ...(user?.role === "admin" ? [{ name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }] : []),
    { name: "Contacts", icon: Users, path: "/contacts" },
    { name: "Pipeline", icon: GitBranch, path: "/pipeline" },
  ];

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <aside 
        className={`h-screen bg-[#050505] flex flex-col border-r border-white/5 transition-all duration-300 relative z-50 shadow-[5px_0_30px_rgba(0,0,0,0.5)] ${
          isCollapsed ? "w-[80px]" : "w-72"
        }`}
      >
        
        {/* 🟢 TOGGLE BUTTON */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-[#0A0A0C] hover:bg-indigo-500 text-slate-400 hover:text-white rounded-full p-1.5 border border-white/10 hover:border-indigo-400 shadow-xl transition-all duration-300 z-[100] cursor-pointer group"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* ================= LOGO SECTION ================= */}
        <div className={`flex items-center gap-4 p-6 mb-4 ${isCollapsed ? "justify-center px-0" : ""}`}>
          <div 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="relative w-10 h-10 shrink-0 cursor-pointer group"
          >
             <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-[10px] opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>
             <div className="relative w-full h-full bg-gradient-to-br from-[#1a1a20] to-[#0A0A0C] rounded-xl flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-all">
                <PieChart className="text-indigo-400 group-hover:text-white transition-colors" size={20} />
             </div>
          </div>
          
          <div className={`overflow-hidden transition-all duration-300 cursor-pointer ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`} onClick={() => setIsCollapsed(!isCollapsed)}>
            <h1 className="font-bold text-white text-xl tracking-tight leading-none group-hover:text-indigo-400 transition-colors">Vortex CRM</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-[0.25em] mt-1.5 uppercase">Workspace</p>
          </div>
        </div>

        {/* ================= MENU ================= */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar py-2">
          {menu.map((item) => {
            const active = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <div key={item.name} className="relative group">
                  {active && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"></div>
                  )}

                  <div
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden
                          ${active 
                            ? "bg-white/[0.03] text-white border border-white/10" 
                            : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.02] border border-transparent"
                          }
                          ${isCollapsed ? "justify-center" : "pl-6"}
                      `}
                  >
                      {active && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none"></div>}
                      <Icon size={20} className={`shrink-0 transition-all duration-300 relative z-10 ${active ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "group-hover:text-slate-200"}`} />
                      <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 relative z-10 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>{item.name}</span>
                  </div>

                  {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-[#1a1a20] text-slate-200 text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[999] border border-white/10">
                          {item.name}
                          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-[#1a1a20] rotate-45 border-l border-b border-white/10"></div>
                      </div>
                  )}
              </div>
            );
          })}
        </nav>

        {/* ================= PROFILE & FOOTER ================= */}
        <div className="p-4 border-t border-white/5 bg-[#050505] space-y-2 overflow-hidden whitespace-nowrap">
          
          {/* Settings Item */}
          <div
              onClick={() => navigate("/settings")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-white/5 hover:text-white transition-all cursor-pointer group relative ${isCollapsed ? "justify-center" : "pl-4"}`}
          >
              <Settings size={20} className="shrink-0 group-hover:rotate-90 transition-transform duration-500" />
              <span className={`font-medium text-sm whitespace-nowrap transition-all ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>Settings</span>
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-[#1a1a20] text-slate-200 text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[999] border border-white/10">
                  Settings
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-[#1a1a20] rotate-45 border-l border-b border-white/10"></div>
                </div>
              )}
          </div>

          {/* 🔴 Logout Item (Visible in Collapsed Mode) */}
          {isCollapsed && (
            <div
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer group relative"
            >
                <LogOut size={20} className="shrink-0" />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-[#1a1a20] text-rose-400 text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[999] border border-rose-500/20">
                  Logout
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-[#1a1a20] rotate-45 border-l border-b border-white/10"></div>
                </div>
            </div>
          )}

          {/* Profile Section - Added openCommandDeck on click */}
          <div 
            onClick={openCommandDeck}
            className={`flex items-center gap-3 p-3 rounded-xl bg-[#0A0A0C] border border-white/5 transition-all duration-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 cursor-pointer group ${isCollapsed ? "justify-center bg-transparent border-0 p-0" : ""}`}
            title={isCollapsed ? "Open Command Deck" : ""}
          >
              <div className="relative shrink-0 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-400 font-bold border border-white/10 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0A0A0C] rounded-full"></div>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>
                  <p className="text-sm font-bold text-white truncate max-w-[120px] group-hover:text-indigo-400 transition-colors">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px] font-medium">{user?.email}</p>
              </div>

              {!isCollapsed && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleLogout(); }} 
                    className="ml-auto p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer group/logout" 
                    title="Logout"
                  >
                      <LogOut size={16} className="transition-transform group-hover/logout:translate-x-0.5" />
                  </button>
              )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;