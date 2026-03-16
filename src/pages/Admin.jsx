import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { API_URL } from "../config/api";

const API_BASE = API_URL;

function getToken() {
  return localStorage.getItem("token");
}

function SubscriptionBadge({ status }) {
  const map = {
    ACTIVE: "badge-active",
    TRIAL: "badge-trial",
    FREE: "badge-free",
    CANCELLED: "badge-cancelled",
  };
  return <span className={`badge ${map[status] || "badge-free"}`}>{status || "FREE"}</span>;
}

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({ stripeSecretKey: "", stripeWebhookSecret: "", stripePriceId: "" });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [tab, setTab] = useState("users");

  useEffect(() => {
    fetchUsers();
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  }

  async function fetchUsers() {
    try {
      const data = await apiFetch("/api/admin/users");
      setUsers(data.users);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchMetrics() {
    try {
      const data = await apiFetch("/api/admin/metrics");
      setMetrics(data);
    } catch {
      // metrics endpoint may not be available, fail silently
    } finally {
      setLoadingMetrics(false);
    }
  }

  async function setSubscription(userId, subscription) {
    try {
      await apiFetch("/api/admin/subscription", {
        method: "POST",
        body: JSON.stringify({ userId, subscription }),
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, subscription } : u)));
    } catch (e) {
      alert(e.message || "Failed to update subscription");
    }
  }

  async function saveSettings(e) {
    e.preventDefault();
    try {
      await apiFetch("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (e) {
      alert(e.message || "Failed to save settings");
    }
  }

  const tabs = [
    { id: "users", label: "Users" },
    { id: "metrics", label: "Metrics" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <>
      <div className="grid-bg" />
      <Navbar />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Manage users, subscriptions, and platform settings.
          </p>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 28,
            borderBottom: "1px solid var(--border)",
            paddingBottom: 0,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="btn btn-ghost"
              style={{
                borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
                borderBottom: tab === t.id ? "2px solid var(--accent-1)" : "2px solid transparent",
                color: tab === t.id ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: tab === t.id ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <>
            {loadingUsers ? (
              <div style={{ color: "var(--text-secondary)", padding: "40px 0" }}>Loading users…</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Subscription</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontSize: 14 }}>{u.email}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: u.role === "ADMIN" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.07)",
                              color: u.role === "ADMIN" ? "var(--accent-1)" : "var(--text-muted)",
                              border: u.role === "ADMIN" ? "1px solid rgba(99,102,241,0.3)" : "1px solid var(--border)",
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <SubscriptionBadge status={u.subscription} />
                        </td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <select
                            className="input"
                            value={u.subscription}
                            onChange={(e) => setSubscription(u.id, e.target.value)}
                            style={{ width: "auto", padding: "5px 10px", fontSize: 13 }}
                          >
                            <option value="FREE">FREE</option>
                            <option value="TRIAL">TRIAL</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                    No users yet.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── METRICS TAB ── */}
        {tab === "metrics" && (
          <>
            {loadingMetrics ? (
              <div style={{ color: "var(--text-secondary)", padding: "40px 0" }}>Loading metrics…</div>
            ) : metrics ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                {[
                  { label: "Total Users", value: metrics.totalUsers ?? "—" },
                  { label: "Active Subscriptions", value: metrics.activeSubscriptions ?? "—" },
                  { label: "Trial Users", value: metrics.trialUsers ?? "—" },
                  {
                    label: "Monthly Revenue (MRR)",
                    value: metrics.mrr != null ? `$${metrics.mrr}` : "—",
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-card" style={{ padding: "24px 28px" }}>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 32, fontWeight: 800 }}>{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "var(--text-secondary)", padding: "40px 0" }}>
                Metrics endpoint not available. Make sure the backend is running.
              </div>
            )}
          </>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === "settings" && (
          <div style={{ maxWidth: 520 }}>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
              Store your payment provider keys securely. These are encrypted in the database.
            </p>

            {settingsSaved && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                ✓ Settings saved successfully.
              </div>
            )}

            <form
              className="glass-card"
              style={{ padding: 28, display: "grid", gap: 18 }}
              onSubmit={saveSettings}
            >
              {[
                { key: "stripeSecretKey", label: "Stripe Secret Key", placeholder: "sk_live_…" },
                { key: "stripeWebhookSecret", label: "Stripe Webhook Secret", placeholder: "whsec_…" },
                { key: "stripePriceId", label: "Stripe Price ID", placeholder: "price_…" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label
                    htmlFor={key}
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      marginBottom: 6,
                    }}
                  >
                    {label}
                  </label>
                  <input
                    id={key}
                    className="input"
                    type="password"
                    value={settings[key]}
                    onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    autoComplete="off"
                  />
                </div>
              ))}

              <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>
                Save Settings
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
