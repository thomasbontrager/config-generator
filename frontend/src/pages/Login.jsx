import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Authentication failed");
        return;
      }

      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/generator");
    } catch (err) {
      setError("Failed to connect to server");
      console.error(err);
    }
  };

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
          width: "100%",
          maxWidth: 400,
        }}
      >
        <h2 style={{ fontSize: "2em", marginBottom: 30, textAlign: "center" }}>
          {isLogin ? "Login" : "Register"}
        </h2>

        {error && (
          <div
            style={{
              background: "rgba(255, 107, 107, 0.2)",
              padding: 15,
              borderRadius: 6,
              marginBottom: 20,
              color: "#ff6b6b",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 10,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid #4a9eff",
                borderRadius: 6,
                color: "#fff",
                fontSize: 16,
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 10,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid #4a9eff",
                borderRadius: 6,
                color: "#fff",
                fontSize: 16,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              background: "linear-gradient(135deg, #4a9eff, #2a7dd8)",
              border: "none",
              borderRadius: 6,
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: "none",
              border: "none",
              color: "#4a9eff",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {isLogin
              ? "Need an account? Register"
              : "Have an account? Login"}
          </button>
        </div>

        <div
          style={{
            marginTop: 30,
            padding: 15,
            background: "rgba(74, 158, 255, 0.1)",
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: 10 }}>Test accounts:</p>
          <p style={{ marginBottom: 5 }}>
            <strong>Trial:</strong> trial@example.com
          </p>
          <p style={{ marginBottom: 5 }}>
            <strong>Active:</strong> active@example.com
          </p>
          <p style={{ marginBottom: 5 }}>
            <strong>Canceled:</strong> canceled@example.com
          </p>
          <p style={{ color: "#666", marginTop: 10 }}>
            Password: password123
          </p>
        </div>
      </div>
    </div>
  );
}
