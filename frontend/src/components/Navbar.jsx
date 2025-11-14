import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { token, logout } = useAuth();

  const linkStyle = {
    textDecoration: "none",
    color: "blue",
    fontSize: 16,
    fontWeight: "500"
  };

  return (
    <div
      style={{
        display: "flex",
        padding: "12px 20px",
        background: "#fff",
        borderBottom: "1px solid #ddd",
        alignItems: "center"
      }}
    >
      <Link
        to="/"
        style={{
          ...linkStyle,
          fontSize: 22,
          fontWeight: "bold"
        }}
      >
        Kata
      </Link>

      <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
        {!token && (
          <>
            <Link to="/login" style={linkStyle}>
              Login
            </Link>
            <Link to="/register" style={linkStyle}>
              Register
            </Link>
          </>
        )}

        {token && (
          <>
            <Link to="/admin" style={linkStyle}>
              Admin
            </Link>
            <button onClick={logout} style={{ cursor: "pointer" }}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
