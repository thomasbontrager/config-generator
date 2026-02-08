import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Generator() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div
        style={{
          padding: 32,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
          background: "#1e1e1e",
          minHeight: "100vh",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontSize: 18 }}>Loading...</p>
      </div>
    );
  }

  if (user.subscription !== "ACTIVE") {
    return (
      <div
        style={{
          padding: 32,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
          background: "#1e1e1e",
          minHeight: "100vh",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            padding: 40,
            borderRadius: 12,
            border: "2px solid rgba(74, 158, 255, 0.2)",
            textAlign: "center",
            maxWidth: 500,
          }}
        >
          <h2 style={{ fontSize: "2em", marginBottom: 20 }}>
            🔒 Upgrade Required
          </h2>
          <p style={{ color: "#aaa", marginBottom: 30, lineHeight: 1.6 }}>
            The generator is available on the Pro plan.
          </p>

          <Link
            to="/"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #4a9eff, #2a7dd8)",
              padding: "12px 30px",
              borderRadius: 6,
              color: "#fff",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            ← Back to Home
          </Link>
          
          <p style={{ marginTop: 20, color: "#666", fontSize: 14 }}>
            Current subscription: <strong>{user.subscription}</strong>
          </p>
        </div>
      </div>
    );
  }

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
      <div style={{ marginBottom: 20 }}>
        <Link to="/" style={{ color: "#4a9eff", textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </div>
      
      <h1 style={{ fontSize: "3em", marginBottom: 10 }}>⚡ Generator</h1>
      <p style={{ color: "#4ade80", fontSize: 18, marginBottom: 30 }}>
        ✅ You have full access!
      </p>
      
      <div
        style={{
          background: "rgba(74, 158, 255, 0.1)",
          padding: 20,
          borderRadius: 8,
          border: "1px solid rgba(74, 158, 255, 0.3)",
        }}
      >
        <p style={{ marginBottom: 10 }}>
          <strong>Email:</strong> {user.email}
        </p>
        <p style={{ marginBottom: 10 }}>
          <strong>Role:</strong> {user.role}
        </p>
        <p>
          <strong>Subscription:</strong>{" "}
          <span style={{ color: "#4ade80" }}>{user.subscription}</span>
        </p>
      </div>
    </div>
  );
}
