import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import SweetCard from "../components/SweetCard";
import { FlashContext } from "../context/FlashContext";

export default function Home() {
  const [sweets, setSweets] = useState([]);
  const { flash } = useContext(FlashContext);

  useEffect(() => {
    api.get("/sweets").then(setSweets);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      
      {flash && (
        <div style={{
          background: flash.type === "success" ? "#d1f7d6" : "#f7d1d1",
          padding: "10px 16px",
          marginBottom: 20,
          borderRadius: 8,
          border: "1px solid #ccc",
          fontWeight: 500,
          color: "#333",
          textAlign: "center"
        }}>
          {flash.msg}
        </div>
      )}

      <h2>Available Sweets</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 20,
        marginTop: 20
      }}>
        {sweets.map(s => (
          <SweetCard key={s._id} sweet={s} />
        ))}
      </div>
    </div>
  );
}
