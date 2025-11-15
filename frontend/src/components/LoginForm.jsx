import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import anime from "animejs/lib/anime.js";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const btnRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");

    anime({
      targets: btnRef.current,
      scale: [1, 0.95, 1],
      duration: 300,
      easing: "easeOutQuad"
    });

    try {
      await login(email.trim(), password);

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      const msg =
        (err.payload && (err.payload.error || JSON.stringify(err.payload))) ||
        err.message ||
        "Login failed";
      setError(msg);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 15 }}>

      {error && <div style={{ color: "crimson" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16
        }}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16
        }}
      />

      <button
        ref={btnRef}
        style={{
          padding: "12px 20px",
          background: "#4a8fff",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 16
        }}
      >
        Login
      </button>
    </form>
  );
}
