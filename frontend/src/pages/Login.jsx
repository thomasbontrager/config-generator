import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Authentication failed");
        return;
      }

      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError("Server error. Please try again.");
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 400, margin: "0 auto" }}>
      <h2>{isRegister ? "Register" : "Login"}</h2>
      {error && (
        <div style={{ color: "red", marginBottom: 16 }}>{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ display: "block", width: "100%", marginTop: 4 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ display: "block", width: "100%", marginTop: 4 }}
            />
          </label>
        </div>
        <button type="submit" style={{ marginRight: 8 }}>
          {isRegister ? "Register" : "Login"}
        </button>
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Switch to Login" : "Switch to Register"}
        </button>
      </form>
    </div>
  );
}
