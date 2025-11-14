import { useEffect, useState } from "react";
import api from "../utils/api";
import SweetCard from "../components/SweetCard";

export default function Home() {
  const [sweets, setSweets] = useState([]);

  useEffect(() => {
    api.get("/sweets").then(setSweets);
  }, []);

  return (
    <div style={{ padding: 20 }}>
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
