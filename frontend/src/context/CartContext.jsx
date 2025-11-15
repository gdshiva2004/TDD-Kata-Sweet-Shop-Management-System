// src/context/CartContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../utils/api";
import useAuth from "../hooks/useAuth";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { token, user } = useAuth();

  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart_local") || "[]";
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [bump, setBump] = useState(0);

  // Sync cart when token/user changes. If logged in, merge server cart with local guest cart.
  useEffect(() => {
    let mounted = true;
    async function sync() {
      if (token) {
        setLoading(true);
        try {
          const serverCart = await api.get("/cart", token);
          if (!mounted) return;
          const merged = (serverCart && serverCart.items)
            ? serverCart.items.map(it => ({ id: it._id, sweet: it.sweet, qty: it.qty }))
            : [];

          // Merge local guest cart (if any)
          try {
            const rawLocal = localStorage.getItem("cart_local");
            const local = rawLocal ? JSON.parse(rawLocal) : [];
            for (const l of local) {
              // l might be an item or raw sweet object with qty
              const localSweetId = (l.sweet && (l.sweet._id || l.sweet.id)) || l._id || (l._id || (l.sweet && l.sweet._id));
              if (!localSweetId) continue;
              const found = merged.find(m => {
                const mSweetId = (m.sweet && (m.sweet._id || m.sweet.id)) || (m.sweet && m.sweet);
                return String(mSweetId) === String(localSweetId);
              });
              if (found) {
                // keep max qty
                found.qty = Math.max(found.qty || 0, l.qty || 0);
              } else {
                // push as guest-like entry (no cart item id)
                merged.push({ id: null, sweet: l.sweet || l, qty: l.qty || 1 });
              }
            }
          } catch (e) {
            // ignore local parse errors
            console.warn("Failed to merge local cart", e);
          }

          if (mounted) setCart(merged);
        } catch (err) {
          console.error("Cart sync failed", err);
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        // guest: load from localStorage
        try {
          const raw = localStorage.getItem("cart_local");
          if (raw) setCart(JSON.parse(raw));
          else setCart([]);
        } catch (e) {
          setCart([]);
        }
      }
    }
    sync();
    return () => { mounted = false; };
  }, [token, user]);

  // persist guest cart locally
  useEffect(() => {
    try {
      localStorage.setItem("cart_local", JSON.stringify(cart || []));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  // refreshCart: fetch canonical cart (server or local)
  const refreshCart = async () => {
    try {
      if (token) {
        const serverCart = await api.get("/cart", token);
        const items = (serverCart && serverCart.items)
          ? serverCart.items.map(it => ({ id: it._id, sweet: it.sweet, qty: it.qty }))
          : [];
        setCart(items);
      } else {
        const raw = localStorage.getItem("cart_local") || "[]";
        setCart(JSON.parse(raw));
      }
    } catch (err) {
      console.error("refreshCart failed", err);
    }
  };

  const addToCart = async (sweet, qty = 1) => {
    if (!sweet) return;
    qty = Number(qty || 1);
    if (qty <= 0) qty = 1;

    if (token) {
      try {
        await api.post("/cart", { sweetId: sweet._id, qty }, token);
        const serverCart = await api.get("/cart", token);
        const items = (serverCart && serverCart.items)
          ? serverCart.items.map(it => ({ id: it._id, sweet: it.sweet, qty: it.qty }))
          : [];
        setCart(items);
        setBump(b => b + 1);
        return items;
      } catch (err) {
        console.error("addToCart (server) failed", err);
        throw err;
      }
    } else {
      let addedItem = null;
      setCart(prev => {
        const prevCopy = Array.isArray(prev) ? [...prev] : [];
        const foundIdx = prevCopy.findIndex(i => String((i.sweet && (i.sweet._id || i.sweet.id)) || i._id || i.id) === String(sweet._id));
        if (foundIdx >= 0) {
          prevCopy[foundIdx] = { ...prevCopy[foundIdx], qty: (prevCopy[foundIdx].qty || 0) + qty };
          addedItem = prevCopy[foundIdx];
        } else {
          const item = { id: null, sweet, qty };
          prevCopy.push(item);
          addedItem = item;
        }
        try { localStorage.setItem("cart_local", JSON.stringify(prevCopy)); } catch (e) {}
        return prevCopy;
      });
      setBump(b => b + 1);
      return addedItem;
    }
  };

  const updateQty = async (cartItemIdOrSweetId, qty) => {
    qty = Number(qty || 0);
    if (Number.isNaN(qty) || qty < 0) return;

    if (token) {
      try {
        // first attempt: assume cartItemIdOrSweetId is a cart item id
        await api.put(`/cart/${cartItemIdOrSweetId}`, { qty }, token);
        const serverCart = await api.get("/cart", token);
        setCart((serverCart && serverCart.items) ? serverCart.items.map(it => ({ id: it._id, sweet: it.sweet, qty: it.qty })) : []);
        setBump(b => b + 1);
      } catch (err) {
        // fallback: maybe caller passed sweet id — find the cart item and update by its id
        try {
          const serverCart = await api.get("/cart", token);
          const items = (serverCart && serverCart.items) ? serverCart.items : [];
          const target = items.find(it => {
            const sid = (it.sweet && (it.sweet._id || it.sweet.id)) || it.sweet;
            return String(sid) === String(cartItemIdOrSweetId);
          });
          if (target && target._id) {
            await api.put(`/cart/${target._id}`, { qty }, token);
          }
          const refreshed = await api.get("/cart", token);
          setCart((refreshed && refreshed.items) ? refreshed.items.map(it => ({ id: it._id, sweet: it.sweet, qty: it.qty })) : []);
          setBump(b => b + 1);
        } catch (err2) {
          console.error("updateQty failed (server)", err, err2);
        }
      }
    } else {
      // guest/local flow
      setCart(prev => {
        const copy = Array.isArray(prev) ? [...prev] : [];
        const idx = copy.findIndex(i => String((i.sweet && (i.sweet._id || i.sweet.id)) || i._id || i.id) === String(cartItemIdOrSweetId));
        if (idx >= 0) {
          if (qty === 0) copy.splice(idx, 1);
          else copy[idx] = { ...copy[idx], qty };
        } else {
          // fallback match by sweet object id
          const idx2 = copy.findIndex(i => String((i.sweet && (i.sweet._id || i.sweet.id)) || i._id || i.id) === String(cartItemIdOrSweetId));
          if (idx2 >= 0) {
            if (qty === 0) copy.splice(idx2, 1);
            else copy[idx2] = { ...copy[idx2], qty };
          }
        }
        try { localStorage.setItem("cart_local", JSON.stringify(copy)); } catch (e) {}
        return copy;
      });
      setBump(b => b + 1);
    }
  };

  const removeFromCart = async (cartItemIdOrSweetId) => {
    if (!cartItemIdOrSweetId) return;

    if (token) {
      try {
        // attempt delete using provided id (assume cart-item id)
        await api.delete(`/cart/${cartItemIdOrSweetId}`, token);
        const serverCart = await api.get("/cart", token);
        setCart((serverCart && serverCart.items) ? serverCart.items.map(it => ({ id: it._id, sweet: it.sweet, qty: it.qty })) : []);
        setBump(b => b + 1);
        return;
      } catch (err) {
        // fallback: provided id might be sweet id - fetch server cart and find matching cart item
        try {
          const serverCart = await api.get("/cart", token);
          const items = (serverCart && serverCart.items) ? serverCart.items : [];
          const target = items.find(it => {
            const sid = (it.sweet && (it.sweet._id || it.sweet.id)) || it.sweet;
            return String(sid) === String(cartItemIdOrSweetId);
          });
          if (target && target._id) {
            await api.delete(`/cart/${target._id}`, token);
          }
          const refreshed = await api.get("/cart", token);
          setCart((refreshed && refreshed.items) ? refreshed.items.map(it => ({ id: it._id, sweet: it.sweet, qty: it.qty })) : []);
          setBump(b => b + 1);
          return;
        } catch (err2) {
          console.error("removeFromCart server fallback failed", err, err2);
          // attempt refresh as a last resort
          try { await refreshCart(); } catch (e) { console.error("refresh after failed remove", e); }
        }
      }
    } else {
      // guest/local flow
      setCart(prev => {
        try {
          const filtered = prev.filter(i => String((i.sweet && (i.sweet._id || i.sweet.id)) || i._id || i.id) !== String(cartItemIdOrSweetId));
          try { localStorage.setItem("cart_local", JSON.stringify(filtered)); } catch (e) {}
          return filtered;
        } catch (e) {
          // fallback: filter by top-level id
          const filtered2 = prev.filter(i => String(i._id || i.id) !== String(cartItemIdOrSweetId));
          try { localStorage.setItem("cart_local", JSON.stringify(filtered2)); } catch (e) {}
          return filtered2;
        }
      });
      setBump(b => b + 1);
      return;
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        const serverCart = await api.get("/cart", token);
        if (serverCart && serverCart.items) {
          for (const it of serverCart.items) {
            await api.delete(`/cart/${it._id}`, token);
          }
        }
        setCart([]);
        setBump(b => b + 1);
      } catch (err) {
        console.error("clearCart failed", err);
        setCart([]);
      }
    } else {
      setCart([]);
      try { localStorage.setItem("cart_local", JSON.stringify([])); } catch (e) {}
      setBump(b => b + 1);
    }
  };

  const checkout = async () => {
    if (!token) throw new Error("You must be logged in to checkout");
    const res = await api.post("/cart/checkout", {}, token);
    setCart([]);
    setBump(b => b + 1);
    try { localStorage.setItem("cart_local", JSON.stringify([])); } catch (e) {}
    return res;
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      checkout,
      bump,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
}
