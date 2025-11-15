import { useEffect, useState } from "react";
import anime from "animejs/lib/anime.js";
import api from "../utils/api";
import SweetCard from "../components/SweetCard";
import { useLocation } from "react-router-dom";

export default function Home() {
  const [sweets, setSweets] = useState([]);
  const location = useLocation();
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get("/sweets").then(data => {
      setSweets(data || []);
      setTimeout(() => {
        anime({
          targets: ".sweet-card",
          translateY: [18, 0],
          opacity: [0, 1],
          scale: [0.98, 1],
          delay: anime.stagger(100),
          duration: 650,
          easing: "easeOutCubic"
        });
      }, 80);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setMsg(location.state.message);
      const t = setTimeout(() => setMsg(null), 3200);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  const handleBuy = async (sweet) => {
    if (sweet.quantity <= 0) return;
    // optimistic update
    setSweets(prev => prev.map(s => s._id === sweet._id ? { ...s, quantity: s.quantity - 1 } : s));
    try {
      const res = await api.post(`/sweets/${sweet._id}/purchase`);
      if (res && res.sweet) {
        setSweets(prev => prev.map(s => s._id === sweet._id ? res.sweet : s));
      }
    } catch (err) {
      // rollback on failure
      setSweets(prev => prev.map(s => s._id === sweet._id ? { ...s, quantity: s.quantity + 1 } : s));
      setMsg("Purchase failed");
      setTimeout(() => setMsg(null), 2600);
      throw err; // rethrow so SweetCard loading stops and parent caller can know
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {msg && <div style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: "linear-gradient(90deg,#16a34a,#06b6d4)",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        zIndex: 2000,
        fontWeight: 700
      }}>{msg}</div>}

      <h2 style={{ margin: 0 }}>Available Sweets</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 20,
        marginTop: 20,
        alignItems: "start"
      }}>
        {sweets.map(s => (
          <div key={s._id} style={{ display: "flex", justifyContent: "center" }}>
            <SweetCard sweet={s} onBuy={handleBuy} />
          </div>
        ))}
      </div>
    </div>
  );
}
