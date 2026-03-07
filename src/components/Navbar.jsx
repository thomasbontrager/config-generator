import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ⚡ Shipforge
      </Link>

      <div className="navbar-links">
        <Link to="/pricing" className="navbar-link">
          Pricing
        </Link>

        {user ? (
          <>
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>
            {user.role === "ADMIN" && (
              <Link to="/admin" className="navbar-link">
                Admin
              </Link>
            )}
            <button
              className="btn btn-ghost"
              onClick={handleLogout}
              style={{ fontSize: 14 }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary" style={{ padding: "7px 16px" }}>
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
