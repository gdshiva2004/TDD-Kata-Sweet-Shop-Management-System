import anime from "animejs";
import { useEffect, useRef } from "react";

export default function AnimatedCard({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    anime({
      targets: ref.current,
      opacity: [0, 1],
      translateY: [-40, 0],
      duration: 800,
      easing: "easeOutQuad"
    });
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        maxWidth: 400,
        margin: "80px auto",
        padding: 30,
        borderRadius: 12,
        border: "1px solid #ddd",
        background: "#ffffff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
      }}
    >
      {children}
    </div>
  );
}
