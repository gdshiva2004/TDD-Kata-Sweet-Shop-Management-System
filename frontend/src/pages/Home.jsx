import { useEffect, useState } from "react";
import api from "../utils/api";
import SweetCard from "../components/SweetCard";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import useAuth from "../hooks/useAuth";

export default function Home() {
  const { token } = useAuth();
  const [sweets, setSweets] = useState([]);

  useEffect(() => {
    api.get("/sweets").then(setSweets);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {!token && (
        <>
          <LoginForm />
          <RegisterForm />
        </>
      )}
      {sweets.map(s => <SweetCard key={s._id} sweet={s} />)}
    </div>
  );
}
