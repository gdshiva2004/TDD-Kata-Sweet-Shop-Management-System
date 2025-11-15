// src/pages/CartPage.jsx (or src/components/CartPage.jsx)
import useCart from "../hooks/useCart";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { cart, addToCart, removeFromCart, updateQty, clearCart, checkout, loading, refreshCart } = useCart();
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ensure we have canonical data
    if (refreshCart) refreshCart().catch(e => console.error(e));
  }, [refreshCart]);

  const total = (cart || []).reduce((s, it) => s + ((it.sweet?.price || it.price || 0) * (it.qty || 1)), 0);

  const doCheckout = async () => {
    if (!token) {
      alert('Please login to checkout');
      navigate('/login');
      return;
    }
    try {
      setBusy(true);
      await checkout();
      alert('Order placed!');
      navigate('/');
    } catch (err) {
      alert((err && (err.error || err.message)) || 'Checkout failed');
    } finally { setBusy(false); }
  };

  // small shared style objects
  const btnBase = {
    border: 'none',
    padding: '8px 12px',
    borderRadius: 10,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(12,12,20,0.06)'
  };

  const iconBtn = {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Cart</h2>
      {(!cart || cart.length === 0) && <div>No items in your cart.</div>}
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {(cart || []).map(item => {
          const sweet = item.sweet || item;
          const id = item.id || (sweet && (sweet._id || sweet.id));
          return (
            <div key={id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 6px 18px rgba(12,12,20,0.03)' }}>
              <img src={sweet.imageUrl || '/placeholder-sweet.jpg'} alt={sweet.name} width={72} height={72} style={{ objectFit: 'cover', borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{sweet.name}</div>
                <div style={{ color: '#666', marginTop: 4 }}>₹{sweet.price}</div>

                <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => updateQty(id, Math.max(1, item.qty - 1))}
                    disabled={loading}
                    aria-label="Decrease quantity"
                    style={{
                      ...iconBtn,
                      background: '#f3f4f6',
                      color: '#111',
                      boxShadow: 'none'
                    }}
                  >−</button>

                  <div style={{ minWidth: 40, textAlign: 'center', fontWeight: 800, fontSize: 15 }}>{item.qty}</div>

                  <button
                    onClick={() => updateQty(id, item.qty + 1)}
                    disabled={loading}
                    aria-label="Increase quantity"
                    style={{
                      ...iconBtn,
                      background: '#f3f4f6',
                      color: '#111',
                      boxShadow: 'none'
                    }}
                  >+</button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>₹{(sweet.price || 0) * item.qty}</div>

                <button
                  onClick={async () => {
                    // optimistic UI is handled in CartContext now; call remove and refresh for safety
                    await removeFromCart(item.id || (sweet._id || sweet.id));
                    if (refreshCart) await refreshCart().catch(e => console.error(e));
                  }}
                  style={{
                    ...btnBase,
                    marginTop: 8,
                    background: 'linear-gradient(90deg,#fff,#fff)',
                    color: '#ef4444',
                    boxShadow: 'none',
                    border: '1px solid #fee2e2'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {cart && cart.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Total: ₹{total}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={doCheckout}
              disabled={busy}
              style={{
                ...btnBase,
                background: 'linear-gradient(90deg,#6a00c9,#9f00ff)',
                color: '#fff',
                padding: '10px 18px'
              }}
            >
              {busy ? 'Processing…' : 'Checkout'}
            </button>

            <button
              onClick={async () => {
                await clearCart();
                if (refreshCart) await refreshCart().catch(e => console.error(e));
              }}
              style={{
                ...btnBase,
                background: '#fff',
                color: '#374151',
                border: '1px solid #e5e7eb'
              }}
            >
              Clear cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
