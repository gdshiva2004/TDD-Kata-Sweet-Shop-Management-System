// src/components/EditSweetModal.jsx
import { useEffect, useRef, useState } from "react";
import anime from "animejs/lib/anime.js";

export default function EditSweetModal({ sweet, onClose, onSave }) {
  const [name, setName] = useState(sweet?.name || "");
  const [category, setCategory] = useState(sweet?.category || "");
  const [price, setPrice] = useState(String(sweet?.price ?? ""));
  const [quantity, setQuantity] = useState(String(sweet?.quantity ?? 0));
  const [imageUrl, setImageUrl] = useState(sweet?.imageUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (wrapRef.current) {
      anime({
        targets: wrapRef.current,
        opacity: [0, 1],
        scale: [1.02, 1],
        duration: 360,
        easing: "easeOutBack"
      });
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !category.trim() || !price) {
      setError("Name, category and price are required");
      return;
    }

    const payload = {
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      quantity: Number(quantity || 0),
      imageUrl: imageUrl || null
    };

    try {
      setLoading(true);
      await onSave(sweet._id, payload); // parent handles API call and state update
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError((err && (err.message || err.error)) || "Update failed");
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(8,10,14,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3000
    }} onClick={onClose}>
      <div ref={wrapRef} onClick={e => e.stopPropagation()} style={{
        width: 720,
        maxWidth: "94%",
        borderRadius: 12,
        background: "#fff",
        padding: 18,
        boxShadow: "0 20px 60px rgba(2,6,23,0.25)"
      }}>
        <h3 style={{ margin: 0 }}>Edit Sweet</h3>
        <p style={{ marginTop: 6, marginBottom: 12, color: "#666" }}>Update sweet details and save.</p>

        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 10 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={field} />
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" style={field} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input value={price} onChange={e => { if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) setPrice(e.target.value); }} placeholder="Price" style={field} />
            <input value={quantity} onChange={e => { if (/^\d*$/.test(e.target.value)) setQuantity(e.target.value); }} placeholder="Quantity" style={field} />
          </div>

          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL (optional)" style={field} />

          {error && <div style={{ color: "crimson" }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={onClose} style={ghostBtn}>Cancel</button>
            <div style={{ marginLeft: "auto", color: "#666", fontSize: 13 }}>id: {String(sweet._id).slice(-8)}</div>
          </div>
        </form>
      </div>
    </div>
  );
}

const field = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #e6e6f0",
  fontSize: 14
};

const primaryBtn = {
  background: "linear-gradient(90deg,#6a00c9,#9f00ff)",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700
};

const ghostBtn = {
  background: "#fff",
  color: "#333",
  border: "1px solid #e6e6f0",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer"
};
