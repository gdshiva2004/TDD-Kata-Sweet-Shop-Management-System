import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const linkStyle = {
    textDecoration: "none",
    color: "#5b21b6",
    fontSize: 16,
    fontWeight: 500
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const avatarSrc = user && user.email
    ? `https://avatars.dicebear.com/api/identicon/${encodeURIComponent(user.email)}.svg`
    : `https://avatars.dicebear.com/api/identicon/guest.svg`;

  return (
    <div style={{
      display: "flex",
      padding: "12px 20px",
      background: "#fff",
      borderBottom: "1px solid #eee",
      alignItems: "center",
      gap: 12
    }}>
      <Link to="/" style={{ ...linkStyle, fontSize: 22, fontWeight: "700", color: "#6a00c9" }}>
        Kata
      </Link>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {!token && (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}

        {token && (
          <>
            {user?.role === "admin" && <Link to="/admin" style={linkStyle}>Admin</Link>}

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={avatarSrc}
                alt="avatar"
                style={{ width: 36, height: 36, borderRadius: 999, boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize: 14, color: "#333" }}>{user?.name || "User"}</div>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 600,
                    boxShadow: "0 6px 14px rgba(0,0,0,0.08)"
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
