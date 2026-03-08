import { useEffect, useState } from "react";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Failed to fetch users");
        return;
      }

      setUsers(data.users);
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }

  async function setSubscription(userId, subscription) {
    try {
      const res = await fetch("http://localhost:5000/api/admin/subscription", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, subscription }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update subscription");
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, subscription } : u
        )
      );
    } catch (err) {
      alert("Failed to update subscription");
    }
  }

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ padding: 32, color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1>Admin Dashboard</h1>
      <p>Manage all users and subscriptions</p>

      <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #333" }}>
            <th style={{ textAlign: "left", padding: 8 }}>Email</th>
            <th style={{ textAlign: "left", padding: 8 }}>Role</th>
            <th style={{ textAlign: "left", padding: 8 }}>Subscription</th>
            <th style={{ textAlign: "left", padding: 8 }}>Created</th>
            <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: "1px solid #555" }}>
              <td style={{ padding: 8 }}>{user.email}</td>
              <td style={{ padding: 8 }}>{user.role}</td>
              <td style={{ padding: 8 }}>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    background:
                      user.subscription === "ACTIVE" ? "#2e7d32" :
                      user.subscription === "TRIAL" ? "#f57c00" : "#555",
                  }}
                >
                  {user.subscription}
                </span>
              </td>
              <td style={{ padding: 8 }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: 8 }}>
                <select
                  value={user.subscription}
                  onChange={(e) => setSubscription(user.id, e.target.value)}
                  style={{
                    padding: "4px 8px",
                    background: "#333",
                    color: "#fff",
                    border: "1px solid #555",
                  }}
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
        <p style={{ marginTop: 20, color: "#888" }}>No users found</p>
      )}
    </div>
  );
}
