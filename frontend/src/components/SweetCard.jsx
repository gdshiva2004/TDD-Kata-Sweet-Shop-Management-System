export default function SweetCard({ sweet }) {
  return (
    <div style={{ padding: 12, border: "1px solid #ddd", marginBottom: 10 }}>
      <h3>{sweet.name}</h3>
      <p>{sweet.price}₹</p>
    </div>
  );
}
