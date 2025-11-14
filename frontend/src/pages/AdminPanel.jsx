import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import api from "../utils/api";

export default function AdminPanel() {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/sweets", token).then(setList);
  }, []);

  const add = async () => {
    await api.post("/sweets", { name, price }, token);
    const updated = await api.get("/sweets", token);
    setList(updated);
  };

  return (
    <div style={{ padding: 20 }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Sweet Name" />
      <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" />
      <button onClick={add}>Add Sweet</button>

      {list.map(s => (
        <div key={s._id}>{s.name} - {s.price}</div>
      ))}
    </div>
  );
}
