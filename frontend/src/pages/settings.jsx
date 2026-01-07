import { LogOut, User, Shield, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
   
    localStorage.removeItem("token");
    localStorage.removeItem("user"); 
    
    navigate("/login");
  };

  return (
    <div className="h-screen bg-[#0A0E1A] px-8 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">
            Manage your account preferences and security
          </p>
        </div>

        {/* PROFILE */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              AM
            </div>
            <div>
              <p className="text-white font-semibold">Alex Morgan</p>
              <p className="text-slate-400 text-sm">admin@crm.com</p>
            </div>
          </div>
        </div>

        {/* OPTIONS */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800">
          
          <SettingItem
            icon={<User />}
            title="Account"
            desc="Personal information & profile"
          />

          <SettingItem
            icon={<Shield />}
            title="Security"
            desc="Password & authentication"
          />

          <SettingItem
            icon={<Bell />}
            title="Notifications"
            desc="Email & app alerts"
          />

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut />
            <div className="text-left">
              <p className="font-medium">Logout</p>
              <p className="text-xs text-red-400/70">
                Sign out from your account
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;

/* ================= SMALL COMPONENT ================= */
function SettingItem({ icon, title, desc }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 hover:bg-[#1E293B] transition">
      <div className="text-slate-400">{icon}</div>
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
