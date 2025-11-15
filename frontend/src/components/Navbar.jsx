// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import anime from "animejs/lib/anime.es.js";
import { useRef, useEffect, useState } from "react";

export default function Navbar() {
  const { token, user, logout } = useAuth();

  const cartCtx = useCart() || {};
  const cart = cartCtx.cart || [];
  const bump = cartCtx.bump || 0;

  const navigate = useNavigate();
  const location = useLocation();
  const badgeRef = useRef(null);

  const [q, setQ] = useState(() => {
    // initialize search input from URL query param "name"
    try {
      const params = new URLSearchParams(location.search);
      return params.get("name") || "";
    } catch { return ""; }
  });

  // debounce navigation
  useEffect(() => {
    const id = setTimeout(() => {
      // if empty, remove the name param
      const params = new URLSearchParams(location.search);
      if (q && q.trim()) {
        params.set("name", q.trim());
      } else {
        params.delete("name");
      }
      // keep other params (category/minPrice/maxPrice) intact
      const qs = params.toString();
      navigate(`${location.pathname}${qs ? `?${qs}` : ""}`, { replace: false });
    }, 450);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    // if url changes externally (e.g. back button), sync the input
    try {
      const params = new URLSearchParams(location.search);
      const name = params.get("name") || "";
      setQ(name);
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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

  const cartCount = (cart || []).reduce((sum, it) => sum + (it.qty || 1), 0);

  useEffect(() => {
    if (!bump || !badgeRef.current) return;
    anime.remove(badgeRef.current);
    anime({
      targets: badgeRef.current,
      scale: [1, 1.25, 0.95, 1],
      translateY: [0, -6, 0],
      duration: 520,
      easing: "easeOutElastic(1, .8)"
    });
    anime({
      targets: badgeRef.current,
      backgroundColor: ["#ffecb3", "#6a00c9"],
      duration: 420,
      easing: "easeOutQuad"
    });
  }, [bump]);

  return (
    <div style={{
      display: "flex",
      padding: "12px 20px",
      background: "#fff",
      borderBottom: "1px solid #eee",
      alignItems: "center",
      gap: 12
    }}>
      <Link to="/" style={{ fontSize: 22, fontWeight: "700", color: "#6a00c9", textDecoration: "none" }}>
        Kata
      </Link>

      {/* Search input in navbar */}
      <div style={{ marginLeft: 12, minWidth: 280, maxWidth: 520, flex: "1 1 auto" }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search sweets by name (press Enter to search)..."
          onKeyDown={e => {
            if (e.key === "Enter") {
              // immediate navigate when pressing Enter
              const params = new URLSearchParams(location.search);
              if (q && q.trim()) params.set("name", q.trim()); else params.delete("name");
              const qs = params.toString();
              navigate(`${location.pathname}${qs ? `?${qs}` : ""}`, { replace: false });
            }
          }}
          aria-label="Search sweets"
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #e6e6f0",
            boxShadow: "0 4px 10px rgba(11,10,30,0.02)",
            outline: "none",
            fontSize: 14
          }}
        />
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/cart" style={{ textDecoration: "none", color: "#374151", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🛒</span>
          <span
            ref={badgeRef}
            aria-live="polite"
            style={{
              fontWeight: 700,
              minWidth: 28,
              textAlign: "center",
              padding: "4px 8px",
              borderRadius: 999,
              background: "#6a00c9",
              color: "#fff",
              display: "inline-block",
              transformOrigin: "center"
            }}
          >
            {cartCount}
          </span>
        </Link>

        {!token && (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}

        {token && (
          <>
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                aria-label="Admin panel - add sweet"
                style={{
                  display: "inline-flex",
                  gap: 10,
                  alignItems: "center",
                  background: "linear-gradient(90deg,#6a00c9,#9f00ff)",
                  color: "#fff",
                  padding: "8px 14px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(106,0,201,0.12)",
                  fontWeight: 700,
                  transformOrigin: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Admin
              </button>
            )}

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
                    fontWeight: 700,
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
