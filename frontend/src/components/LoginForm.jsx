import { useState, useRef, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import anime from "animejs/lib/anime.es.js";



export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const btnRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    anime({
      targets: btnRef.current,
      scale: [1, 0.95, 1],
      duration: 300,
      easing: "easeOutQuad"
    });
    login(email, password);
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 15 }}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
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
        onChange={e => setPassword(e.target.value)}
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
