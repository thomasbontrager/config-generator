import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BillingSuccess from "./pages/BillingSuccess";
import BillingCancel from "./pages/BillingCancel";
import ShipforgeCursor from "./components/ShipforgeCursor";
import ButtonStars from "./components/ButtonStars";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ShipforgeCursor />
        <ButtonStars />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/billing/success" element={<BillingSuccess />} />
          <Route path="/billing/cancel" element={<BillingCancel />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
