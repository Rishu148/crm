import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Refresh pe agar auth loading hai, toh ye spinner dikhayega
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#030303] text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  // Agar loading khatam ho gayi aur user nahi mila, toh login pe bhejo
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role based check: Agar admin user role wale page pe hai or vice-versa
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Safety check: Agar role undefined hai toh white screen se bachne ke liye direct home bhejo
    const targetPath = user.role === "admin" ? "/dashboard" : "/home";
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;