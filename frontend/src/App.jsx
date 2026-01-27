import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext.jsx";
import LoadingScreen from "./pages/LoadingScreen.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import Layout from "./layout/layout.jsx";
import Login from "./login.jsx";

// Isse Dashboard load karte waqt Pipeline ya Settings ka code download nahi hoga
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const Settings = lazy(() => import("./pages/Settings"));
const LeadModal = lazy(() => import("./pages/LeadModal"));
const Register = lazy(() => import("./register"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Ek chota Loader fallback taaki lazy loading ke beech black screen na dikhe
const PageLoader = () => <div className="min-h-screen bg-[#030303]" />;

function App() {
  const { loading: authLoading, user } = useAuth();
  const [bootLoading, setBootLoading] = useState(
    () => !sessionStorage.getItem("boot_played"),
  );

  useEffect(() => {
    if (user && !sessionStorage.getItem("boot_played")) {
      setBootLoading(true);
    }
  }, [user]);

  const handleAnimationComplete = () => {
    sessionStorage.setItem("boot_played", "true");
    setBootLoading(false);
  };

  if (bootLoading) {
    return <LoadingScreen onComplete={handleAnimationComplete} />;
  }

  if (authLoading) {
    return <div className="min-h-screen bg-[#030303]" />;
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* 📦 Suspense ensures your app doesn't crash while downloading chunks */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={
                  user
                    ? user.role === "admin"
                      ? "/dashboard"
                      : "/home"
                    : "/login"
                }
                replace
              />
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={user.role === "admin" ? "/dashboard" : "/home"}
                  replace
                />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/home" replace /> : <Register />}
          />

          <Route element={<Layout />}>
            <Route
              element={<ProtectedRoute allowedRoles={["user", "admin"]} />}
            >
              <Route path="/home" element={<Home />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/Settings" element={<Settings />} />
              <Route path="/lead/:id" element={<LeadModal />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
