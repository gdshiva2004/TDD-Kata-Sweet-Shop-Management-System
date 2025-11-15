// src/components/SweetCard.jsx
import { useState, useRef, useEffect } from "react";
import useCart from "../hooks/useCart";
import anime from "animejs/lib/anime.es.js";

export default function SweetCard({ sweet, onBuy }) {
  const { cart, addToCart, updateQty, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const imgRef = useRef(null);
  const btnRef = useRef(null);

  // local optimistic stock shown on the card.
  // initialize from sweet.quantity and keep local copy to show immediate changes
  const [localStock, setLocalStock] = useState(typeof sweet.quantity === "number" ? sweet.quantity : 0);

  // find cart item
  const findCartItem = () => {
    if (!Array.isArray(cart)) return null;
    return cart.find(c => {
      // cart item shape may be { id, sweet, qty } or guest item may be { sweet, qty } etc.
      const cartSweetId = (c.sweet && (c.sweet._id || c.sweet.id)) || c._id || c.id;
      const sweetId = sweet._id || sweet.id;
      if (!cartSweetId || !sweetId) return false;
      return String(cartSweetId) === String(sweetId);
    }) || null;
  };

  // showCounter if item exists in cart
  const [showCounter, setShowCounter] = useState(Boolean(findCartItem()));
  const [qtyOnCard, setQtyOnCard] = useState(findCartItem() ? findCartItem().qty : 0);

  // keep local stock in sync when sweet prop changes (e.g. parent refreshed)
  useEffect(() => {
    setLocalStock(typeof sweet.quantity === "number" ? sweet.quantity : 0);
  }, [sweet && sweet.quantity]);

  // sync qty / showCounter with cart updates
  useEffect(() => {
    const it = findCartItem();
    setShowCounter(Boolean(it));
    setQtyOnCard(it ? it.qty : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart && cart.length]);

  const animateChange = () => {
    try {
      anime.remove(imgRef.current);
      anime.remove(btnRef.current);
      anime.timeline()
        .add({
          targets: imgRef.current,
          scale: [1, 1.06, 0.98, 1],
          translateY: [0, -8, 0],
          duration: 420,
          easing: "easeOutQuad"
        })
        .add({
          targets: btnRef.current,
          scale: [1, 1.08, 0.98, 1],
          duration: 420,
          easing: "easeOutElastic(1, .8)"
        }, "-=360");
    } catch (e) {}
  };

  // initial buy (add first unit)
  const handleBuy = async () => {
    if (!sweet || localStock <= 0 || loading) return;
    setLoading(true);
    try {
      if (onBuy) {
        await onBuy(sweet);
      } else {
        await addToCart(sweet, 1);
      }
      // optimistic reduce stock and show counter
      setLocalStock(prev => Math.max(0, (prev || 0) - 1));
      setQtyOnCard(prev => (prev || 0) + 1);
      setShowCounter(true);
      animateChange();
    } catch (err) {
      console.error("add failed", err);
    } finally {
      setLoading(false);
    }
  };

  // increment on card: add 1 to cart and reduce displayed stock by 1
  const handleInc = async () => {
    if (!sweet || localStock <= 0 || loading) return;
    setLoading(true);
    const prevStock = localStock;
    const prevQty = qtyOnCard;
    try {
      const it = findCartItem();
      if (it && it.id) {
        // server cart item: update via cart item id
        await updateQty(it.id, it.qty + 1);
      } else if (it && !it.id) {
        // guest/local cart item: update by sweet id or fallback to addToCart
        const identifier = it.sweet?._id || it._id || (sweet._id || sweet.id);
        if (identifier) await updateQty(identifier, it.qty + 1);
        else await addToCart(sweet, 1);
      } else {
        // not present - add
        await addToCart(sweet, 1);
      }

      // optimistic UI changes
      setLocalStock(prev => Math.max(0, (prev || 0) - 1));
      setQtyOnCard(prev => (prev || 0) + 1);
      setShowCounter(true);
      animateChange();
    } catch (err) {
      // revert optimistic changes if server call failed
      setLocalStock(prevStock);
      setQtyOnCard(prevQty);
      console.error("increment failed", err);
    } finally {
      setLoading(false);
    }
  };

  // decrement on card: reduce cart qty and increase displayed stock by 1 (or remove item)
  const handleDec = async () => {
    const it = findCartItem();
    if (!sweet || loading || !it) return;
    setLoading(true);
    const prevStock = localStock;
    const prevQty = qtyOnCard;
    try {
      const newQty = Math.max(0, (it.qty || 0) - 1);
      if (it.id) {
        if (newQty === 0) await removeFromCart(it.id);
        else await updateQty(it.id, newQty);
      } else {
        const identifier = it.sweet?._id || it._id || (sweet._id || sweet.id);
        if (newQty === 0) await removeFromCart(identifier);
        else await updateQty(identifier, newQty);
      }

      // optimistic UI reflect: free one unit back to stock
      setLocalStock(prev => (prev || 0) + 1);
      setQtyOnCard(prev => Math.max(0, (prev || 0) - 1));
      if ((qtyOnCard || it.qty || 1) - 1 <= 0) setShowCounter(false);
      animateChange();
    } catch (err) {
      // revert optimistic changes
      setLocalStock(prevStock);
      setQtyOnCard(prevQty);
      console.error("decrement failed", err);
    } finally {
      setLoading(false);
    }
  };

  // disable + when no local stock left
  const plusDisabled = loading || localStock <= 0;
  const minusDisabled = loading || (qtyOnCard || 0) <= 0;

  return (
    <div className="sweet-card" style={{
      padding: 14,
      borderRadius: 14,
      background: "#fff",
      boxShadow: "0 8px 20px rgba(12,12,20,0.04)",
      width: "100%",
      maxWidth: 260,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      overflow: "hidden",
    }}>
      <div style={{ height: 160, borderRadius: 10, overflow: "hidden", background: "#f7f7fb", position: "relative" }}>
        <img ref={imgRef} src={sweet.imageUrl || "/placeholder-sweet.jpg"} alt={sweet.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
        <div style={{
          position: "absolute", left: 10, top: 10, background: "rgba(0,0,0,0.6)", color: "#fff",
          padding: "6px 8px", borderRadius: 8, fontSize: 12, fontWeight: 700
        }}>{sweet.category}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>{sweet.name}</div>
        <div style={{ fontWeight: 800, color: "#111", padding: "4px 8px", borderRadius: 8 }}>₹{sweet.price}</div>
      </div>

      <div style={{ color: "#666", fontSize: 13, minHeight: 36 }}>
        {sweet.description ? sweet.description.slice(0, 120) + (sweet.description.length > 120 ? "…" : "") : "Delicious treat."}
      </div>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div style={{ color: localStock > 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
          {localStock > 0 ? `${localStock} in stock` : "Out of stock"}
        </div>

        {showCounter ? (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 10, padding: "6px 8px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.06)"
          }}>
            <button
              onClick={handleDec}
              disabled={minusDisabled}
              style={{ width: 38, height: 38, borderRadius: 8, border: "none", cursor: minusDisabled ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700, background: "#f3f4f6" }}
              aria-label={`Decrease ${sweet.name}`}
            >−</button>

            <div style={{ minWidth: 40, textAlign: "center", fontWeight: 800 }}>{qtyOnCard || 1}</div>

            <button
              ref={btnRef}
              onClick={handleInc}
              disabled={plusDisabled}
              style={{ width: 38, height: 38, borderRadius: 8, border: "none", cursor: plusDisabled ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700, background: "#f3f4f6" }}
              aria-label={`Increase ${sweet.name}`}
            >+</button>
          </div>
        ) : (
          <button
            ref={btnRef}
            onClick={handleBuy}
            disabled={localStock <= 0 || loading}
            style={{
              background: localStock > 0 ? "linear-gradient(90deg,#6a00c9,#9f00ff)" : "#ddd",
              color: localStock > 0 ? "#fff" : "#999", border: "none", padding: "8px 14px",
              borderRadius: 10, cursor: localStock > 0 && !loading ? "pointer" : "not-allowed", fontWeight: 700
            }}
            aria-label={`Buy ${sweet.name}`}
          >
            {loading ? "Adding…" : "Buy"}
          </button>
        )}
      </div>
    </div>
  );
}
