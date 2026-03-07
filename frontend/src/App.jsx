import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Generator from "./pages/Generator";
import Admin from "./pages/Admin";
import "./App.css";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}

function AdminRoute() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "ADMIN") {
    return (
      <div style={{ padding: 32, color: "red" }}>
        <h2>Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }
  
  return <Admin />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Generator />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={<AdminRoute />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
