import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "./context/authContext.jsx";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  BarChart3,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Shield
} from "lucide-react";
import LoadingScreen from "./pages/LoadingScreen.jsx"; 

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function Login() {
  const navigate = useNavigate();
  const { loginAction } = useAuth();

  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 👇 2. NAYI STATE ANIMATION KE LIYE
  const [showBootLoader, setShowBootLoader] = useState(false);
  const [targetRole, setTargetRole] = useState(""); // Role store karne ke liye

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // 👇 3. LOGIC UPDATE: Navigate ki jagah Loader chalao
  const handleLoginSuccess = (role) => {
    setTargetRole(role);       // Role save kiya
    setIsLoading(false);       // Button loader band
    setShowBootLoader(true);   // Cyber Loader shuru
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
        setError("Please fill in all fields.");
        return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/auth/login`, formData, { withCredentials: true });
      
      // 🚩 Ye line add kar: loginAction se pehle flag set karo
      sessionStorage.setItem("login_in_progress", "true"); 

      if (res.data.user) loginAction(res.data.user); 
      handleLoginSuccess(res.data.user.role); 
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
      setIsLoading(false);
    } 
};

const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");
    try {
        const res = await axios.post(`${API_URL}/auth/google`, { token: credentialResponse.credential }, { withCredentials: true });
        
        sessionStorage.setItem("login_in_progress", "true"); // 🚩 Ye line add kar
        
        if (res.data.user) loginAction(res.data.user); 
        handleLoginSuccess(res.data.user.role);
    } catch (err) {
        setError("Google authentication failed.");
        setIsLoading(false);
    } 
};

  // 👇 4. AGAR BOOT LOADER TRUE HAI, TOH PURI SCREEN PE ANIMATION DIKHAO
  if (showBootLoader) {
    return (
      <LoadingScreen 
        onComplete={() => {
          // 👇 5. Jab Animation khatam ho, tabhi Navigate karo
          if (targetRole === "admin") navigate("/dashboard");
          else navigate("/home");
        }} 
      />
    );
  }

  // --- BAAKI TERA CODE SAME TO SAME ---
  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-indigo-500/30 flex w-full">
      
        <style>{`
    /* Normal Input ke liye */
    input {
        caret-color: white !important;
    }

    /* Autofill hone par */
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus, 
    input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px #0A0A0C inset !important;
        -webkit-text-fill-color: white !important;
        caret-color: white !important; /* 👇 Ye line cursor wapas layegi */
        transition: background-color 5000s ease-in-out 0s;
    }
`}</style>

      {/* LEFT SIDE - CLEAN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10 border-r border-white/5 bg-[#030303]">
        
        {/* Brand Header */}
        <div className="absolute top-10 left-8 sm:left-16 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BarChart3 size={18} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">SalesForce<span className="text-indigo-500">One</span></span>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-8 mt-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h1>
                <p className="text-slate-400 text-sm">Please enter your details to sign in.</p>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={16} className="shrink-0"/> 
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                    <div className="relative group">
                        <input 
                            type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="name@company.com"
                            className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all pl-10"
                        />
                        <Mail className="absolute left-3 top-3 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16}/>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                        <Link to="#" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Forgot Password?</Link>
                    </div>
                    <div className="relative group">
                        <input 
                            type={showPass ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password"
                            className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all pl-10 pr-10"
                        />
                        <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16}/>
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors cursor-pointer">
                            {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                    {isLoading ? <Loader2 className="animate-spin" size={18}/> : <>Sign in</>}
                </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#030303] px-3 text-slate-500 font-medium">Or continue with</span></div>
            </div>

            <div className="w-full grayscale hover:grayscale-0 transition-all duration-300 opacity-80 hover:opacity-100">
                <GoogleLogin 
                    theme="filled_black" size="large" width="100%" shape="pill" text="signin_with" 
                    onSuccess={handleGoogleSuccess} onError={() => setError("Google failed")} 
                />
            </div>

            <p className="text-center text-sm text-slate-400">
                New to SalesForce One? <Link to="/register" className="text-white hover:text-indigo-400 font-semibold transition-colors">Create an account</Link>
            </p>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 opacity-60">
                <Shield size={10} /> Protected by Enterprise Security
            </p>
        </div>
      </div>

      {/* RIGHT SIDE - PROFESSIONAL VISUAL */}
      <div className="hidden lg:flex w-1/2 bg-[#050505] relative items-center justify-center overflow-hidden">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px]"></div>
        
        {/* Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]"></div>

        <div className="relative z-10 max-w-lg p-8">
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wide mb-6">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    New Release v2.0
                </div>
                <h2 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
                    Close deals <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">faster than ever.</span>
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                    The all-in-one CRM platform designed for high-growth sales teams. Track, manage, and analyze your revenue pipeline in real-time.
                </p>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#0A0A0C] border border-white/5 backdrop-blur-sm">
                    <CheckCircle2 className="text-emerald-500 mb-2" size={20}/>
                    <h4 className="font-bold text-white text-sm">Automated Workflows</h4>
                    <p className="text-xs text-slate-500 mt-1">Save 10+ hours/week</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#0A0A0C] border border-white/5 backdrop-blur-sm">
                    <BarChart3 className="text-blue-500 mb-2" size={20}/>
                    <h4 className="font-bold text-white text-sm">Real-time Analytics</h4>
                    <p className="text-xs text-slate-500 mt-1">Data driven decisions</p>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}

export default Login;