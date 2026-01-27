import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"
import { BrowserRouter } from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";

import axios from "axios";
import { AuthProvider } from "./context/AuthContext.jsx";

axios.defaults.withCredentials = true;


ReactDOM.createRoot(document.getElementById("root")).render(

 <GoogleOAuthProvider clientId="24617494428-bgrs5iedrqoug4eq0um21mni5bug0shn.apps.googleusercontent.com">
    <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
