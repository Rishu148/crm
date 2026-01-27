import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";
import CommandDesk from "../pages/CommandDesk"; 

function AppLayout() {
  const { user } = useAuth();

  return (
    // ✨ Full Screen Container
    <div className="flex h-screen bg-[#030303] text-white font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* Custom Scrollbar Styles (Isse scrollbar patla aur dark ho jayega) */}
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #030303; 
        }
        ::-webkit-scrollbar-thumb {
          background: #262626; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #404040; 
        }
      `}</style>

        <CommandDesk />
      {/* Sidebar Key ensure karta hai ki role change hone par refresh ho */}
      <Sidebar key={user?.role || "guest"} />
      
      {/* 🛑 FIX: Maine yahan se padding (p-4/p-8) hata di hai.
         Ab Header sticky hokar top par chipkega.
         Content ke liye padding ab individual pages me handle hogi.
      */}
      <main className="flex-1 overflow-y-auto bg-[#030303] relative scroll-smooth">
        <div className="w-full min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;