import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import App from "./App";
import "./index.css";

function AppWithRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      // Validate redirect path before navigation
      if (
        redirect.startsWith('/') &&
        !redirect.startsWith('//') &&
        !redirect.includes('://') &&
        !redirect.includes('\\')
      ) {
        navigate(redirect);
      } else {
        navigate('/');
      }
    }
  }, [navigate]);

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithRedirect />
    </BrowserRouter>
  </React.StrictMode>
);
