import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export default function Login({ signup: isSignupProp = false }) {
  const [isRegister, setIsRegister] = useState(isSignupProp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : { message: "Unexpected server response" };

      if (!res.ok) {
        setError(data.message || "Authentication failed");
        return;
      }

      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Auth request failed:", err);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid-bg" />

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Link
              to="/"
              style={{
                fontSize: 22,
                fontWeight: 800,
                background: "var(--gradient)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textDecoration: "none",
              }}
            >
              ⚡ Shipforge
            </Link>
            <p
              style={{
                marginTop: 8,
                color: "var(--text-secondary)",
                fontSize: 14,
              }}
            >
              {isRegister ? "Create your account" : "Welcome back"}
            </p>
          </div>

          <div className="glass-card" style={{ padding: 32 }}>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  Password
                </label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? "Min. 8 characters" : "Your password"}
                  required
                  minLength={isRegister ? 8 : undefined}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  marginTop: 4,
                  padding: "12px 0",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                {loading ? "Please wait…" : isRegister ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div
              style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: "1px solid var(--border)",
                textAlign: "center",
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              {isRegister ? (
                <>
                  Already have an account?{" "}
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "0 4px", fontSize: 13, color: "var(--accent-1)" }}
                    onClick={() => {
                      setIsRegister(false);
                      setError("");
                    }}
                    type="button"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "0 4px", fontSize: 13, color: "var(--accent-1)" }}
                    onClick={() => {
                      setIsRegister(true);
                      setError("");
                    }}
                    type="button"
                  >
                    Sign up free
                  </button>
                </>
              )}
            </div>
          </div>

          <p
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            By signing up you agree to our{" "}
            <Link to="/" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>
              Terms
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
