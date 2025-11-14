export default function SweetCard({ sweet }) {
  return (
    <div style={{
      padding: 16,
      border: "1px solid #ddd",
      borderRadius: 8,
      background: "#fff"
    }}>
      <h3 style={{ margin: "0 0 10px" }}>{sweet.name}</h3>
      <div style={{ fontSize: 16, marginBottom: 10 }}>
        Price: ₹{sweet.price}
      </div>
      <div style={{ opacity: 0.8 }}>ID: {sweet._id}</div>
    </div>
  );
}
