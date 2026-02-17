import { useState } from "react";
import { generateZip } from "../generateZip";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Generator() {
  const [vite, setVite] = useState(false);
  const [express, setExpress] = useState(false);
  const { user, logout } = useAuth();

  const isActive = user?.subscription === "ACTIVE" || user?.subscription === "TRIAL";

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
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Config / Boilerplate Generator</h1>
        <div>
          {user && (
            <>
              <span style={{ marginRight: 16 }}>
                {user.email} ({user.subscription})
              </span>
              {user.role === "ADMIN" && (
                <Link to="/admin" style={{ marginRight: 16, color: "#4fc3f7" }}>
                  Admin Dashboard
                </Link>
              )}
              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>

      {!isActive && (
        <div
          style={{
            padding: 16,
            background: "#f57c00",
            borderRadius: 4,
            marginBottom: 20,
          }}
        >
          Your subscription is {user?.subscription || "FREE"}. Upgrade to access the generator.
        </div>
      )}

      <p>Select your stack and generate a ZIP.</p>

      <div style={{ marginTop: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={vite}
            onChange={(e) => setVite(e.target.checked)}
            disabled={!isActive}
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
            disabled={!isActive}
          />{" "}
          Express
        </label>
      </div>

      <button
        style={{
          marginTop: 20,
          padding: "10px 18px",
          fontSize: 16,
          cursor: isActive ? "pointer" : "not-allowed",
          opacity: isActive ? 1 : 0.5,
        }}
        onClick={() => generateZip({ vite, express })}
        disabled={(!vite && !express) || !isActive}
      >
        Generate ZIP
      </button>
    </div>
  );
}
