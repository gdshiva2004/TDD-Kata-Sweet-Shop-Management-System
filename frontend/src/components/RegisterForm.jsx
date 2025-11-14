import { useState, useRef } from "react";
import api from "../utils/api";
import anime from "animejs";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const btnRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    anime({
      targets: btnRef.current,
      scale: [1, 0.95, 1],
      duration: 300,
      easing: "easeOutQuad"
    });
    await api.post("/auth/register", { email, password });
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
          background: "#00b894",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 16
        }}
      >
        Register
      </button>
    </form>
  );
}
