import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { generateZip } from "./generateZip";
import BillingSuccess from "./pages/BillingSuccess";
import BillingCancel from "./pages/BillingCancel";
import Pricing from "./pages/Pricing";
import "./App.css";

function Home() {
  const [vite, setVite] = useState(false);
  const [express, setExpress] = useState(false);

  return (
    <div
      style={{
        padding: 32,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
        background: "#1e1e1e",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h1>Config / Boilerplate Generator</h1>
      <p>Select your stack and generate a ZIP.</p>

      <div style={{ marginTop: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={vite}
            onChange={(e) => setVite(e.target.checked)}
          />{" "}
          Vite + React
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <label>
          <input
            type="checkbox"
            checked={express}
            onChange={(e) => setExpress(e.target.checked)}
          />{" "}
          Express
        </label>
      </div>

      <button
        style={{
          marginTop: 20,
          padding: "10px 18px",
          fontSize: 16,
          cursor: "pointer",
        }}
        onClick={() => generateZip({ vite, express })}
        disabled={!vite && !express}
      >
        Generate ZIP
      </button>

      <div style={{ marginTop: 30 }}>
        <Link
          to="/pricing"
          style={{
            color: "#4a9eff",
            textDecoration: "none",
            fontSize: 16,
          }}
        >
          💰 View Pricing
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/billing/cancel" element={<BillingCancel />} />
      </Routes>
    </BrowserRouter>
  );
}
