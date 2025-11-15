import { useEffect, useState, useRef } from "react";
import anime from "animejs/lib/anime.js";
import useAuth from "../hooks/useAuth";
import api from "../utils/api";
import EditSweetModal from "../components/EditSweetModal";

export default function AdminPanel() {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(null);
  const formRef = useRef(null);
  const btnRef = useRef(null);

  // load sweets
  useEffect(() => {
    let mounted = true;
    api.get("/sweets").then(data => {
      if (mounted) setList(data || []);
      setTimeout(() => {
        anime({
          targets: ".admin-sweet-card",
          translateY: [10, 0],
          opacity: [0, 1],
          delay: anime.stagger(80),
          duration: 500,
          easing: "easeOutCubic"
        });
      }, 50);
    }).catch(err => {
      console.error(err);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    anime({
      targets: formRef.current,
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 580,
      easing: "easeOutQuad"
    });
  }, []);

  const resetForm = () => {
    setName(""); setCategory(""); setPrice(""); setQuantity(1); setImageUrl("");
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2400);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 3000);
  };

  const add = async () => {
    setError(null);
    setSuccess(null);
    anime({ targets: btnRef.current, scale: [1, 0.96, 1], duration: 280, easing: "easeOutQuad" });

    if (!name.trim() || !category.trim() || !price) {
      showError("Name, category and price are required.");
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
      const created = await api.post("/sweets", payload, token);
      setList(prev => [created, ...prev]);
      resetForm();
      showSuccess("Sweet added");
      anime({
        targets: ".admin-sweet-card",
        translateY: [6, 0],
        opacity: [0.9, 1],
        duration: 450,
        easing: "easeOutBack"
      });
    } catch (err) {
      showError((err.payload && (err.payload.error || JSON.stringify(err.payload))) || err.message || "Create failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this sweet?")) return;
    try {
      await api.delete(`/sweets/${id}`, token);
      setList(prev => prev.filter(s => s._id !== id));
      showSuccess("Deleted");
    } catch (err) {
      showError("Delete failed");
    }
  };

  const restock = async (id, amount) => {
    try {
      const res = await api.post(`/sweets/${id}/restock`, { amount: Number(amount) }, token);
      setList(prev => prev.map(s => s._id === id ? (res.sweet || res) : s));
      showSuccess("Restocked");
    } catch (err) {
      showError("Restock failed");
    }
  };

  // NEW: handle update (PUT)
  const handleUpdate = async (id, payload) => {
    try {
      const updated = await api.put(`/sweets/${id}`, payload, token);
      // some APIs return the updated item directly; others return { sweet }
      const newSweet = updated && updated._id ? updated : (updated && updated.sweet) ? updated.sweet : null;
      if (newSweet) {
        setList(prev => prev.map(s => s._id === id ? newSweet : s));
      } else {
        // fallback - merge with payload
        setList(prev => prev.map(s => s._id === id ? { ...s, ...payload } : s));
      }
      setEditing(null);
      showSuccess("Updated");
    } catch (err) {
      console.error(err);
      throw err; // propagate so modal shows error
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div ref={formRef} style={{
        maxWidth: 980,
        margin: "0 auto 18px",
        padding: 18,
        borderRadius: 12,
        background: "linear-gradient(180deg,#ffffff,#fbfbff)",
        boxShadow: "0 12px 30px rgba(12,12,20,0.06)"
      }}>
        <h2 style={{ margin: 0 }}>Admin — Manage Sweets</h2>
        <p style={{ marginTop: 6, color: "#666" }}>Create and manage sweets visible to users.</p>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Sweet name" style={inputStyle} />
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" style={inputStyle} />
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" style={inputStyle} />
          <input value={quantity} onChange={e => {
              const v = e.target.value;
              if (/^\d*$/.test(v)) setQuantity(v);
            }}
            placeholder="Quantity"
            inputMode="numeric"
            style={inputStyle}
          />
          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL (optional)" style={inputStyle} />
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <button ref={btnRef} onClick={add} style={primaryBtnStyle}>Add Sweet</button>
          <button onClick={resetForm} style={ghostBtnStyle}>Reset</button>
          <div style={{ marginLeft: "auto", color: "#666", fontSize: 13 }}>{list.length} items</div>
        </div>

        {error && <div style={{ marginTop: 12, color: "crimson" }}>{error}</div>}
        {success && <div style={{ marginTop: 12, color: "#059669" }}>{success}</div>}
      </div>

      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 18
      }}>
        {list.map(s => (
          <div key={s._id} className="admin-sweet-card" style={{
            borderRadius: 12,
            background: "#fff",
            padding: 12,
            boxShadow: "0 10px 30px rgba(12,12,20,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            overflow: "hidden"
          }}>
            <div style={{ height: 140, borderRadius: 8, overflow: "hidden", background: "#fafafa" }}>
              <img src={s.imageUrl || "/placeholder-sweet.jpg"} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{s.name}</div>
                <div style={{ color: "#666", fontSize: 13 }}>{s.category}</div>
              </div>
              <div style={{ fontWeight: 800 }}>₹{s.price}</div>
            </div>

            <div style={{ color: s.quantity > 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
              {s.quantity} in stock
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button onClick={() => restock(s._id, 5)} style={miniBtnStyle}>+5</button>
              <button onClick={() => restock(s._id, 10)} style={miniBtnStyle}>+10</button>
              <button onClick={() => setEditing(s)} style={{ ...miniBtnStyle, background: "#8cec83ff" }}>Edit</button>
              <button onClick={() => remove(s._id)} style={dangerBtnStyle}>Delete</button>
              {/* <div style={{ marginLeft: "auto" }}>
                <small style={{ color: "#999" }}>id: {String(s._id).slice(-6)}</small>
              </div> */}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditSweetModal
          sweet={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}
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

const miniBtnStyle = {
  background: "#b5b5b5ff",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700
};

const dangerBtnStyle = {
  background: "#e68383ff",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700
};
