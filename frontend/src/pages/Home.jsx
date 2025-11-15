import { useEffect, useState } from "react";
import anime from "animejs/lib/anime.js";
import api from "../utils/api";
import SweetCard from "../components/SweetCard";
import { useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Home() {
  const [sweets, setSweets] = useState([]);
  const location = useLocation();
  const [msg, setMsg] = useState(null);
  const { token } = useAuth();

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
    setMsg(null);

    const prev = sweets;
    // optimistic update
    setSweets(prevList => prevList.map(s => s._id === sweet._id ? { ...s, quantity: s.quantity - 1 } : s));

    try {
      const res = await api.post(`/sweets/${sweet._id}/purchase`, {}, token);
      // If backend returns updated sweet use it
      if (res && res.sweet) {
        setSweets(prevList => prevList.map(s => s._id === sweet._id ? res.sweet : s));
        setMsg("Purchase successful");
        setTimeout(() => setMsg(null), 2200);
      } else {
        // If no sweet returned, re-fetch single or full list to sync
        const refreshed = await api.get("/sweets");
        setSweets(refreshed || []);
        setMsg("Purchase completed");
        setTimeout(() => setMsg(null), 2200);
      }
    } catch (err) {
      // rollback on failure
      setSweets(prevList => prevList.map(s => s._id === sweet._id ? { ...s, quantity: s.quantity + 1 } : s));
      const serverMsg = err && err.payload && (err.payload.error || err.payload.message) ? (err.payload.error || err.payload.message) : null;
      setMsg(serverMsg || "Purchase failed");
      setTimeout(() => setMsg(null), 2600);
      throw err;
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
