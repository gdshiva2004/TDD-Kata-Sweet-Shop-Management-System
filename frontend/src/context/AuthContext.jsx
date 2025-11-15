import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed) return null;
      if (parsed.password) delete parsed.password;
      return { id: parsed.id || null, name: parsed.name || null, email: parsed.email || null, role: parsed.role || null };
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (token) localStorage.setItem("token", token); else localStorage.removeItem("token");
    } catch {}
  }, [token]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem("user", JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }));
      else localStorage.removeItem("user");
    } catch {}
  }, [user]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (!res || !res.token) {
      const err = new Error("Login failed");
      err.payload = res;
      throw err;
    }
    setToken(res.token);
    setUser(res.user ? { id: res.user.id, name: res.user.name, email: res.user.email, role: res.user.role } : null);
    return res;
  };

  const register = async (payload) => {
    const res = await api.post("/auth/register", payload);
    if (!res || !res.token) {
      const err = new Error("Register failed");
      err.payload = res;
      throw err;
    }
    setToken(res.token);
    setUser(res.user ? { id: res.user.id, name: res.user.name, email: res.user.email, role: res.user.role } : null);
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ token, user, login, register, logout }}>{children}</AuthContext.Provider>;
};
