import { useState, useEffect, useMemo, memo } from "react";
import { Server, Database, Lock, Globe, Cpu } from "lucide-react";
import { useAuth } from "../context/authContext";

const LoadingScreen = memo(({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [activeModule, setActiveModule] = useState(0);
  const { loading: authLoading } = useAuth(); // Real backend status fetch kiya

  // useMemo: Taaki ye arrays har render pe dobara na banein
  const messages = useMemo(
    () => [
      "Establishing Secure Connection...",
      "Verifying User Credentials...",
      "Syncing Sales Pipeline...",
      "Decrypting Lead Data...",
      "Optimizing Dashboard Modules...",
      "Loading CRM Interface...",
    ],
    [],
  );

  const modules = useMemo(
    () => [
      { icon: <Server size={18} />, label: "Server" },
      { icon: <Database size={18} />, label: "Database" },
      { icon: <Lock size={18} />, label: "Security" },
      { icon: <Globe size={18} />, label: "Network" },
    ],
    [],
  );

  // 🛡️ PROGRESS LOGIC: Adaptive simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }

        // 💡 REAL LOGIC: Agar backend busy hai (authLoading true), toh 90% pe hold karo.
        // Isse user ko lagega system "asli" kaam kar raha hai.
        if (authLoading && prev >= 90) return 90;

        const jump = Math.floor(Math.random() * 3) + 1;
        return Math.min(prev + jump, 100);
      });
    }, 45); // Thoda fast frequency for smoothness

    return () => clearInterval(timer);
  }, [authLoading]);

  // 📝 TEXT & MODULE CYCLING
  useEffect(() => {
    const msgTimer = setInterval(() => {
      setActiveModule((prev) => (prev + 1) % modules.length);
    }, 800);
    return () => clearInterval(msgTimer);
  }, [modules.length]);

  // 🎯 COMPLETION TRIGGER
  useEffect(() => {
    if (progress === 100 && !authLoading) {
      const finishTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 500);
      return () => clearTimeout(finishTimer);
    }
  }, [progress, authLoading, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020202] text-white flex flex-col items-center justify-center font-mono overflow-hidden">
      <style>{`
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #1f2937 1px, transparent 1px),
                            linear-gradient(to bottom, #1f2937 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]" />
      <div className="absolute inset-0 w-full h-[20px] bg-indigo-500/10 blur-xl animate-[scanline_3s_linear_infinite] pointer-events-none" />

      {/* ⚛️ MAIN REACTOR CORE */}
      <div className="relative mb-12">
        <div className="w-48 h-48 rounded-full border border-indigo-500/20 border-t-indigo-500 animate-[spin_3s_linear_infinite] shadow-[0_0_30px_rgba(99,102,241,0.2)]" />
        <div className="absolute top-4 left-4 right-4 bottom-4 rounded-full border border-purple-500/30 border-b-purple-500 animate-[spin-reverse_2s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#0A0A0C] rounded-full border border-indigo-400/50 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)] animate-pulse">
          <Cpu size={32} className="text-indigo-400" />
        </div>
      </div>

      <div className="z-10 text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse">
          SALES<span className="font-light text-white">CRM</span>
        </h2>
        <p className="text-xs text-indigo-300 uppercase tracking-widest h-4">
          {progress >= 90 && authLoading
            ? "Finalizing Authentication..."
            : messages[activeModule]}
        </p>
      </div>

      <div className="w-80 h-1 bg-slate-900 rounded-full mt-8 overflow-hidden relative border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-[10px] text-slate-500 font-bold">
        {progress}% COMPLETED
      </p>

      <div className="absolute bottom-10 flex gap-8">
        {modules.map((mod, index) => (
          <div
            key={index}
            className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeModule === index ? "opacity-100 scale-110" : "opacity-30 scale-90"}`}
          >
            <div
              className={`p-2 rounded-full border ${activeModule === index ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-transparent border-slate-700 text-slate-600"}`}
            >
              {mod.icon}
            </div>
            <span className="text-[8px] uppercase tracking-wider font-bold">
              {mod.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default LoadingScreen;
