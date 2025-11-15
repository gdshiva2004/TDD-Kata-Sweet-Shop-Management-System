import { useState, useRef, useEffect } from "react";
import anime from "animejs/lib/anime.js";
import api from "../../utils/api";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function AddSweet() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const formRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    anime({
      targets: formRef.current,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      easing: "easeOutQuad"
    });
  }, []);

  const resetForm = () => {
    setName(""); setCategory(""); setPrice(""); setQuantity(0); setImageUrl("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    anime({ targets: btnRef.current, scale: [1, 0.96, 1], duration: 320, easing: "easeOutQuad" });

    if (!name || !category || !price) {
      setError("Please fill name, category and price.");
      return;
    }

    try {
      const body = { name: name.trim(), category: category.trim(), price: Number(price), quantity: Number(quantity), imageUrl: imageUrl || null };
      await api.post("/sweets", body, token);
      setSuccess("Sweet added ✨");
      anime({
        targets: formRef.current,
        scale: [1, 1.02, 1],
        duration: 450,
        easing: "easeOutBack"
      });
      resetForm();
      setTimeout(() => navigate("/", { replace: true, state: { message: "Sweet added!" } }), 900);
    } catch (err) {
      setError((err.payload && (err.payload.error || JSON.stringify(err.payload))) || err.message || "Create failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div ref={formRef} style={{
        maxWidth: 760,
        margin: "24px auto",
        padding: 20,
        borderRadius: 14,
        background: "linear-gradient(180deg, #ffffff, #fbfbff)",
        boxShadow: "0 12px 30px rgba(12,12,20,0.06)"
      }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Add a New Sweet</h2>
        <p style={{ marginTop: 0, color: "#666" }}>Create a new item to show on the homepage.</p>

        {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: "#059669", marginBottom: 12 }}>{success}</div>}

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={inputStyle} />
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" style={inputStyle} />
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (number)" style={inputStyle} />
          <input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Quantity (integer)" style={inputStyle} />
          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL (optional)" style={inputStyle} />
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button ref={btnRef} style={primaryBtnStyle} type="submit">Add Sweet</button>
            <button type="button" onClick={() => { resetForm(); setError(null); }} style={ghostBtnStyle}>Reset</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #e6e6f0",
  fontSize: 15,
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)"
};

const primaryBtnStyle = {
  background: "linear-gradient(90deg,#6a00c9,#9f00ff)",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 8px 20px rgba(106,0,201,0.12)"
};

const ghostBtnStyle = {
  background: "#fff",
  color: "#333",
  border: "1px solid #e6e6f0",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer"
};
