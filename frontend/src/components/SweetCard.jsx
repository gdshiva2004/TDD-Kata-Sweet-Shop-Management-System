import { useState } from "react";

export default function SweetCard({ sweet, onBuy }) {
  const [loading, setLoading] = useState(false);
  const img = sweet?.imageUrl || "/placeholder-sweet.jpg";

  const handleBuy = async () => {
    if (!onBuy || sweet.quantity <= 0 || loading) return;
    try {
      setLoading(true);
      await onBuy(sweet); // expecting the parent handler to return a promise
    } catch (err) {
      // parent will handle error; we just ensure loading stops
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sweet-card" style={{
      padding: 14,
      borderRadius: 14,
      background: "#fff",
      boxShadow: "0 8px 20px rgba(12,12,20,0.04)",
      width: "100%",            // allow grid to control width
      maxWidth: 260,           // visual constraint (fixes overlap)
      display: "flex",
      flexDirection: "column",
      gap: 12,
      overflow: "hidden",
      transition: "transform 220ms ease, box-shadow 220ms ease",
      willChange: "transform"
    }}>
      <div style={{
        height: 160,
        borderRadius: 10,
        overflow: "hidden",
        background: "#f7f7fb",
        position: "relative"
      }}>
        <img src={img} alt={sweet.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
        <div style={{
          position: "absolute",
          left: 10,
          top: 10,
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          padding: "6px 8px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700
        }}>
          {sweet.category}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>{sweet.name}</div>
        <div style={{ fontWeight: 800, color: "#111", background: "linear-gradient(90deg,#fff,#fff)", padding: "4px 8px", borderRadius: 8 }}>
          ₹{sweet.price}
        </div>
      </div>

      <div style={{ color: "#666", fontSize: 13, minHeight: 36 }}>
        {sweet.description ? sweet.description.slice(0, 120) + (sweet.description.length > 120 ? "…" : "") : "Delicious treat."}
      </div>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ color: sweet.quantity > 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
          {sweet.quantity > 0 ? `${sweet.quantity} in stock` : "Out of stock"}
        </div>

        <button
          onClick={handleBuy}
          disabled={sweet.quantity <= 0 || loading}
          aria-label={`Buy ${sweet.name}`}
          style={{
            background: sweet.quantity > 0 ? "linear-gradient(90deg,#6a00c9,#9f00ff)" : "#ddd",
            color: sweet.quantity > 0 ? "#fff" : "#999",
            border: "none",
            padding: "8px 14px",
            borderRadius: 10,
            cursor: sweet.quantity > 0 && !loading ? "pointer" : "not-allowed",
            fontWeight: 700,
            boxShadow: sweet.quantity > 0 ? "0 8px 18px rgba(106,0,201,0.12)" : "none",
            transition: "transform 160ms ease, box-shadow 160ms ease",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            opacity: loading ? 0.9 : 1
          }}
          onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {loading ? (
            <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 14, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "spin 0.9s linear infinite" }} />
          ) : "Buy"}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
