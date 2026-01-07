import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./login";
import Register from "./register";

import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Pipeline from "./pages/pipeline";
// import Revenue from "./pages/Revenue";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";

function App() {
  return ( 
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* App with Sidebar */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/pipeline" element={<Pipeline />} />
        {/* <Route path="/revenue" element={<Revenue />} /> */}
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
