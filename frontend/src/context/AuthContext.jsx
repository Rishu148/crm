import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true); 
    try {
      const res = await api.get("/auth/me");
      setUser(res.data?.user || null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false); 
    }
  };


//   const fetchUser = async () => {
//   // 🛡️ CHECK: Kya ye wahi tab hai? 
//   // Agar sessionStorage mein flag nahi hai, matlab naya tab khula hai.
//   const isNewTab = !sessionStorage.getItem("tab_session_active");

//   setLoading(true);
//   try {
//     const res = await api.get("/auth/me");
    
//     if (res.data?.user) {
//       // Agar naya tab hai aur tu chahta hai naya login mange:
//       if (isNewTab) {
//         setUser(null); // Force logout for new tab
//         // Note: Asli safety backend se cookie expire karne mein hi hai.
//       } else {
//         setUser(res.data.user);
//       }
//     }
//   } catch (err) {
//     setUser(null);
//   } finally {
//     setLoading(false);
//   }
// };


  const loginAction = (userData) => {
    setUser(userData); 
    // Yahan loading false nahi karni, App.jsx handle karega
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch (e) { console.error(e); }
    setUser(null); 
    sessionStorage.removeItem("boot_played"); // Logout pe reset zaroori hai
  };

  useEffect(() => { fetchUser(); }, []);

  return (
    <AuthContext.Provider value={{ user, fetchUser, logout, loginAction, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);