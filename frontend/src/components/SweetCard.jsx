export default function SweetCard({ sweet }) {
  const img = sweet?.imageUrl || "/placeholder-sweet.jpg";
  return (
    <div style={{
      padding: 12,
      borderRadius: 12,
      background: "#fff",
      boxShadow: "0 8px 20px rgba(12, 12, 20, 0.04)",
      width: 260,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      overflow: "hidden"
    }}>
      <div style={{ height: 160, borderRadius: 10, overflow: "hidden", background: "#f7f7fb" }}>
        <img src={img} alt={sweet.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{sweet.name}</div>
        <div style={{ fontWeight: 700, color: "#111" }}>₹{sweet.price}</div>
      </div>

      <div style={{ color: "#666", fontSize: 13 }}>{sweet.category}</div>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: sweet.quantity > 0 ? "#10b981" : "#ef4444", fontWeight: 600 }}>
          {sweet.quantity > 0 ? `${sweet.quantity} in stock` : "Out of stock"}
        </div>
        <button style={{
          background: "#6a00c9",
          color: "#fff",
          border: "none",
          padding: "8px 12px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 600
        }}>
          Buy
        </button>
      </div>
    </div>
  );
}
